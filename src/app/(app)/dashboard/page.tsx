import { redirect } from "next/navigation";
import Link from "next/link";

import StatCard from "@/components/dashboard/StatCard";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import {
  aggregateSheetMetrics,
  computeSheetMetrics,
  decryptSheet,
  getCurrentPeriod,
  getMonthLabel,
  type SecureSheet,
} from "@/lib/sheets";
import { getCurrentSession } from "@/lib/auth";

const includeConfig = {
  salaries: { include: { member: true } },
  charges: { include: { member: true } },
  budgets: true,
};

const DashboardPage = async () => {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/");
  }

  const period = getCurrentPeriod();
  const [currentSheet, history, yearSheets] = await Promise.all([
    prisma.sheet.findFirst({
      where: { month: period.month, year: period.year, familyId: session.user.familyId },
      include: includeConfig,
      orderBy: { createdAt: "desc" },
    }) as Promise<SecureSheet | null>,
    prisma.sheet.findMany({
      where: { familyId: session.user.familyId },
      include: includeConfig,
      orderBy: [
        { year: "desc" },
        { month: "desc" },
      ],
      take: 5,
    }) as Promise<SecureSheet[]>,
    prisma.sheet.findMany({
      where: { familyId: session.user.familyId, year: period.year },
      include: includeConfig,
    }) as Promise<SecureSheet[]>,
  ]);

  const decryptedCurrent = currentSheet ? decryptSheet(currentSheet) : null;
  const decryptedHistory = history.map(decryptSheet);
  const decryptedYearSheets = yearSheets.map(decryptSheet);

  const currentMetrics = decryptedCurrent ? computeSheetMetrics(decryptedCurrent) : null;
  const yearMetrics = aggregateSheetMetrics(decryptedYearSheets);
  const monthLabel = getMonthLabel(period.month, period.year);
  const firstName = session.user.name?.split(/\s+/)[0] ?? session.user.familyName ?? "famille";

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900/60 p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35rem] text-slate-500">Vue d&apos;ensemble</p>
            <h1 className="text-3xl font-semibold text-white">Bonjour {firstName}</h1>
            <p className="mt-2 text-sm text-slate-400">
              Voici la situation annuelle de votre foyer pour {period.year}. Continuez sur votre lancée !
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
            <p className="text-sm text-slate-400">Besoin d&apos;ajuster une fiche ?</p>
            <Link
              href={decryptedCurrent ? `/sheets/${decryptedCurrent.id}` : "/sheets/new"}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-accent"
            >
              {decryptedCurrent ? "Ouvrir la fiche en cours" : "Créer la première fiche"}
            </Link>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Revenus annuels"
            value={formatCurrency(yearMetrics.income)}
            helper={`Année ${period.year}`}
          />
          <StatCard
            label="Charges annuelles"
            value={formatCurrency(yearMetrics.expenses)}
            helper="Toutes catégories"
            variant="negative"
          />
          <StatCard
            label="Budgets annuels"
            value={formatCurrency(yearMetrics.budgets)}
            helper="Enveloppes cumulées"
          />
          <StatCard
            label="Solde annuel"
            value={formatCurrency(yearMetrics.balance)}
            helper="Revenus - charges"
            variant={yearMetrics.balance >= 0 ? "positive" : "negative"}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3rem] text-slate-500">Mois en cours</p>
            <h2 className="text-2xl font-semibold text-white">Récapitulatif de {monthLabel}</h2>
            <p className="text-sm text-slate-400">
              {decryptedCurrent
                ? "Votre fiche mensuelle est prête, voici les indicateurs clés."
                : "Aucune fiche pour ce mois. Créez-en une pour suivre vos finances."}
            </p>
          </div>
          <Link
            href={decryptedCurrent ? `/sheets/${decryptedCurrent.id}` : "/sheets/new"}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-accent"
          >
            {decryptedCurrent ? "Voir la fiche" : "Créer une fiche"}
          </Link>
        </div>
        {currentMetrics ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[{
              label: "Revenus du mois",
              value: formatCurrency(currentMetrics.income),
              helper: "Salaires cumulés",
            },
            {
              label: "Charges prévues",
              value: formatCurrency(currentMetrics.expenses),
              helper: "Toutes catégories",
            },
            {
              label: "Budgets actifs",
              value: formatCurrency(currentMetrics.budgets),
              helper: `Enveloppes de ${monthLabel}`,
            },
            {
              label: "Solde prévisionnel",
              value: formatCurrency(currentMetrics.balance),
              helper: currentMetrics.balance >= 0 ? "Excédent" : "Déficit",
            }].map((card) => (
              <div key={card.label} className="rounded-2xl border border-white/5 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.25rem] text-slate-500">{card.label}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
                <p className="mt-1 text-xs text-slate-400">{card.helper}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-slate-400">
            Créez une nouvelle fiche pour le mois en cours afin de suivre vos salaires, charges et budgets en temps réel.
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Historique des fiches</h2>
            <p className="text-sm text-slate-400">Les cinq derniers mois enregistrés pour garder un œil sur l&apos;évolution.</p>
          </div>
          <Link
            href="/sheets"
            className="text-sm text-accent underline-offset-4 hover:underline"
          >
            Voir tout l&apos;historique
          </Link>
        </div>
        <div className="mt-6 space-y-4">
          {decryptedHistory.length === 0 ? (
            <p className="text-sm text-slate-400">
              Aucune fiche enregistrée pour le moment. Créez-en une nouvelle dès maintenant !
            </p>
          ) : (
            decryptedHistory.map((sheet) => {
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
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
