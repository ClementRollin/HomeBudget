import type { Budget, Charge, Salary, Sheet } from "@prisma/client";
import type { SheetFormValues } from "@/lib/validations/sheet";

export type SheetWithRelations = Sheet & {
  salaries: Salary[];
  charges: Charge[];
  budgets: Budget[];
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

export const getMonthLabel = (month: number, year?: number) => {
  const label = MONTH_NAMES[month - 1] ?? "Mois";
  return year ? `${label} ${year}` : label;
};

const decimalToNumber = (value: unknown) => Number(value ?? 0);

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
    balance: income - expenses,
  };
};

export const toSheetFormValues = (
  sheet: SheetWithRelations,
): SheetFormValues => ({
  year: sheet.year,
  month: sheet.month,
  salaries: sheet.salaries.map((salary: Salary) => ({
    person: salary.person as SheetFormValues["salaries"][number]["person"],
    label: salary.label,
    amount: decimalToNumber(salary.amount),
  })),
  charges: sheet.charges.map((charge: Charge) => ({
    type: charge.type as SheetFormValues["charges"][number]["type"],
    person: charge.person ?? "",
    label: charge.label,
    amount: decimalToNumber(charge.amount),
  })),
  budgets: sheet.budgets.map((budget: Budget) => ({
    label: budget.label,
    amount: decimalToNumber(budget.amount),
  })),
});
