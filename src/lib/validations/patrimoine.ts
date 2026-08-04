import { z } from "zod";

export const ASSET_TYPES = ["PEA", "ASSURANCE_VIE", "PER", "LIVRET", "SCPI", "IMMOBILIER", "CRYPTO", "AUTRE"] as const;

export const ASSET_TYPE_LABELS: Record<typeof ASSET_TYPES[number], string> = {
  PEA: "PEA",
  ASSURANCE_VIE: "Assurance-vie",
  PER: "PER",
  LIVRET: "Livret",
  SCPI: "SCPI",
  IMMOBILIER: "Immobilier",
  CRYPTO: "Crypto",
  AUTRE: "Autre",
};

export const assetFormSchema = z.object({
  type: z.enum(ASSET_TYPES),
  name: z.string().min(1, "Nom requis").max(100),
  currentValue: z.number({ error: "Valeur requise" }).min(0),
  totalInvested: z.number({ error: "Montant requis" }).min(0),
  annualFee: z.number().min(0).max(100).optional(),
});

export type AssetFormValues = z.infer<typeof assetFormSchema>;

export const debtFormSchema = z.object({
  label: z.string().min(1, "Libellé requis").max(100),
  balance: z.number({ error: "Solde requis" }).min(0),
  rate: z.number({ error: "Taux requis" }).min(0).max(100),
  monthlyPayment: z.number({ error: "Mensualité requise" }).min(0),
  endDate: z.string().optional(), // ISO date string ou vide
});

export type DebtFormValues = z.infer<typeof debtFormSchema>;

export const goalFormSchema = z.object({
  label: z.string().min(1, "Libellé requis").max(100),
  target: z.number({ error: "Montant requis" }).min(0),
  horizon: z.number().int().min(2024).max(2100),
});

export type GoalFormValues = z.infer<typeof goalFormSchema>;
