import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const familyId = checkoutSession.metadata?.familyId;
      if (!familyId || !checkoutSession.subscription) break;

      const subscription = await stripe.subscriptions.retrieve(
        checkoutSession.subscription as string,
      );
      await prisma.family.update({
        where: { id: familyId },
        data: {
          subscriptionStatus: "PRO",
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id ?? null,
          subscriptionEndsAt: null,
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const family = await prisma.family.findFirst({
        where: { stripeSubscriptionId: sub.id },
      });
      if (!family) break;

      const status =
        sub.status === "past_due" ? "PRO_PAST_DUE"
        : sub.status === "active" && sub.cancel_at_period_end ? "PRO_CANCELED"
        : sub.status === "active" ? "PRO"
        : "FREE";

      await prisma.family.update({
        where: { id: family.id },
        data: {
          subscriptionStatus: status,
          stripePriceId: sub.items.data[0]?.price.id ?? null,
          subscriptionEndsAt: sub.cancel_at ? new Date(sub.cancel_at * 1000) : null,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.family.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          subscriptionStatus: "FREE",
          stripeSubscriptionId: null,
          stripePriceId: null,
          subscriptionEndsAt: null,
        },
      });
      break;
    }

    case "invoice.payment_failed": {
      // In Stripe API 2026+, subscription is accessed via parent.subscription_details
      const invoiceData = event.data.object as unknown as Record<string, unknown>;
      const subscriptionId =
        (invoiceData["parent"] as Record<string, unknown> | null)?.["subscription_details"] !== undefined
          ? ((invoiceData["parent"] as Record<string, unknown>)["subscription_details"] as Record<string, unknown>)["subscription"] as string | null
          : (invoiceData["subscription"] as string | null);
      if (subscriptionId) {
        await prisma.family.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: { subscriptionStatus: "PRO_PAST_DUE" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
