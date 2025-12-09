import type {
  Budget,
  Charge,
  ChargeCategory,
  FamilyMember,
  Salary,
  Sheet,
} from "@prisma/client";

import { encryptNumber, encryptValue, decryptNumber, decryptValue } from "@/lib/crypto";
import { findOrCreateMember, getFamilyMembers } from "@/lib/members";
import { CHARGE_TYPES, type SheetFormValues } from "@/lib/validations/sheet";

export type SecureSheet = Sheet & {
  salaries: (Salary & { member?: FamilyMember | null })[];
  charges: (Charge & { member?: FamilyMember | null })[];
  budgets: Budget[];
};

export type SheetWithRelations = Sheet & {
  salaries: DecryptedSalary[];
  charges: DecryptedCharge[];
  budgets: DecryptedBudget[];
};

export type DecryptedSalary = {
  id: string;
  memberId: string | null;
  person: string;
  label: string;
  amount: number;
};

export type DecryptedCharge = {
  id: string;
  memberId: string | null;
  person: string;
  type: (typeof CHARGE_TYPES)[number];
  label: string;
  amount: number;
};

export type DecryptedBudget = {
  id: string;
  label: string;
  amount: number;
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
  label: string;
  amount: number;
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

const normalizePersonLabel = (value?: string | null) => {
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

const mapChargeCategory = (value: string): (typeof CHARGE_TYPES)[number] => {
  if (CHARGE_TYPES.includes(value as (typeof CHARGE_TYPES)[number])) {
    return value as (typeof CHARGE_TYPES)[number];
  }
  return CHARGE_TYPES[0];
};

const decryptSalary = (salary: Salary & { member?: FamilyMember | null }): DecryptedSalary => ({
  id: salary.id,
  memberId: salary.memberId ?? null,
  person: salary.member?.displayName ?? "Membre",
  label: decryptValue(salary.encryptedLabel),
  amount: decryptNumber(salary.encryptedAmount),
});

const decryptCharge = (charge: Charge & { member?: FamilyMember | null }): DecryptedCharge => ({
  id: charge.id,
  memberId: charge.memberId ?? null,
  person: charge.member?.displayName ?? "Commun",
  type: mapChargeCategory(charge.category),
  label: decryptValue(charge.encryptedLabel),
  amount: decryptNumber(charge.encryptedAmount),
});

const decryptBudget = (budget: Budget): DecryptedBudget => ({
  id: budget.id,
  label: decryptValue(budget.encryptedLabel),
  amount: decryptNumber(budget.encryptedAmount),
});

export const decryptSheet = (sheet: SecureSheet): SheetWithRelations => ({
  ...sheet,
  salaries: sheet.salaries.map(decryptSalary),
  charges: sheet.charges.map(decryptCharge),
  budgets: sheet.budgets.map(decryptBudget),
});

export const computeSheetMetrics = (sheet: SheetWithRelations) => {
  const income = sheet.salaries.reduce((total, salary) => total + salary.amount, 0);
  const expenses = sheet.charges.reduce((total, charge) => total + charge.amount, 0);
  const budgets = sheet.budgets.reduce((total, budget) => total + budget.amount, 0);
  return {
    income,
    expenses,
    budgets,
    balance: income - expenses,
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
    totalsByPerson.set(person, current + salary.amount);
  });

  const totalIncome = Array.from(totalsByPerson.values()).reduce(
    (sum, amount) => sum + amount,
    0,
  );

  const fixedCommonCharges = sheet.charges
    .filter((charge) => charge.type === "FIXE_COMMUN")
    .reduce((sum, charge) => sum + charge.amount, 0);

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
    type: charge.type,
    person: charge.person || "Commun",
    label: charge.label,
    amount: charge.amount,
  }));

export const toSheetFormValues = (sheet: SheetWithRelations): SheetFormValues => ({
  year: sheet.year,
  month: sheet.month,
  salaries: sheet.salaries.map((salary) => ({
    person: salary.person,
    label: salary.label,
    amount: salary.amount,
  })),
  charges: sheet.charges.map((charge) => ({
    type: charge.type,
    person: charge.person,
    label: charge.label,
    amount: charge.amount,
  })),
  budgets: sheet.budgets.map((budget) => ({
    label: budget.label,
    amount: budget.amount,
  })),
});

export const encryptSheetPayload = async (familyId: string, values: SheetFormValues) => {
  const memberCache = new Map<string, string>();

  const resolveMemberId = async (label?: string | null) => {
    if (!label) {
      return null;
    }
    const normalized = normalizePersonLabel(label);
    if (!normalized) {
      return null;
    }
    if (memberCache.has(normalized)) {
      return memberCache.get(normalized) ?? null;
    }
    const member = await findOrCreateMember(familyId, normalized);
    memberCache.set(normalized, member.id);
    return member.id;
  };

  return {
    salaries: await Promise.all(
      values.salaries.map(async (salary) => ({
        memberId: await resolveMemberId(salary.person),
        encryptedLabel: encryptValue(salary.label),
        encryptedAmount: encryptNumber(salary.amount),
      })),
    ),
    charges: await Promise.all(
      values.charges.map(async (charge) => ({
        category: (charge.type as ChargeCategory) ?? "FIXE_COMMUN",
        memberId: await resolveMemberId(charge.person),
        encryptedLabel: encryptValue(charge.label),
        encryptedAmount: encryptNumber(charge.amount),
      })),
    ),
    budgets: values.budgets.map((budget) => ({
      encryptedLabel: encryptValue(budget.label),
      encryptedAmount: encryptNumber(budget.amount),
    })),
  };
};

export const fetchFamilyMembers = async (familyId: string) => {
  const members = await getFamilyMembers(familyId);
  return members.map((member) => ({
    id: member.id,
    displayName: member.displayName,
  }));
};
