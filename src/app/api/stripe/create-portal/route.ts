import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type Stripe from "stripe";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const bodySchema = z.object({
  flow: z.enum(["full", "cancel", "update_pm"]).default("full"),
}).optional();

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const rawBody = await request.text();
  const body = rawBody ? (JSON.parse(rawBody) as unknown) : {};
  const parsed = bodySchema.safeParse(body);
  const flow = parsed.success ? (parsed.data?.flow ?? "full") : "full";

  const family = await prisma.family.findUnique({
    where: { id: session.user.familyId },
    select: { stripeCustomerId: true, stripeSubscriptionId: true },
  });

  if (!family?.stripeCustomerId) {
    return NextResponse.json({ error: "Aucun abonnement Stripe associé" }, { status: 400 });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "";
  const returnBase = `${origin}/settings`;

  let flowData: Stripe.BillingPortal.SessionCreateParams.FlowData | undefined;

  if (flow === "cancel" && family.stripeSubscriptionId) {
    flowData = {
      type: "subscription_cancel",
      subscription_cancel: { subscription: family.stripeSubscriptionId },
      after_completion: {
        type: "redirect",
        redirect: { return_url: `${returnBase}?portal=1&action=canceled` },
      },
    };
  } else if (flow === "update_pm") {
    flowData = {
      type: "payment_method_update",
      after_completion: {
        type: "redirect",
        redirect: { return_url: `${returnBase}?portal=1&action=pm_updated` },
      },
    };
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: family.stripeCustomerId,
    return_url: `${returnBase}?portal=1`,
    ...(flowData ? { flow_data: flowData } : {}),
  });

  return NextResponse.json({ url: portalSession.url });
}
