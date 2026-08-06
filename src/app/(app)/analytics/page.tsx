import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { decryptSheet, computeSheetMetrics, MONTH_NAMES } from "@/lib/sheets";
import { formatCurrency } from "@/lib/format";
import BudgetChart, { type BudgetDataPoint } from "@/components/analytics/BudgetChart";

const CHARGE_CATEGORY_LABELS: Record<string, string> = {
  FIXE_COMMUN: "Charges fixes communes",
  FIXE_INDIVIDUEL: "Charges fixes individuelles",
  EXCEPTIONNEL_COMMUN: "Charges exceptionnelles communes",
  EXCEPTIONNEL_INDIVIDUEL: "Charges exceptionnelles individuelles",
};

const AnalyticsPage = async () => {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/");

  const rawSheets = await prisma.sheet.findMany({
    where: { familyId: session.user.familyId },
    orderBy: [{ year: "asc" }, { month: "asc" }],
    include: {
      salaries: { include: { member: true } },
      charges: { include: { member: true } },
      budgets: true,
    },
  });

  const sheets = rawSheets.map(decryptSheet);

  // Données mensuelles pour le graphique
  const chartData: BudgetDataPoint[] = sheets.map((sheet) => {
    const metrics = computeSheetMetrics(sheet);
    return {
      label: `${MONTH_NAMES[sheet.month - 1]?.slice(0, 3)} ${sheet.year}`,
      income: metrics.income,
      expenses: metrics.expenses,
      balance: metrics.balance,
    };
  });

  // KPIs globaux
  const totalIncome = sheets.reduce((s, sh) => s + computeSheetMetrics(sh).income, 0);
  const totalExpenses = sheets.reduce((s, sh) => s + computeSheetMetrics(sh).expenses, 0);
  const totalBalance = totalIncome - totalExpenses;
  const avgBalance = sheets.length > 0 ? totalBalance / sheets.length : 0;
  const savingsRate = totalIncome > 0 ? totalBalance / totalIncome : 0;

  // Répartition des charges par catégorie
  const chargeByCategory: Record<string, number> = {};
  for (const sheet of sheets) {
    for (const charge of sheet.charges) {
      chargeByCategory[charge.type] = (chargeByCategory[charge.type] ?? 0) + charge.amount;
    }
  }

  return (
    <div className="space-y-10">
      {/* En-tête */}
      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900/60 p-8">
        <p className="text-xs uppercase tracking-[0.35rem] text-slate-500">Budget</p>
        <h1 className="text-3xl font-semibold text-white">Analytiques</h1>
        <p className="mt-1 text-sm text-slate-400">
          Vue agrégée de vos revenus et charges sur {sheets.length} fiche{sheets.length !== 1 ? "s" : ""}.
        </p>
      </section>

      {sheets.length === 0 ? (
        <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
          <p className="text-sm text-slate-400">
            Aucune fiche de compte enregistrée. Créez votre première fiche pour voir les analytiques.
          </p>
        </section>
      ) : (
        <>
          {/* KPIs */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Revenus cumulés", value: formatCurrency(totalIncome), helper: `${sheets.length} mois` },
              { label: "Charges cumulées", value: formatCurrency(totalExpenses), helper: "Total sorties", negative: true },
              { label: "Solde cumulé", value: formatCurrency(totalBalance), helper: "Épargne nette", positive: totalBalance >= 0 },
              {
                label: "Taux d'épargne",
                value: `${(savingsRate * 100).toFixed(1)} %`,
                helper: `Moy. ${formatCurrency(avgBalance)}/mois`,
                positive: savingsRate >= 0,
              },
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
          </section>

          {/* Graphique mensuel */}
          {chartData.length >= 2 && (
            <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
              <h2 className="mb-1 text-xl font-semibold text-white">Revenus vs Charges</h2>
              <p className="mb-6 text-sm text-slate-400">Évolution mensuelle sur l&apos;historique disponible.</p>
              <BudgetChart data={chartData} />
            </section>
          )}

          {/* Répartition charges par catégorie */}
          {Object.keys(chargeByCategory).length > 0 && (
            <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Charges par catégorie</h2>
              <div className="flex flex-wrap gap-3">
                {Object.entries(chargeByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, total]) => (
                    <div key={cat} className="rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-3">
                      <p className="text-xs text-slate-400">
                        {CHARGE_CATEGORY_LABELS[cat] ?? cat}
                      </p>
                      <p className="mt-1 font-semibold text-white">{formatCurrency(total)}</p>
                      <p className="text-xs text-slate-500">
                        {totalExpenses > 0 ? `${((total / totalExpenses) * 100).toFixed(1)} %` : "—"}
                      </p>
                    </div>
                  ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
