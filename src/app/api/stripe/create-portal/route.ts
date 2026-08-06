import { NextResponse, type NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const family = await prisma.family.findUnique({
    where: { id: session.user.familyId },
    select: { stripeCustomerId: true },
  });

  if (!family?.stripeCustomerId) {
    return NextResponse.json({ error: "Aucun abonnement Stripe associé" }, { status: 400 });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: family.stripeCustomerId,
    return_url: `${origin}/settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
