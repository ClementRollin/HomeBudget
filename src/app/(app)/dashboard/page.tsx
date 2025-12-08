import { redirect } from "next/navigation";
import Link from "next/link";

import StatCard from "@/components/dashboard/StatCard";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { computeSheetMetrics, getCurrentPeriod, getMonthLabel } from "@/lib/sheets";
import { getCurrentSession } from "@/lib/auth";

const DashboardPage = async () => {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/");
  }

  const period = getCurrentPeriod();
  const [currentSheet, history] = await Promise.all([
    prisma.sheet.findFirst({
      where: { month: period.month, year: period.year, familyId: session.user.familyId },
      include: { salaries: true, charges: true, budgets: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.sheet.findMany({
      include: { salaries: true, charges: true, budgets: true },
      where: { familyId: session.user.familyId },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
      ],
      take: 5,
    }),
  ]);

  const metrics = currentSheet ? computeSheetMetrics(currentSheet) : null;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenus cumulés"
          value={formatCurrency(metrics?.income ?? 0)}
          helper={getMonthLabel(period.month, period.year)}
        />
        <StatCard
          label="Charges prévues"
          variant="negative"
          value={formatCurrency(metrics?.expenses ?? 0)}
          helper="Toutes catégories"
        />
        <StatCard
          label="Budgets"
          value={formatCurrency(metrics?.budgets ?? 0)}
          helper="Enveloppes du mois"
        />
        <StatCard
          label="Solde prévisionnel"
          variant={(metrics?.balance ?? 0) >= 0 ? "positive" : "negative"}
          value={formatCurrency(metrics?.balance ?? 0)}
          helper={currentSheet ? "Basé sur la fiche active" : "Créez une fiche"}
        />
      </section>

      <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Dernières fiches</h2>
            <p className="text-sm text-slate-400">Historique rapide des 5 derniers mois suivis.</p>
          </div>
          <Link
            href="/sheets"
            className="text-sm text-accent underline-offset-4 hover:underline"
          >
            Voir tout l&apos;historique
          </Link>
        </div>
        <div className="mt-6 space-y-4">
          {history.length === 0 && (
            <p className="text-sm text-slate-400">
              Aucune fiche enregistrée pour le moment. Créez-en une nouvelle dès maintenant !
            </p>
          )}
          {history.map((sheet) => {
            const sheetMetrics = computeSheetMetrics(sheet);
            return (
              <Link
                key={sheet.id}
                href={`/sheets/${sheet.id}`}
                className="flex flex-col rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:border-accent/50 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-lg font-semibold text-white">
                    {getMonthLabel(sheet.month, sheet.year)}
                  </p>
                  <p className="text-sm text-slate-400">
                    {sheet.salaries.length} salaires • {sheet.charges.length} charges • {sheet.budgets.length} budgets
                  </p>
                </div>
                <div className="mt-3 flex gap-6 md:mt-0">
                  <div>
                    <p className="text-xs text-slate-400">Solde</p>
                    <p className="font-semibold text-white">
                      {formatCurrency(sheetMetrics.balance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Charges</p>
                    <p className="font-semibold text-rose-300">
                      {formatCurrency(sheetMetrics.expenses)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
