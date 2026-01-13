import type { Budget, Charge, Salary, Sheet } from "@prisma/client";
import {
  CHARGE_TYPES,
  DEFAULT_CHARGE_CATEGORY,
  DEFAULT_INCOME_CATEGORY,
  type SheetFormValues,
} from "@/lib/validations/sheet";

export type SheetWithRelations = Sheet & {
  salaries: Salary[];
  charges: Charge[];
  budgets: Budget[];
};

export type IncomeDistributionItem = {
  person: string;
  amount: number;
  percentage: number;
  fixedChargeShare: number;
};

export type NormalizedCharge = {
  id: string;
  type: (typeof CHARGE_TYPES)[number];
  person: string;
  category: string;
  label: string;
  amount: number;
};

export type MemberBalance = {
  person: string;
  income: number;
  percentage: number;
  fixedShare: number;
  individualCharges: number;
  totalCharges: number;
  netAfterCharges: number;
  budgetShare: number;
  netAfterBudgets: number;
};

export const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export const getCurrentPeriod = () => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
};

export const isPastPeriod = (
  year: number,
  month: number,
  reference = getCurrentPeriod(),
) => {
  if (year < reference.year) {
    return true;
  }
  if (year > reference.year) {
    return false;
  }
  return month < reference.month;
};

export const getMonthLabel = (month: number, year?: number) => {
  const label = MONTH_NAMES[month - 1] ?? "Mois";
  return year ? `${label} ${year}` : label;
};

const decimalToNumber = (value: unknown) => Number(value ?? 0);
export const normalizePersonLabel = (value?: string | null) => {
  if (!value) {
    return "";
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  const upper = trimmed.toUpperCase();
  if (upper === "ME") {
    return "Moi";
  }
  if (upper === "HER") {
    return "Elle";
  }
  return trimmed;
};
const CHARGE_TYPE_LEGACY_MAP: Record<string, (typeof CHARGE_TYPES)[number]> = {
  FIXED_COMMON: "FIXE_COMMUN",
  FIXED_INDIVIDUAL: "FIXE_INDIVIDUEL",
  EXCEPTIONAL_COMMON: "EXCEPTIONNEL_COMMUN",
  EXCEPTIONAL_INDIVIDUAL: "EXCEPTIONNEL_INDIVIDUEL",
};
export const normalizeChargeType = (value?: string | null): (typeof CHARGE_TYPES)[number] => {
  if (!value) {
    return CHARGE_TYPES[0];
  }
  const upper = value.toUpperCase();
  if (CHARGE_TYPES.includes(upper as (typeof CHARGE_TYPES)[number])) {
    return upper as (typeof CHARGE_TYPES)[number];
  }
  return CHARGE_TYPE_LEGACY_MAP[upper] ?? CHARGE_TYPES[0];
};

const sumAmount = <T extends { amount: unknown }>(items: T[]) =>
  items.reduce((total, item) => total + decimalToNumber(item.amount), 0);

export const computeSheetMetrics = (sheet: SheetWithRelations) => {
  const income = sumAmount(sheet.salaries);
  const expenses = sumAmount(sheet.charges);
  const budgets = sumAmount(sheet.budgets);
  return {
    income,
    expenses,
    budgets,
    balance: income - expenses - budgets,
  };
};

export const aggregateSheetMetrics = (sheets: SheetWithRelations[]) =>
  sheets.reduce(
    (totals, sheet) => {
      const metrics = computeSheetMetrics(sheet);
      totals.income += metrics.income;
      totals.expenses += metrics.expenses;
      totals.budgets += metrics.budgets;
      totals.balance += metrics.balance;
      return totals;
    },
    { income: 0, expenses: 0, budgets: 0, balance: 0 },
  );

export const computeIncomeDistribution = (
  sheet: SheetWithRelations,
): {
  totalIncome: number;
  fixedCommonCharges: number;
  distribution: IncomeDistributionItem[];
} => {
  const totalsByPerson = new Map<string, number>();
  sheet.salaries.forEach((salary) => {
    const person = normalizePersonLabel(salary.person) || "Membre";
    const current = totalsByPerson.get(person) ?? 0;
    totalsByPerson.set(person, current + decimalToNumber(salary.amount));
  });

  const totalIncome = Array.from(totalsByPerson.values()).reduce(
    (sum, amount) => sum + amount,
    0,
  );

  const fixedCommonCharges = sumAmount(
    sheet.charges.filter(
      (charge) => normalizeChargeType(charge.type) === "FIXE_COMMUN",
    ),
  );

  const distribution = Array.from(totalsByPerson.entries())
    .map(([person, amount]) => {
      const percentage = totalIncome > 0 ? amount / totalIncome : 0;
      return {
        person,
        amount,
        percentage,
        fixedChargeShare: fixedCommonCharges * percentage,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return { totalIncome, fixedCommonCharges, distribution };
};

export const normalizeSheetCharges = (
  sheet: SheetWithRelations,
): NormalizedCharge[] =>
  sheet.charges.map((charge) => ({
    id: charge.id,
    type: normalizeChargeType(charge.type),
    person: normalizePersonLabel(charge.person) || "Commun",
    category: charge.category ?? DEFAULT_CHARGE_CATEGORY,
    label: charge.label,
    amount: decimalToNumber(charge.amount),
  }));

export const toSheetFormValues = (
  sheet: SheetWithRelations,
): SheetFormValues => ({
  year: sheet.year,
  month: sheet.month,
  salaries: sheet.salaries.map((salary: Salary) => ({
    person: normalizePersonLabel(salary.person),
    category: salary.category ?? DEFAULT_INCOME_CATEGORY,
    label: salary.label,
    amount: decimalToNumber(salary.amount),
  })),
  charges: sheet.charges.map((charge: Charge) => ({
    type: normalizeChargeType(charge.type),
    person: charge.person ?? "",
    category: charge.category ?? DEFAULT_CHARGE_CATEGORY,
    label: charge.label,
    amount: decimalToNumber(charge.amount),
  })),
  budgets: sheet.budgets.map((budget: Budget) => ({
    label: budget.label,
    amount: decimalToNumber(budget.amount),
  })),
});

export const computeMemberBalances = ({
  normalizedCharges,
  distribution,
  totalBudgets,
  memberLabels,
}: {
  normalizedCharges: NormalizedCharge[];
  distribution: ReturnType<typeof computeIncomeDistribution>;
  totalBudgets: number;
  memberLabels: string[];
}): { cards: MemberBalance[]; budgetPerMember: number } => {
  const individualChargesMap = normalizedCharges.reduce<Map<string, number>>((acc, charge) => {
    if (charge.type === "FIXE_COMMUN") {
      return acc;
    }
    if (!charge.person || charge.person === "Commun") {
      return acc;
    }
    acc.set(charge.person, (acc.get(charge.person) ?? 0) + charge.amount);
    return acc;
  }, new Map());

  const cards: MemberBalance[] = distribution.distribution.map((item) => {
    const individualCharges = individualChargesMap.get(item.person) ?? 0;
    const totalCharges = individualCharges + item.fixedChargeShare;
    const netAfterCharges = item.amount - totalCharges;
    return {
      person: item.person,
      income: item.amount,
      percentage: item.percentage,
      fixedShare: item.fixedChargeShare,
      individualCharges,
      totalCharges,
      netAfterCharges,
      budgetShare: 0,
      netAfterBudgets: netAfterCharges,
    };
  });

  individualChargesMap.forEach((amount, person) => {
    if (!cards.some((card) => card.person === person)) {
      const netAfterCharges = -amount;
      cards.push({
        person,
        income: 0,
        percentage: 0,
        fixedShare: 0,
        individualCharges: amount,
        totalCharges: amount,
        netAfterCharges,
        budgetShare: 0,
        netAfterBudgets: netAfterCharges,
      });
    }
  });

  const budgetNameList =
    memberLabels.length > 0 ? memberLabels : cards.map((card) => card.person);
  const uniqueBudgetNames = Array.from(new Set(budgetNameList.filter(Boolean)));
  if (uniqueBudgetNames.length === 0 && totalBudgets > 0) {
    uniqueBudgetNames.push("Foyer");
  }

  uniqueBudgetNames.forEach((name) => {
    if (!cards.some((card) => card.person === name)) {
      cards.push({
        person: name,
        income: 0,
        percentage: 0,
        fixedShare: 0,
        individualCharges: 0,
        totalCharges: 0,
        netAfterCharges: 0,
        budgetShare: 0,
        netAfterBudgets: 0,
      });
    }
  });

  const budgetPerMember =
    uniqueBudgetNames.length > 0 ? totalBudgets / uniqueBudgetNames.length : 0;
  const eligibleForBudget = new Set(uniqueBudgetNames);

  const enriched = cards
    .map((card) => {
      const budgetShare = eligibleForBudget.has(card.person) ? budgetPerMember : 0;
      return {
        ...card,
        budgetShare,
        netAfterBudgets: card.netAfterCharges - budgetShare,
      };
    })
    .sort((a, b) => {
      if (b.income !== a.income) {
        return b.income - a.income;
      }
      return a.person.localeCompare(b.person);
    });

  return {
    cards: enriched,
    budgetPerMember,
  };
};
