import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getActivePlan, PLAN_LIMITS } from "@/lib/subscription";
import { syncSubscriptionFromStripe } from "@/lib/stripe-sync";
import PlanBadge from "@/components/subscription/PlanBadge";
import { ManageButton, UpdatePaymentButton, CancelButton } from "@/components/subscription/SettingsActions";
import SubscriptionBanner from "@/components/subscription/SubscriptionBanner";
import { UpgradeOptions, PlanSwitch } from "@/components/subscription/PlanSwitcher";
import InvoiceList, { mapStripeInvoice } from "@/components/subscription/InvoiceList";
import PaymentMethodCard from "@/components/subscription/PaymentMethodCard";
import AccountActions from "@/components/account/AccountActions";
import type Stripe from "stripe";

const limits = [
  { label: "Fiches mensuelles", free: PLAN_LIMITS.FREE.maxSheets, pro: "Illimité" },
  { label: "Actifs patrimoniaux", free: PLAN_LIMITS.FREE.maxAssets, pro: "Illimité" },
  { label: "Dettes", free: PLAN_LIMITS.FREE.maxDebts, pro: "Illimité" },
  { label: "Objectifs", free: PLAN_LIMITS.FREE.maxGoals, pro: "Illimité" },
  { label: "Déclaration 2042 + IA", free: "❌", pro: "✅" },
  { label: "Quotient familial + IR", free: "❌", pro: "✅" },
  { label: "Comparaison N-1", free: "❌", pro: "✅" },
];

type PaymentMethodInfo = {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
} | null;

export default async function SettingsPage() {
  const session = await getCurrentSession();
  if (!session?.user?.familyId) redirect("/");

  let family = await prisma.family.findUnique({
    where: { id: session.user.familyId },
    select: {
      subscriptionStatus: true,
      subscriptionEndsAt: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      stripePriceId: true,
    },
  });
  if (!family) redirect("/");

  // Always sync from Stripe when a customer exists — ensures DB stays consistent
  // even when webhooks fail (e.g. dev env without webhook forwarding)
  if (family.stripeCustomerId) {
    try {
      const synced = await syncSubscriptionFromStripe(session.user.familyId, family.stripeCustomerId);
      if (synced) {
        family = {
          ...family,
          subscriptionStatus: synced.subscriptionStatus,
          stripeSubscriptionId: synced.stripeSubscriptionId,
          stripePriceId: synced.stripePriceId,
          subscriptionEndsAt: synced.subscriptionEndsAt,
        };
      } else {
        family = { ...family, subscriptionStatus: "FREE", stripeSubscriptionId: null, stripePriceId: null, subscriptionEndsAt: null };
      }
    } catch {
      // Stripe unavailable — use cached DB values
    }
  }

  const plan = getActivePlan(family.subscriptionStatus, family.subscriptionEndsAt);

  let invoices: ReturnType<typeof mapStripeInvoice>[] = [];
  let paymentMethod: PaymentMethodInfo = null;
  let renewalDate: Date | null = null;
  let isCanceled = family.subscriptionStatus === "PRO_CANCELED";

  if (plan === "PRO" && family.stripeCustomerId) {
    try {
      const [invoiceList, subscription] = await Promise.all([
        stripe.invoices.list({ customer: family.stripeCustomerId, limit: 12 }),
        family.stripeSubscriptionId
          ? stripe.subscriptions.retrieve(family.stripeSubscriptionId, {
              expand: ["default_payment_method"],
            })
          : null,
      ]);

      invoices = invoiceList.data.map(mapStripeInvoice);

      if (subscription) {
        const firstItem = subscription.items.data[0];
        if (firstItem?.current_period_end) {
          renewalDate = new Date(firstItem.current_period_end * 1000);
        }
        isCanceled = subscription.cancel_at_period_end || subscription.cancel_at !== null;

        const pm = subscription.default_payment_method;
        if (pm && typeof pm !== "string" && (pm as Stripe.PaymentMethod).type === "card") {
          const card = (pm as Stripe.PaymentMethod).card;
          if (card) {
            paymentMethod = {
              brand: card.brand,
              last4: card.last4,
              expMonth: card.exp_month,
              expYear: card.exp_year,
            };
          }
        }
      }
    } catch {
      // Stripe unavailable — degrade gracefully
    }
  }

  const renewalLabel = renewalDate?.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Paramètres</h1>
        <p className="mt-1 text-slate-400">Gérez votre abonnement HomeBudget</p>
      </div>

      {/* Feedback transient retour Stripe (checkout succès/annulé, maj CB) */}
      <Suspense>
        <SubscriptionBanner />
      </Suspense>

      {/* Bandeau persistant résiliation en cours */}
      {isCanceled && renewalLabel && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-5 py-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-amber-400 text-lg leading-none" aria-hidden="true">⚠</span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-300">
                Abonnement résilié — accès garanti jusqu&apos;au {renewalLabel}
              </p>
              <p className="text-xs text-amber-400/80 leading-relaxed">
                Toutes vos données et fonctionnalités PRO restent disponibles jusqu&apos;à cette date.
                Après, votre compte passera automatiquement en version gratuite (aucune donnée supprimée).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pl-8">
            <ManageButton label="Réactiver mon abonnement" />
          </div>
        </div>
      )}

      {/* Plan actuel */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-slate-400">Plan actuel</p>
            <PlanBadge
              status={family.subscriptionStatus}
              endsAt={family.subscriptionEndsAt}
            />
            {plan === "PRO" && !isCanceled && renewalLabel && (
              <p className="text-xs text-slate-500">
                Renouvellement le <span className="text-slate-400">{renewalLabel}</span>
              </p>
            )}
          </div>
          {plan === "PRO" && family.stripeCustomerId && !isCanceled && (
            <div className="flex flex-col items-end gap-2">
              <ManageButton />
              <CancelButton isCanceled={isCanceled} />
            </div>
          )}
        </div>
      </div>

      {/* PRO_CANCELED ou FREE → options d'abonnement */}
      {(plan === "FREE" || isCanceled) && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white">
              {isCanceled ? "Se réabonner" : "Passer à PRO"}
            </h2>
            <p className="mt-0.5 text-sm text-slate-400">
              {isCanceled
                ? "Réactivez votre abonnement à tout moment, sans perdre vos données."
                : "Accès illimité à toutes les fonctionnalités."}
            </p>
          </div>
          <UpgradeOptions />
        </div>
      )}

      {/* Changer de cadence — masqué si résiliation en cours */}
      {plan === "PRO" && !isCanceled && family.stripeSubscriptionId && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-medium text-slate-400">Changer de plan</h2>
          <PlanSwitch currentPriceId={family.stripePriceId} />
        </div>
      )}

      {/* Moyen de paiement (PRO uniquement) */}
      {paymentMethod && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-400">Moyen de paiement</h2>
            <UpdatePaymentButton />
          </div>
          <PaymentMethodCard
            brand={paymentMethod.brand}
            last4={paymentMethod.last4}
            expMonth={paymentMethod.expMonth}
            expYear={paymentMethod.expYear}
          />
        </div>
      )}

      {/* Historique des factures (PRO uniquement) */}
      {plan === "PRO" && family.stripeCustomerId && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-medium text-slate-400">Historique des factures</h2>
          <InvoiceList invoices={invoices} />
        </div>
      )}

      {/* Tableau comparatif */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-medium text-slate-400">Fonctionnalité</th>
              <th className="px-4 py-3 text-center font-medium text-slate-400">FREE</th>
              <th className="px-4 py-3 text-center font-semibold text-amber-400">PRO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {limits.map((row) => (
              <tr key={row.label}>
                <td className="px-4 py-3 text-slate-300">{row.label}</td>
                <td className="px-4 py-3 text-center text-slate-400">{row.free}</td>
                <td className="px-4 py-3 text-center font-medium text-amber-300">{row.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Données personnelles */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-sm font-medium text-slate-400">Mes données personnelles</h2>
          <p className="mt-1 text-xs text-slate-500">
            Conformément au RGPD, vous pouvez exporter ou supprimer toutes vos données.
          </p>
        </div>
        <AccountActions />
      </div>

      {/* Liens légaux */}
      <nav className="flex gap-4 text-xs text-slate-500">
        <a href="/legal/cgu" className="transition-colors hover:text-slate-300">CGU</a>
        <a href="/legal/cgv" className="transition-colors hover:text-slate-300">CGV</a>
        <a href="/legal/mentions-legales" className="transition-colors hover:text-slate-300">Mentions légales</a>
        <a href="/legal/confidentialite" className="transition-colors hover:text-slate-300">Confidentialité</a>
      </nav>
    </div>
  );
}
