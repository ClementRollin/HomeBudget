import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import UpgradeConfirmationEmail from "@/emails/UpgradeConfirmationEmail";
import PaymentFailedEmail from "@/emails/PaymentFailedEmail";
import SubscriptionCanceledEmail from "@/emails/SubscriptionCanceledEmail";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "support@homebudget.app";

async function getFamilyEmail(familyId: string): Promise<{ email: string; name: string } | null> {
  const user = await prisma.user.findFirst({
    where: { familyId, familyRole: "OWNER" },
    select: { email: true, name: true },
  });
  return user ? { email: user.email, name: user.name ?? "Membre" } : null;
}

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
      ) as unknown as Stripe.Subscription;
      const family = await prisma.family.update({
        where: { id: familyId },
        data: {
          subscriptionStatus: "PRO",
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id ?? null,
          subscriptionEndsAt: null,
        },
      });

      const owner = await getFamilyEmail(familyId);
      if (owner) {
        const periodEnd = subscription.items.data[0]?.current_period_end;
        const renewalDate = periodEnd
          ? new Date(periodEnd * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
          : "prochainement";
        void sendEmail({
          to: owner.email,
          subject: "Votre abonnement HomeBudget PRO est activé !",
          react: UpgradeConfirmationEmail({ familyName: family.name, renewalDate, appUrl: APP_URL }),
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const family = await prisma.family.findFirst({
        where: { stripeSubscriptionId: sub.id },
      });
      if (!family) break;

      const isCanceling = sub.cancel_at_period_end || sub.cancel_at !== null;
      const status =
        sub.status === "past_due" ? "PRO_PAST_DUE"
        : sub.status === "active" && isCanceling ? "PRO_CANCELED"
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

      if (status === "PRO_CANCELED" && sub.cancel_at) {
        const owner = await getFamilyEmail(family.id);
        if (owner) {
          const accessUntil = new Date(sub.cancel_at * 1000).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          void sendEmail({
            to: owner.email,
            subject: "Votre abonnement HomeBudget PRO a été résilié",
            react: SubscriptionCanceledEmail({ familyName: family.name, accessUntil, appUrl: APP_URL }),
          });
        }
      }
      break;
    }

    case "customer.subscription.canceled":
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
      const invoiceData = event.data.object as unknown as Record<string, unknown>;
      const subscriptionId =
        (invoiceData["parent"] as Record<string, unknown> | null)?.["subscription_details"] !== undefined
          ? ((invoiceData["parent"] as Record<string, unknown>)["subscription_details"] as Record<string, unknown>)["subscription"] as string | null
          : (invoiceData["subscription"] as string | null);
      if (subscriptionId) {
        const family = await prisma.family.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        });
        if (family) {
          await prisma.family.update({
            where: { id: family.id },
            data: { subscriptionStatus: "PRO_PAST_DUE" },
          });

          const owner = await getFamilyEmail(family.id);
          if (owner) {
            const portalRes = await stripe.billingPortal.sessions.create({
              customer: family.stripeCustomerId!,
              return_url: `${APP_URL}/settings`,
            }).catch(() => null);

            void sendEmail({
              to: owner.email,
              subject: "Action requise : paiement HomeBudget PRO échoué",
              react: PaymentFailedEmail({
                familyName: family.name,
                portalUrl: portalRes?.url ?? `${APP_URL}/settings`,
                supportEmail: SUPPORT_EMAIL,
              }),
            });
          }
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
