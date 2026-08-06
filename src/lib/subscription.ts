import type { SubscriptionStatus } from "@prisma/client";

export const PLAN_LIMITS = {
  FREE: { maxSheets: 3, maxAssets: 5, maxDebts: 3, maxGoals: 2 },
  PRO: { maxSheets: Infinity, maxAssets: Infinity, maxDebts: Infinity, maxGoals: Infinity },
} as const;

export type PlanName = "FREE" | "PRO";
export type LimitResource = keyof typeof PLAN_LIMITS.FREE;

export const getActivePlan = (
  status: SubscriptionStatus,
  endsAt: Date | null,
): PlanName => {
  if (status === "FREE") return "FREE";
  if (status === "PRO" || status === "PRO_PAST_DUE") return "PRO";
  // PRO_CANCELED : PRO jusqu'à endsAt
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
