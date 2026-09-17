import { z } from "zod";

import { CHARGE_TYPES } from "@/lib/validations/sheet";

export const recurringChargeSchema = z.object({
  category: z.enum(CHARGE_TYPES),
  memberId: z.string().nullable().optional(),
  label: z.string().min(1, "Intitulé requis").max(100),
  amount: z.coerce.number().nonnegative("Montant invalide"),
});

export const recurringChargePatchSchema = recurringChargeSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type RecurringChargeInput = z.infer<typeof recurringChargeSchema>;
export type RecurringChargePatch = z.infer<typeof recurringChargePatchSchema>;
