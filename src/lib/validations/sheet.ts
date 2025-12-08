import { z } from "zod";

export const PEOPLE = ["ME", "HER"] as const;
export const CHARGE_TYPES = [
  "FIXED_COMMON",
  "FIXED_INDIVIDUAL",
  "EXCEPTIONAL_COMMON",
  "EXCEPTIONAL_INDIVIDUAL",
] as const;

export const salarySchema = z.object({
  person: z.enum(PEOPLE),
  label: z.string().min(1, "Intitulé requis"),
  amount: z.coerce.number().nonnegative("Montant invalide"),
});

export const chargeSchema = z.object({
  type: z.enum(CHARGE_TYPES),
  person: z.string().optional().nullable(),
  label: z.string().min(1, "Intitulé requis"),
  amount: z.coerce.number().nonnegative("Montant invalide"),
});

export const budgetSchema = z.object({
  label: z.string().min(1, "Intitulé requis"),
  amount: z.coerce.number().nonnegative("Montant invalide"),
});

export const sheetFormSchema = z.object({
  year: z.coerce.number().min(2000).max(2100),
  month: z.coerce.number().min(1).max(12),
  salaries: z.array(salarySchema).default([]),
  charges: z.array(chargeSchema).default([]),
  budgets: z.array(budgetSchema).default([]),
});

export type SheetFormValues = z.infer<typeof sheetFormSchema>;

export const defaultSheetFormValues = (): SheetFormValues => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    salaries: [],
    charges: [],
    budgets: [],
  };
};
