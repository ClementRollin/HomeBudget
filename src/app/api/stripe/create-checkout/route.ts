import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const bodySchema = z.object({
  priceId: z.string().min(1),
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
  if (!allowedPrices.includes(parsed.data.priceId)) {
    return NextResponse.json({ error: "Prix invalide" }, { status: 400 });
  }

  const family = await prisma.family.findUnique({
    where: { id: session.user.familyId },
    select: { id: true, name: true, stripeCustomerId: true },
  });
  if (!family) return NextResponse.json({ error: "Famille introuvable" }, { status: 404 });

  let customerId = family.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email ?? undefined,
      name: family.name,
      metadata: { familyId: family.id },
    });
    customerId = customer.id;
    await prisma.family.update({
      where: { id: family.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: parsed.data.priceId, quantity: 1 }],
    success_url: `${origin}/settings?success=1`,
    cancel_url: `${origin}/settings?canceled=1`,
    metadata: { familyId: family.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
