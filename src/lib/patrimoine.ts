import type { Asset, Debt, PatrimonialGoal } from "@prisma/client";
import { decryptValue, decryptNumber } from "@/lib/crypto";
import { ASSET_TYPES } from "@/lib/validations/patrimoine";

export type DecryptedAsset = {
  id: string;
  familyId: string;
  type: typeof ASSET_TYPES[number];
  name: string;
  currentValue: number;
  totalInvested: number;
  annualFee: number;
  createdAt: string;
  plusValue: number;       // currentValue - totalInvested
  plusValuePct: number;    // (currentValue - totalInvested) / totalInvested * 100 (0 si totalInvested=0)
};

export type DecryptedDebt = {
  id: string;
  familyId: string;
  label: string;
  balance: number;
  rate: number;
  monthlyPayment: number;
  endDate: string | null;
  monthsRemaining: number | null; // balance / monthlyPayment arrondi (null si monthlyPayment=0)
  totalCost: number | null;       // monthlyPayment * monthsRemaining (null si monthsRemaining=null)
};

export type DecryptedGoal = {
  id: string;
  familyId: string;
  label: string;
  target: number;
  horizon: number;
  createdAt: string;
};

export const decryptAsset = (asset: Asset): DecryptedAsset => {
  const currentValue = decryptNumber(asset.encryptedCurrentValue);
  const totalInvested = decryptNumber(asset.encryptedTotalInvested);
  const annualFee = asset.encryptedAnnualFee ? decryptNumber(asset.encryptedAnnualFee) : 0;
  const plusValue = currentValue - totalInvested;
  const plusValuePct = totalInvested > 0 ? (plusValue / totalInvested) * 100 : 0;
  return {
    id: asset.id,
    familyId: asset.familyId,
    type: asset.type as typeof ASSET_TYPES[number],
    name: decryptValue(asset.encryptedName),
    currentValue,
    totalInvested,
    annualFee,
    createdAt: asset.createdAt.toISOString(),
    plusValue,
    plusValuePct,
  };
};

export const decryptDebt = (debt: Debt): DecryptedDebt => {
  const balance = decryptNumber(debt.encryptedBalance);
  const monthlyPayment = decryptNumber(debt.encryptedMonthlyPayment);
  const monthsRemaining = monthlyPayment > 0 ? Math.ceil(balance / monthlyPayment) : null;
  const totalCost = monthsRemaining !== null ? monthlyPayment * monthsRemaining : null;
  return {
    id: debt.id,
    familyId: debt.familyId,
    label: decryptValue(debt.encryptedLabel),
    balance,
    rate: decryptNumber(debt.encryptedRate),
    monthlyPayment,
    endDate: debt.endDate ? debt.endDate.toISOString() : null,
    monthsRemaining,
    totalCost,
  };
};

export const decryptGoal = (goal: PatrimonialGoal): DecryptedGoal => ({
  id: goal.id,
  familyId: goal.familyId,
  label: decryptValue(goal.encryptedLabel),
  target: decryptNumber(goal.encryptedTarget),
  horizon: goal.horizon,
  createdAt: goal.createdAt.toISOString(),
});
