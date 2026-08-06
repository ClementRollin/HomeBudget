import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { decryptAsset, decryptDebt, decryptGoal } from "@/lib/patrimoine";
import { decryptNumber } from "@/lib/crypto";
import { formatCurrency } from "@/lib/format";
import { ASSET_TYPE_LABELS } from "@/lib/validations/patrimoine";
import { MONTH_NAMES } from "@/lib/sheets";
import { getFamilySubscription, getActivePlan } from "@/lib/subscription";
import AssetManager from "@/components/patrimoine/AssetManager";
import DebtTracker from "@/components/patrimoine/DebtTracker";
import GoalManager from "@/components/patrimoine/GoalManager";
import PortfolioChart, { type PortfolioDataPoint } from "@/components/patrimoine/PortfolioChart";

const PatrimoinePage = async () => {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/");

  const [rawAssets, rawDebts, rawGoals, sub, rawSnapshots] = await Promise.all([
    prisma.asset.findMany({ where: { familyId: session.user.familyId }, orderBy: { createdAt: "desc" } }),
    prisma.debt.findMany({ where: { familyId: session.user.familyId }, orderBy: { createdAt: "desc" } }),
    prisma.patrimonialGoal.findMany({ where: { familyId: session.user.familyId }, orderBy: { horizon: "asc" } }),
    getFamilySubscription(session.user.familyId),
    prisma.assetSnapshot.findMany({
      where: { asset: { familyId: session.user.familyId } },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    }),
  ]);

  const plan = getActivePlan(sub.subscriptionStatus, sub.subscriptionEndsAt);

  const assets = rawAssets.map(decryptAsset);
  const debts = rawDebts.map(decryptDebt);
  const goals = rawGoals.map(decryptGoal);

  // Agrégation des snapshots par (year, month)
  const snapshotMap = new Map<string, number>();
  for (const snap of rawSnapshots) {
    const key = `${snap.year}-${String(snap.month).padStart(2, "0")}`;
    snapshotMap.set(key, (snapshotMap.get(key) ?? 0) + decryptNumber(snap.encryptedValue));
  }
  const portfolioHistory: PortfolioDataPoint[] = [...snapshotMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, total]) => {
      const [year, month] = key.split("-");
      return { label: `${MONTH_NAMES[parseInt(month) - 1]?.slice(0, 3)} ${year}`, total };
    });

  // Métriques de synthèse
  const totalPatrimoine = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalInvested = assets.reduce((sum, a) => sum + a.totalInvested, 0);
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const patrimoineNet = totalPatrimoine - totalDebt;

  // Répartition par type
  const byType = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] ?? 0) + a.currentValue;
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      {/* En-tête + KPIs */}
      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900/60 p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.35rem] text-slate-500">Bilan</p>
          <h1 className="text-3xl font-semibold text-white">Patrimoine</h1>
          <p className="mt-1 text-sm text-slate-400">Vue consolidée de vos actifs, dettes et objectifs.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Actifs bruts", value: formatCurrency(totalPatrimoine), helper: "Valeur de marché" },
            { label: "Investi total", value: formatCurrency(totalInvested), helper: "Capital engagé" },
            { label: "Dettes", value: formatCurrency(totalDebt), helper: "Solde restant dû", negative: true },
            { label: "Patrimoine net", value: formatCurrency(patrimoineNet), helper: "Actifs − Dettes", positive: patrimoineNet >= 0 },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.25rem] text-slate-500">{card.label}</p>
              <p
                className={`mt-3 text-2xl font-semibold ${
                  card.negative
                    ? "text-rose-300"
                    : card.positive !== undefined
                      ? card.positive
                        ? "text-emerald-300"
                        : "text-rose-300"
                      : "text-white"
                }`}
              >
                {card.value}
              </p>
              <p className="mt-1 text-xs text-slate-400">{card.helper}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Évolution du patrimoine */}
      {portfolioHistory.length >= 2 && (
        <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
          <h2 className="mb-1 text-xl font-semibold text-white">Évolution du patrimoine</h2>
          <p className="mb-6 text-sm text-slate-400">Valeur totale des actifs par mois (snapshots).</p>
          <PortfolioChart data={portfolioHistory} />
        </section>
      )}

      {/* Répartition par type */}
      {assets.length > 0 && (
        <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Répartition par type</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(byType)
              .sort((a, b) => b[1] - a[1])
              .map(([type, value]) => (
                <div key={type} className="rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-3">
                  <p className="text-xs text-slate-400">
                    {ASSET_TYPE_LABELS[type as keyof typeof ASSET_TYPE_LABELS] ?? type}
                  </p>
                  <p className="mt-1 font-semibold text-white">{formatCurrency(value)}</p>
                  <p className="text-xs text-slate-500">
                    {totalPatrimoine > 0 ? `${((value / totalPatrimoine) * 100).toFixed(1)} %` : "—"}
                  </p>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Actifs */}
      <AssetManager initialAssets={assets} plan={plan} />

      {/* Dettes */}
      <DebtTracker initialDebts={debts} plan={plan} />

      {/* Objectifs */}
      <GoalManager initialGoals={goals} plan={plan} />
    </div>
  );
};

export default PatrimoinePage;
