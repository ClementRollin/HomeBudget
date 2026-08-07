import { cache } from "react";

import type { SubscriptionStatus } from "@prisma/client";

// Static fallback — used in tests and as default when DB is unavailable
export const PLAN_LIMITS = {
  FREE: { maxSheets: 3, maxAssets: 5, maxDebts: 3, maxGoals: 2 },
  PRO: { maxSheets: Infinity, maxAssets: Infinity, maxDebts: Infinity, maxGoals: Infinity },
} as const;

export type PlanName = "FREE" | "PRO";
export type LimitResource = keyof typeof PLAN_LIMITS.FREE;

export type PlanLimits = {
  maxSheets: number;
  maxAssets: number;
  maxDebts: number;
  maxGoals: number;
};

// Per-request cached DB read — falls back to static constants if DB unavailable
export const getPlanLimits = cache(async (planName: PlanName): Promise<PlanLimits> => {
  try {
    const { prisma } = await import("@/lib/prisma");
    const plan = await prisma.plan.findUnique({ where: { name: planName } });
    if (plan) {
      const MAX = 2147483647;
      return {
        maxSheets: plan.maxSheets >= MAX ? Infinity : plan.maxSheets,
        maxAssets: plan.maxAssets >= MAX ? Infinity : plan.maxAssets,
        maxDebts: plan.maxDebts >= MAX ? Infinity : plan.maxDebts,
        maxGoals: plan.maxGoals >= MAX ? Infinity : plan.maxGoals,
      };
    }
  } catch {
    // DB unavailable — use static constants
  }
  return PLAN_LIMITS[planName];
});

// Per-request cached DB read for app config values
export const getAppConfig = cache(async (key: string): Promise<string | null> => {
  try {
    const { prisma } = await import("@/lib/prisma");
    const entry = await prisma.appConfig.findUnique({ where: { key } });
    return entry?.value ?? null;
  } catch {
    return null;
  }
});

export const getActivePlan = (
  status: SubscriptionStatus,
  endsAt: Date | null,
): PlanName => {
  if (status === "FREE") return "FREE";
  if (status === "PRO" || status === "PRO_PAST_DUE") return "PRO";
  // PRO_CANCELED: still PRO until endsAt
  if (status === "PRO_CANCELED" && endsAt && endsAt > new Date()) return "PRO";
  return "FREE";
};

export const checkLimit = (
  plan: PlanName,
  resource: LimitResource,
  currentCount: number,
): { allowed: boolean; limit: number; current: number } => {
  const limit = PLAN_LIMITS[plan][resource];
  return {
    allowed: currentCount < limit,
    limit: limit === Infinity ? -1 : limit,
    current: currentCount,
  };
};

export const getFamilySubscription = async (
  familyId: string,
): Promise<{ subscriptionStatus: SubscriptionStatus; subscriptionEndsAt: Date | null }> => {
  const { prisma } = await import("@/lib/prisma");
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    select: { subscriptionStatus: true, subscriptionEndsAt: true },
  });
  if (!family) throw new Error("Famille introuvable");
  return family;
};
