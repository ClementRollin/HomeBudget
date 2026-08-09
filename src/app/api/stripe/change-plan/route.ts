import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const bodySchema = z.object({
  targetPriceId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const allowedPrices = [
    process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
    process.env.STRIPE_PRICE_ID_PRO_ANNUAL,
  ];
  if (!allowedPrices.includes(parsed.data.targetPriceId)) {
    return NextResponse.json({ error: "Prix invalide" }, { status: 400 });
  }

  const family = await prisma.family.findUnique({
    where: { id: session.user.familyId },
    select: { stripeSubscriptionId: true, stripePriceId: true, subscriptionStatus: true },
  });
  if (!family?.stripeSubscriptionId) {
    return NextResponse.json({ error: "Aucun abonnement actif" }, { status: 404 });
  }
  if (family.subscriptionStatus !== "PRO" && family.subscriptionStatus !== "PRO_PAST_DUE") {
    return NextResponse.json({ error: "Abonnement non actif" }, { status: 400 });
  }
  if (family.stripePriceId === parsed.data.targetPriceId) {
    return NextResponse.json({ error: "Même plan déjà actif" }, { status: 400 });
  }

  const isUpgrade = parsed.data.targetPriceId === process.env.STRIPE_PRICE_ID_PRO_ANNUAL;

  try {
    const sub = await stripe.subscriptions.retrieve(family.stripeSubscriptionId);
    const currentItem = sub.items.data[0];
    if (!currentItem) {
      return NextResponse.json({ error: "Item d'abonnement introuvable" }, { status: 500 });
    }

    await stripe.subscriptions.update(family.stripeSubscriptionId, {
      items: [{ id: currentItem.id, price: parsed.data.targetPriceId }],
      // Monthly → Annual: charge prorated difference immediately
      // Annual → Monthly: no immediate charge, takes effect at next renewal
      proration_behavior: isUpgrade ? "create_prorations" : "none",
    });

    await prisma.family.update({
      where: { id: session.user.familyId },
      data: { stripePriceId: parsed.data.targetPriceId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[change-plan] Stripe error:", err);
    return NextResponse.json({ error: "Erreur Stripe" }, { status: 500 });
  }
}
