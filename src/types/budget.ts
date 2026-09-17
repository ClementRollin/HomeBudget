import type { CHARGE_TYPES } from "@/lib/validations/sheet";

export type ChargeCategory = (typeof CHARGE_TYPES)[number];

export type Member = { id: string; displayName: string };

export type RecurringCharge = {
  id: string;
  category: ChargeCategory;
  memberId: string | null;
  memberName: string | null;
  label: string;
  amount: number;
  isActive: boolean;
};
