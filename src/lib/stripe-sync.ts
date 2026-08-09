import type { SubscriptionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

type SyncResult = {
  subscriptionStatus: SubscriptionStatus;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  subscriptionEndsAt: Date | null;
};

/**
 * Fetches the authoritative subscription state from Stripe and updates the DB.
 * Called in settings page to ensure DB never drifts from Stripe (e.g. when webhook failed).
 * Automatically cancels duplicate active subscriptions, keeping the most recent.
 */
export async function syncSubscriptionFromStripe(
  familyId: string,
  stripeCustomerId: string,
): Promise<SyncResult | null> {
  const allSubs = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "active",
    limit: 10,
  });

  const activeSubs = allSubs.data.sort((a, b) => b.created - a.created);

  // Cancel any duplicates — keep only the most recent
  for (const sub of activeSubs.slice(1)) {
    await stripe.subscriptions.cancel(sub.id).catch(() => null);
  }

  const sub = activeSubs[0] ?? null;

  if (!sub) {
    // No active sub in Stripe — ensure DB reflects FREE
    const current = await prisma.family.findUnique({
      where: { id: familyId },
      select: { subscriptionStatus: true },
    });
    if (current && current.subscriptionStatus !== "FREE") {
      await prisma.family.update({
        where: { id: familyId },
        data: { subscriptionStatus: "FREE", stripeSubscriptionId: null, stripePriceId: null, subscriptionEndsAt: null },
      });
    }
    return null;
  }

  // cancel_at_period_end OR a specific cancel_at date both mean "scheduled cancellation"
  const isCanceling = sub.cancel_at_period_end || sub.cancel_at !== null;
  const status: SubscriptionStatus = isCanceling ? "PRO_CANCELED" : "PRO";
  const stripePriceId = sub.items.data[0]?.price.id ?? null;
  const subscriptionEndsAt = sub.cancel_at ? new Date(sub.cancel_at * 1000) : null;

  await prisma.family.update({
    where: { id: familyId },
    data: { subscriptionStatus: status, stripeSubscriptionId: sub.id, stripePriceId, subscriptionEndsAt },
  });

  return { subscriptionStatus: status, stripeSubscriptionId: sub.id, stripePriceId, subscriptionEndsAt };
}
