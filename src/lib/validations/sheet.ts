
import { z } from "zod";

export const PEOPLE = ["Moi", "Partenaire"] as const;
export const CHARGE_TYPES = [
  "FIXE_COMMUN",
  "FIXE_INDIVIDUEL",
  "EXCEPTIONNEL_COMMUN",
  "EXCEPTIONNEL_INDIVIDUEL",
] as const;

export const INCOME_CATEGORIES = ["Salaire", "Prime", "Aides", "Autres"] as const;
export const CHARGE_CATEGORIES = [
  "Fixes",
  "Exceptionnelles",
  "Logement",
  "Alimentation",
  "Transport",
  "Sante",
  "Assurances",
  "Impots",
  "Loisirs",
  "Autres",
] as const;

export const DEFAULT_INCOME_CATEGORY = INCOME_CATEGORIES[0];
export const DEFAULT_CHARGE_CATEGORY = CHARGE_CATEGORIES[0];

export const salarySchema = z.object({
  person: z.string().min(1, "Personne requise"),
  category: z.string().min(1, "Categorie requise").default(DEFAULT_INCOME_CATEGORY),
  label: z.string().min(1, "IntitulǸ requis"),
  amount: z.coerce.number().nonnegative("Montant invalide"),
});

export const chargeSchema = z.object({
  type: z.enum(CHARGE_TYPES),
  person: z.string().optional().nullable(),
  category: z.string().min(1, "Categorie requise").default(DEFAULT_CHARGE_CATEGORY),
  label: z.string().min(1, "IntitulǸ requis"),
  amount: z.coerce.number().nonnegative("Montant invalide"),
});

export const budgetSchema = z.object({
  label: z.string().min(1, "IntitulǸ requis"),
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
