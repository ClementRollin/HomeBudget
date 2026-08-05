import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { decryptAsset, decryptDebt, decryptGoal } from "@/lib/patrimoine";
import { decryptSheet, computeSheetMetrics, getCurrentPeriod, type SecureSheet } from "@/lib/sheets";
import { computeFiscalSummary } from "@/lib/fiscalite";
import { decryptNumber } from "@/lib/crypto";
import { formatCurrency, formatPercent } from "@/lib/format";
import { ASSET_TYPE_LABELS } from "@/lib/validations/patrimoine";
import {
  computeCFOMetrics,
  computeGoalProgress,
  computeCFOAlerts,
} from "@/lib/cfo";

const includeConfig = {
  salaries: { include: { member: true } },
  charges: { include: { member: true } },
  budgets: true,
};

const BilanPage = async () => {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/");

  const currentYear = getCurrentPeriod().year;

  const [rawAssets, rawDebts, rawGoals, yearSheets, rawFiscalConfig] = await Promise.all([
    prisma.asset.findMany({
      where: { familyId: session.user.familyId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.debt.findMany({
      where: { familyId: session.user.familyId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.patrimonialGoal.findMany({
      where: { familyId: session.user.familyId },
      orderBy: { horizon: "asc" },
    }),
    prisma.sheet.findMany({
      where: { familyId: session.user.familyId },
      include: includeConfig,
      orderBy: [{ year: "asc" }, { month: "asc" }],
      take: 12,
    }) as Promise<SecureSheet[]>,
    prisma.fiscalConfig.findUnique({ where: { familyId: session.user.familyId } }),
  ]);

  const assets = rawAssets.map(decryptAsset);
  const debts = rawDebts.map(decryptDebt);
  const goals = rawGoals.map(decryptGoal);
  const sheets = yearSheets.map(decryptSheet);
  const sheetMetrics = sheets.map(computeSheetMetrics);

  const perContribYTD = rawFiscalConfig?.encryptedPerContribYTD
    ? decryptNumber(rawFiscalConfig.encryptedPerContribYTD)
    : 0;
  const isCoupled = rawFiscalConfig?.isCoupled ?? false;
  const avAssets = assets.filter((a) => a.type === "ASSURANCE_VIE");

  const cfoMetrics = computeCFOMetrics({ assets, debts, sheetMetrics });
  const goalProgress = computeGoalProgress(goals, cfoMetrics.netWorth, currentYear);
  const fiscalSummary = computeFiscalSummary({
    sheetMetrics,
    perContribYTD,
    isCoupled,
    avAssets,
  });
  const alerts = computeCFOAlerts(cfoMetrics, goalProgress, fiscalSummary.alerts);

  const byType = assets.reduce<Record<string, number>>((acc, asset) => {
    acc[asset.type] = (acc[asset.type] ?? 0) + asset.currentValue;
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      {/* 1. En-tête + 6 KPI cards */}
      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900/60 p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.35rem] text-slate-500">Bilan CFO</p>
          <h1 className="text-3xl font-semibold text-white">Vue consolidée</h1>
          <p className="mt-1 text-sm text-slate-400">
            Synthèse complète de votre situation patrimoniale et financière.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {[
            {
              label: "Patrimoine brut",
              value: formatCurrency(cfoMetrics.totalAssets),
              helper: "Total des actifs",
              className: "text-white",
            },
            {
              label: "Dettes",
              value: formatCurrency(cfoMetrics.totalDebt),
              helper: "Encours total",
              className: "text-rose-300",
            },
            {
              label: "Patrimoine net",
              value: formatCurrency(cfoMetrics.netWorth),
              helper: "Actifs − dettes",
              className: cfoMetrics.netWorth >= 0 ? "text-emerald-300" : "text-rose-300",
            },
            {
              label: "Revenu moyen / mois",
              value: formatCurrency(cfoMetrics.avgMonthlyIncome),
              helper: `Sur ${cfoMetrics.monthsOfData} mois`,
              className: "text-white",
            },
            {
              label: "Taux d'épargne moyen",
              value: formatPercent(cfoMetrics.avgSavingsRate, "fr-FR", 1),
              helper: "Cible : 20 %",
              className: cfoMetrics.avgSavingsRate >= 0.2 ? "text-emerald-300" : "text-amber-400",
            },
            {
              label: "Mensualités dettes",
              value: formatCurrency(cfoMetrics.totalMonthlyDebt),
              helper: "Remboursements / mois",
              className: "text-rose-300",
            },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.25rem] text-slate-500">{card.label}</p>
              <p className={`mt-3 text-2xl font-semibold ${card.className}`}>{card.value}</p>
              <p className="mt-1 text-xs text-slate-400">{card.helper}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Alertes CFO */}
      {alerts.length > 0 && (
        <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Alertes</h2>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={
                  alert.type === "danger"
                    ? "rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4"
                    : alert.type === "warning"
                      ? "rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4"
                      : "rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4"
                }
              >
                <p
                  className={
                    alert.type === "danger"
                      ? "text-sm text-rose-300"
                      : alert.type === "warning"
                        ? "text-sm text-amber-300"
                        : "text-sm text-blue-300"
                  }
                >
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Objectifs patrimoniaux */}
      <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Objectifs patrimoniaux</h2>
        {goalProgress.length > 0 ? (
          <div className="space-y-5">
            {goalProgress.map((g) => (
              <div key={g.id}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-white">{g.label}</span>
                  <span className="text-slate-400">{g.horizon}</span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>
                    {formatCurrency(cfoMetrics.netWorth)} / {formatCurrency(g.target)}
                  </span>
                  <span>{g.progress.toFixed(0)} %</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-white/10">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      g.progress >= 100
                        ? "bg-emerald-400"
                        : g.atRisk
                          ? "bg-rose-400"
                          : "bg-accent"
                    }`}
                    style={{ width: `${Math.min(100, g.progress).toFixed(1)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {g.gap > 0 ? `${formatCurrency(g.gap)} restants` : "Objectif atteint ✓"}
                  {g.yearsLeft > 0
                    ? ` · ${g.yearsLeft} an${g.yearsLeft > 1 ? "s" : ""}`
                    : ""}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Aucun objectif défini.{" "}
            <Link href="/patrimoine" className="text-accent underline-offset-2 hover:underline">
              Ajouter un objectif →
            </Link>
          </p>
        )}
      </section>

      {/* 4. Répartition des actifs */}
      {assets.length > 0 && (
        <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Répartition des actifs</h2>
          <div className="space-y-4">
            {Object.entries(byType)
              .sort((a, b) => b[1] - a[1])
              .map(([type, value]) => (
                <div key={type}>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">
                      {ASSET_TYPE_LABELS[type as keyof typeof ASSET_TYPE_LABELS] ?? type}
                    </span>
                    <span className="text-slate-300">
                      {formatCurrency(value)}&ensp;—&ensp;
                      {cfoMetrics.totalAssets > 0
                        ? ((value / cfoMetrics.totalAssets) * 100).toFixed(1)
                        : "0"}{" "}
                      %
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-white/10">
                    <div
                      className="h-1.5 rounded-full bg-accent"
                      style={{
                        width: `${
                          cfoMetrics.totalAssets > 0
                            ? ((value / cfoMetrics.totalAssets) * 100).toFixed(1)
                            : "0"
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* 5. Agenda de remboursement des dettes */}
      {debts.length > 0 && (
        <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Agenda de remboursement</h2>
          <div className="space-y-3">
            {debts.map((debt) => {
              const endDate = debt.monthsRemaining
                ? (() => {
                    const d = new Date();
                    d.setMonth(d.getMonth() + debt.monthsRemaining);
                    return d.toLocaleDateString("fr-FR", {
                      month: "long",
                      year: "numeric",
                    });
                  })()
                : debt.endDate
                  ? new Date(debt.endDate).toLocaleDateString("fr-FR", {
                      month: "long",
                      year: "numeric",
                    })
                  : "Indéterminée";

              return (
                <div
                  key={debt.id}
                  className="flex flex-col rounded-2xl border border-white/5 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-white">{debt.label}</p>
                    <p className="text-xs text-slate-400">
                      Solde : {formatCurrency(debt.balance)} · Taux : {debt.rate} %
                    </p>
                  </div>
                  <div className="mt-3 text-right sm:mt-0">
                    <p className="text-sm text-slate-300">
                      {formatCurrency(debt.monthlyPayment)} / mois
                    </p>
                    <p className="text-xs text-slate-400">Fin estimée : {endDate}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Liens rapides */}
      <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Accès rapide</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/patrimoine"
            className="rounded-2xl border border-white/5 bg-white/[0.04] p-5 transition hover:bg-white/[0.08]"
          >
            <p className="font-semibold text-white">Patrimoine</p>
            <p className="mt-1 text-xs text-slate-400">Actifs, dettes et objectifs</p>
          </Link>
          <Link
            href="/fiscalite"
            className="rounded-2xl border border-white/5 bg-white/[0.04] p-5 transition hover:bg-white/[0.08]"
          >
            <p className="font-semibold text-white">Fiscalité</p>
            <p className="mt-1 text-xs text-slate-400">PER, AV et optimisation</p>
          </Link>
          <Link
            href="/sheets"
            className="rounded-2xl border border-white/5 bg-white/[0.04] p-5 transition hover:bg-white/[0.08]"
          >
            <p className="font-semibold text-white">Fiches</p>
            <p className="mt-1 text-xs text-slate-400">Historique des revenus et charges</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default BilanPage;
