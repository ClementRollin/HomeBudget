import { redirect } from "next/navigation";
import Link from "next/link";

import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { computeSheetMetrics, decryptSheet, getMonthLabel } from "@/lib/sheets";
import type { SecureSheet } from "@/lib/sheets";
import { getCurrentSession } from "@/lib/auth";

const SheetsPage = async () => {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/");
  }

  const secureSheets = (await prisma.sheet.findMany({
    include: {
      salaries: { include: { member: true } },
      charges: { include: { member: true } },
      budgets: true,
    },
    where: { familyId: session.user.familyId },
    orderBy: [
      { year: "desc" },
      { month: "desc" },
    ],
  })) as SecureSheet[];

  const sheets = secureSheets.map(decryptSheet);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3rem] text-slate-500">Historique</p>
          <h1 className="text-3xl font-semibold text-white">Fiches de compte mensuelles</h1>
          <p className="text-sm text-slate-400">
            Retrouvez toutes les fiches de compte archivées, modifiez-les ou supprimez-les.
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
                  Pas encore de fiches de compte créées.
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
