import { z } from "zod";

export const fiscalConfigSchema = z.object({
  isCoupled: z.boolean(),
  perContribYTD: z.number({ error: "Montant requis" }).min(0),
});

export type FiscalConfigValues = z.infer<typeof fiscalConfigSchema>;
