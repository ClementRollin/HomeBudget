import Link from "next/link";
import { redirect } from "next/navigation";

import { formatCurrency } from "@/lib/format";
import { computeSheetMetrics, getMonthLabel } from "@/lib/sheets";
import { requireFamilySession } from "@/lib/tenant";
import { sheetRepository } from "@/lib/repositories/sheets";

const SheetsPage = async () => {
  const familyContext = await requireFamilySession().catch(() => null);
  if (!familyContext) {
    redirect("/");
  }

  const sheets = await sheetRepository.listAllWithDetails(familyContext.familyId);
  const annualTotals = Object.entries(
    sheets.reduce<Record<number, { income: number; expenses: number; budgets: number }>>(
      (acc, sheet) => {
        const metrics = computeSheetMetrics(sheet);
        acc[sheet.year] = acc[sheet.year] ?? { income: 0, expenses: 0, budgets: 0 };
        acc[sheet.year].income += metrics.income;
        acc[sheet.year].expenses += metrics.expenses;
        acc[sheet.year].budgets += metrics.budgets;
        return acc;
      },
      {},
    ),
  ).sort(([yearA], [yearB]) => Number(yearB) - Number(yearA));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3rem] text-slate-500">Historique</p>
          <h1 className="text-3xl font-semibold text-white">Fiches de compte mensuelles</h1>
          <p className="text-sm text-slate-400">
            Consultez l&apos;ensemble des fiches enregistrees, modifiez-les ou supprimez-les.
          </p>
        </div>
        <Link
          href="/sheets/new"
          className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold uppercase tracking-widest text-slate-900"
        >
          Nouvelle fiche de compte
        </Link>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/5 bg-black/30">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3rem] text-slate-500">Synthèse annuelle</p>
            <p className="text-sm text-slate-400">
              Revenus, charges + budgets, et solde cumulés par année.
            </p>
          </div>
        </div>
        <table className="min-w-full text-left text-sm border-t border-white/5">
          <thead className="text-xs uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-6 py-4">Année</th>
              <th className="px-6 py-4">Revenus</th>
              <th className="px-6 py-4">Charges + Budgets</th>
              <th className="px-6 py-4">Solde</th>
            </tr>
          </thead>
          <tbody>
            {annualTotals.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-sm text-slate-400" colSpan={4}>
                  Aucun historique annuel pour le moment.
                </td>
              </tr>
            ) : (
              annualTotals.map(([year, totals]) => {
                const combinedExpenses = totals.expenses + totals.budgets;
                const annualBalance = totals.income - combinedExpenses;
                return (
                <tr key={year} className="border-t border-white/5">
                  <td className="px-6 py-4 font-semibold text-white">{year}</td>
                  <td className="px-6 py-4 text-slate-300">{formatCurrency(totals.income)}</td>
                  <td className="px-6 py-4 text-rose-300">
                    {formatCurrency(combinedExpenses)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">
                    {formatCurrency(annualBalance)}
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/5 bg-black/30">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-6 py-4">Mois</th>
              <th className="px-6 py-4">Salaires</th>
              <th className="px-6 py-4">Charges</th>
              <th className="px-6 py-4">Budgets</th>
              <th className="px-6 py-4">Solde</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {sheets.length === 0 && (
              <tr>
                <td className="px-6 py-8 text-center text-slate-400" colSpan={6}>
                  Pas encore de fiches enregistrees.
                </td>
              </tr>
            )}
            {sheets.map((sheet) => {
              const metrics = computeSheetMetrics(sheet);
              return (
                <tr key={sheet.id} className="border-t border-white/5">
                  <td className="px-6 py-4 font-semibold text-white">
                    {getMonthLabel(sheet.month, sheet.year)}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {formatCurrency(metrics.income)}
                  </td>
                  <td className="px-6 py-4 text-rose-300">
                    {formatCurrency(metrics.expenses)}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {formatCurrency(metrics.budgets)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">
                    {formatCurrency(metrics.balance)}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/sheets/${sheet.id}`}
                      className="text-sm text-accent underline-offset-4 hover:underline"
                    >
                      Consulter
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SheetsPage;
