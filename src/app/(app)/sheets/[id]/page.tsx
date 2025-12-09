import { notFound, redirect } from "next/navigation";

import SheetForm from "@/components/forms/SheetForm";
import ChargesOverview from "@/components/sheets/ChargesOverview";
import StatCard from "@/components/dashboard/StatCard";
import { prisma } from "@/lib/prisma";
import {
  computeIncomeDistribution,
  computeSheetMetrics,
  getMonthLabel,
  normalizeSheetCharges,
  toSheetFormValues,
} from "@/lib/sheets";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getCurrentSession } from "@/lib/auth";
import { buildPeopleOptions } from "@/lib/utils";

const CHARGE_TYPE_LABELS = {
  FIXE_COMMUN: "Charges fixes communes",
  FIXE_INDIVIDUEL: "Charges fixes individuelles",
  EXCEPTIONNEL_COMMUN: "Charges exceptionnelles communes",
  EXCEPTIONNEL_INDIVIDUEL: "Charges exceptionnelles individuelles",
} as const;

const SheetDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/");
  }

  const [sheet, members] = await Promise.all([
    prisma.sheet.findFirst({
      where: { id, familyId: session.user.familyId },
      include: { salaries: true, charges: true, budgets: true },
    }),
    prisma.user.findMany({
      where: { familyId: session.user.familyId },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (!sheet) {
    notFound();
  }

  const metrics = computeSheetMetrics(sheet);
  const distribution = computeIncomeDistribution(sheet);
  const normalizedCharges = normalizeSheetCharges(sheet);
  const defaultValues = toSheetFormValues(sheet);
  const peopleOptions = buildPeopleOptions(members, session.user.id);

  const individualChargesMap = normalizedCharges.reduce<Map<string, number>>(
    (acc, charge) => {
      if (charge.type === "FIXE_COMMUN") {
        return acc;
      }
      if (!charge.person || charge.person === "Commun") {
        return acc;
      }
      acc.set(charge.person, (acc.get(charge.person) ?? 0) + charge.amount);
      return acc;
    },
    new Map(),
  );

  const peopleCards = distribution.distribution.map((item) => {
    const individualCharges = individualChargesMap.get(item.person) ?? 0;
    const totalCharges = individualCharges + item.fixedChargeShare;
    return {
      person: item.person,
      income: item.amount,
      percentage: item.percentage,
      fixedShare: item.fixedChargeShare,
      individualCharges,
      totalCharges,
      netAfterCharges: item.amount - totalCharges,
    };
  });

  const extraPersons = Array.from(individualChargesMap.keys()).filter(
    (person) => !peopleCards.some((card) => card.person === person),
  );

  extraPersons.forEach((person) => {
    const individualCharges = individualChargesMap.get(person) ?? 0;
    peopleCards.push({
      person,
      income: 0,
      percentage: 0,
      fixedShare: 0,
      individualCharges,
      totalCharges: individualCharges,
      netAfterCharges: -individualCharges,
    });
  });

  const totalBudgets = sheet.budgets.reduce(
    (sum, budget) => sum + Number(budget.amount ?? 0),
    0,
  );

  const memberLabels =
    members.length > 0
      ? members.map((member, index) => {
          const fallback = `Membre ${index + 1}`;
          const raw = member.name?.trim();
          if (!raw) {
            return fallback;
          }
          const [first] = raw.split(/\s+/);
          return first || fallback;
        })
      : distribution.distribution.length > 0
        ? distribution.distribution.map((item) => item.person || "Membre")
        : [];

  const budgetPerMember =
    memberLabels.length > 0 ? totalBudgets / memberLabels.length : totalBudgets;

  const INDIVIDUAL_TYPES: Array<typeof normalizedCharges[number]["type"]> = [
    "FIXE_INDIVIDUEL",
    "EXCEPTIONNEL_INDIVIDUEL",
  ];

  const chargeTotalsByType = normalizedCharges.reduce<
    Map<string, { amount: number; byPerson: Map<string, number> }>
  >((acc, charge) => {
    const entry = acc.get(charge.type) ?? {
      amount: 0,
      byPerson: new Map<string, number>(),
    };
    entry.amount += charge.amount;
    if (INDIVIDUAL_TYPES.includes(charge.type) && charge.person && charge.person !== "Commun") {
      entry.byPerson.set(
        charge.person,
        (entry.byPerson.get(charge.person) ?? 0) + charge.amount,
      );
    }
    acc.set(charge.type, entry);
    return acc;
  }, new Map());

  const totalChargesAmount = normalizedCharges.reduce(
    (sum, charge) => sum + charge.amount,
    0,
  );

  const chargeSummary = Array.from(chargeTotalsByType.entries()).map(([type, data]) => {
    const category = (type ?? "FIXE_COMMUN") as keyof typeof CHARGE_TYPE_LABELS;
    return {
      type: category,
      label: CHARGE_TYPE_LABELS[category] ?? category,
      amount: data.amount,
      breakdown: INDIVIDUAL_TYPES.includes(category)
        ? Array.from(data.byPerson.entries())
            .map(([person, amount]) => ({ person, amount }))
            .sort((a, b) => b.amount - a.amount)
        : null,
    };
  });

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/5 bg-black/40 p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3rem] text-slate-500">Fiche mensuelle</p>
            <h1 className="text-3xl font-semibold text-white">
              {getMonthLabel(sheet.month, sheet.year)}
            </h1>
            <p className="text-sm text-slate-400">
              {sheet.salaries.length} salaires - {sheet.charges.length} charges - {sheet.budgets.length} budgets
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.25rem] text-slate-500">Solde actuel</p>
            <p className="text-2xl font-semibold text-white">{formatCurrency(metrics.balance)}</p>
            <p className="text-xs text-slate-400">
              {metrics.balance >= 0 ? "Excedent" : "Deficit"} previsionnel
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Revenus cumules"
            value={formatCurrency(metrics.income)}
            helper="Tous les salaires du mois"
          />
          <StatCard
            label="Charges prevues"
            value={formatCurrency(metrics.expenses)}
            helper="Toutes categories"
            variant="negative"
          />
          <StatCard
            label="Budgets"
            value={formatCurrency(metrics.budgets)}
            helper="Enveloppes actives"
          />
          <StatCard
            label="Charges fixes communes"
            value={formatCurrency(distribution.fixedCommonCharges)}
            helper="Reparties selon les revenus"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 rounded-3xl border border-white/5 bg-black/30 p-6 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Repartition du foyer</h2>
              <p className="text-sm text-slate-400">
                Chaque encart synthese revenus, charges et reste a vivre pour un membre.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.25rem] text-slate-400">Charges fixes</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(distribution.fixedCommonCharges)}
              </p>
            </div>
          </div>
          {peopleCards.length === 0 ? (
            <p className="text-sm text-slate-400">
              Ajoutez des salaires pour decouvrir la repartition automatique.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {peopleCards.map((card) => (
                <div
                  key={card.person}
                  className="rounded-2xl border border-white/5 bg-white/[0.04] p-5 text-sm"
                >
                  <p className="text-xs uppercase tracking-[0.3rem] text-slate-500">Membre</p>
                  <p className="text-lg font-semibold text-white">{card.person}</p>
                  <p className="text-xs text-slate-400">
                    {formatPercent(card.percentage, "fr-FR", 0)} du revenu du foyer
                  </p>
                  <div className="mt-4 space-y-2 text-slate-200">
                    <div className="flex items-center justify-between">
                      <span>Revenus cumules</span>
                      <span className="font-semibold">{formatCurrency(card.income)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Charges individuelles</span>
                      <span>{formatCurrency(card.individualCharges)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Part charges communes</span>
                      <span>{formatCurrency(card.fixedShare)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-2 font-semibold text-white">
                      <span>Reste apres charges</span>
                      <span className={card.netAfterCharges >= 0 ? "text-emerald-300" : "text-rose-300"}>
                        {formatCurrency(card.netAfterCharges)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4 rounded-3xl border border-white/5 bg-black/30 p-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Budgets equitablement repartis</h3>
            <p className="text-sm text-slate-400">
              Total enveloppes: <strong>{formatCurrency(totalBudgets)}</strong>
            </p>
          </div>
          <div className="space-y-3">
            {memberLabels.length === 0 ? (
              <p className="text-sm text-slate-400">
                Ajoutez des membres pour repartir automatiquement les budgets.
              </p>
            ) : (
              memberLabels.map((label, index) => (
                <div
                  key={`${label}-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-3 text-sm text-slate-200"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.3rem] text-slate-500">Membre</p>
                    <p className="text-base font-semibold text-white">{label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Part mensuelle</p>
                    <p className="font-semibold text-white">{formatCurrency(budgetPerMember)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-black/30 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Charges et filtres</h2>
            <p className="text-sm text-slate-400">
              Passez en revue toutes les charges, filtrez par categorie et ajustez vos postes.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.25rem] text-slate-400">Total charges</p>
            <p className="text-lg font-semibold text-white">{formatCurrency(totalChargesAmount)}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.3rem] text-slate-500">Charges communes</p>
            <p className="text-2xl font-semibold text-white">
              {formatCurrency(distribution.fixedCommonCharges)}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Reparties automatiquement selon les revenus du foyer.
            </p>
          </div>
          {chargeSummary.map((item) => (
            <div
              key={item.type}
              className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-sm"
            >
              <p className="text-xs uppercase tracking-[0.2rem] text-slate-500">{item.label}</p>
              <p className="mt-2 text-xl font-semibold text-white">
                {formatCurrency(item.amount)}
              </p>
              {item.breakdown && item.breakdown.length > 0 ? (
                <div className="mt-3 space-y-1 text-xs text-slate-300">
                  {item.breakdown.map((detail) => (
                    <div key={`${item.type}-${detail.person}`} className="flex justify-between">
                      <span>{detail.person}</span>
                      <span className="font-semibold text-white/90">
                        {formatCurrency(detail.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
          <ChargesOverview charges={normalizedCharges} />
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-black/30 p-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Mettre a jour la fiche</h2>
          <p className="text-sm text-slate-400">
            Ajoutez de nouvelles entrees ou ajustez les montants avant de synchroniser vos donnees.
          </p>
        </div>
        <SheetForm
          sheetId={sheet.id}
          initialValues={defaultValues}
          peopleOptions={peopleOptions}
        />
      </section>
    </div>
  );
};

export default SheetDetailPage;
