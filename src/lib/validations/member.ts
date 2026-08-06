import { z } from "zod";

export const FISCAL_ROLES = [
  "DECLARANT_1",
  "DECLARANT_2",
  "DEPENDENT_CHILD",
  "DEPENDENT_ADULT",
  "ASCENDANT",
] as const;

export const memberUpdateSchema = z.object({
  displayName: z.string().min(1).max(60).optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  fiscalRole: z.enum(FISCAL_ROLES).optional(),
  isAlternateGuard: z.boolean().optional(),
  isDisabled: z.boolean().optional(),
});

export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;
