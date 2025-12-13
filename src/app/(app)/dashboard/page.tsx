import { redirect } from "next/navigation";
import Link from "next/link";

import StatCard from "@/components/dashboard/StatCard";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import {
  aggregateSheetMetrics,
  computeIncomeDistribution,
  computeMemberBalances,
  computeSheetMetrics,
  getCurrentPeriod,
  getMonthLabel,
  normalizeSheetCharges,
} from "@/lib/sheets";
import { getCurrentSession } from "@/lib/auth";
import { buildMemberLabels } from "@/lib/utils";

const DashboardPage = async () => {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/");
  }

  const period = getCurrentPeriod();
  const [currentSheet, history, yearSheets, members] = await Promise.all([
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
    prisma.sheet.findMany({
      include: { salaries: true, charges: true, budgets: true },
      where: { familyId: session.user.familyId, year: period.year },
    }),
    prisma.user.findMany({
      where: { familyId: session.user.familyId },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const currentMetrics = currentSheet ? computeSheetMetrics(currentSheet) : null;
  const yearMetrics = aggregateSheetMetrics(yearSheets);
  const monthLabel = getMonthLabel(period.month, period.year);
  const firstName = session.user.name?.split(/\s+/)[0] ?? session.user.familyName ?? "famille";

  const currentMemberSnapshot = currentSheet
    ? (() => {
        const normalizedCharges = normalizeSheetCharges(currentSheet);
        const incomeDistribution = computeIncomeDistribution(currentSheet);
        const labels = buildMemberLabels(
          members,
          incomeDistribution.distribution.map((item) => item.person || "Membre"),
        );
        const totalBudgets = currentSheet.budgets.reduce(
          (sum, budget) => sum + Number(budget.amount ?? 0),
          0,
        );
        return computeMemberBalances({
          normalizedCharges,
          distribution: incomeDistribution,
          totalBudgets,
          memberLabels: labels,
        });
      })()
    : null;

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/5 bg-linear-to-br from-slate-950 via-slate-900 to-slate-900/60 p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35rem] text-slate-500">Vue d&apos;ensemble</p>
            <h1 className="text-3xl font-semibold text-white">Bonjour {firstName}</h1>
            <p className="mt-2 text-sm text-slate-400">
              Voici la situation annuelle de votre foyer pour {period.year}. Continuez sur votre lancee !
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
            <p className="text-sm text-slate-400">Besoin d&apos;ajuster une fiche ?</p>
            <Link
              href={currentSheet ? `/sheets/${currentSheet.id}` : "/sheets/new"}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-accent"
            >
              {currentSheet ? "Ouvrir la fiche en cours" : "Creer la premiere fiche"}
            </Link>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Revenus annuels"
            value={formatCurrency(yearMetrics.income)}
            helper={`Annee ${period.year}`}
          />
          <StatCard
            label="Charges annuelles"
            value={formatCurrency(yearMetrics.expenses + yearMetrics.budgets)}
            helper="Charges + budgets"
            variant="negative"
          />
          <StatCard
            label="Solde annuel"
            value={formatCurrency(yearMetrics.balance)}
            helper="Revenus - charges - budgets"
            variant={yearMetrics.balance >= 0 ? "positive" : "negative"}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3rem] text-slate-500">Mois en cours</p>
            <h2 className="text-2xl font-semibold text-white">Recapitulatif de {monthLabel}</h2>
            <p className="text-sm text-slate-400">
              {currentSheet
                ? "Votre fiche mensuelle est prete, voici les indicateurs cles."
                : "Aucune fiche pour ce mois. Creez-en une pour suivre vos finances."}
            </p>
          </div>
          <Link
            href={currentSheet ? `/sheets/${currentSheet.id}` : "/sheets/new"}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-accent"
          >
            {currentSheet ? "Voir la fiche" : "Creer une fiche"}
          </Link>
        </div>
        {currentMetrics ? (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[{
                label: "Revenus du mois",
                value: formatCurrency(currentMetrics.income),
                helper: "Salaires cumules",
              },
              {
                label: "Charges prevues",
                value: formatCurrency(currentMetrics.expenses + currentMetrics.budgets),
                helper: "Charges + budgets",
              },
              {
                label: "Solde previsionnel",
                value: formatCurrency(currentMetrics.balance),
                helper: `${currentMetrics.balance >= 0 ? "Excedent" : "Deficit"} apres budgets`,
              }].map((card) => (
                <div key={card.label} className="rounded-2xl border border-white/5 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.25rem] text-slate-500">{card.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{card.helper}</p>
                </div>
              ))}
            </div>
            {currentMemberSnapshot && currentMemberSnapshot.cards.length > 0 ? (
              <div className="mt-6 rounded-2xl border border-white/5 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.3rem] text-slate-500">
                  Reste par membre apres budgets
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {currentMemberSnapshot.cards.map((card) => (
                    <div
                      key={`dashboard-${card.person}`}
                      className="rounded-2xl border border-white/5 bg-white/3 p-4"
                    >
                      <p className="text-sm font-semibold text-white">{card.person}</p>
                      <p
                        className={`mt-2 text-2xl font-semibold ${
                          card.netAfterBudgets >= 0 ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {formatCurrency(card.netAfterBudgets)}
                      </p>
                      <p className="text-xs text-slate-400">Disponible pour {monthLabel}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/2 p-6 text-sm text-slate-400">
            Creez une nouvelle fiche pour le mois en cours afin de suivre vos salaires, charges et budgets en temps reel.
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Historique des fiches</h2>
            <p className="text-sm text-slate-400">Les cinq derniers mois enregistres pour garder un oeil sur l&apos;evolution.</p>
          </div>
          <Link
            href="/sheets"
            className="text-sm text-accent underline-offset-4 hover:underline"
          >
            Voir tout l&apos;historique
          </Link>
        </div>
        <div className="mt-6 space-y-4">
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">
              Aucune fiche enregistree pour le moment. Creez-en une nouvelle des maintenant !
            </p>
          ) : (
            history.map((sheet) => {
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
                      {sheet.salaries.length} salaires - {sheet.charges.length} charges - {sheet.budgets.length} budgets
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
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
