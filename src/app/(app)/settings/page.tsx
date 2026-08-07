import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getActivePlan, PLAN_LIMITS } from "@/lib/subscription";
import PlanBadge from "@/components/subscription/PlanBadge";
import SettingsActions from "@/components/subscription/SettingsActions";
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

  const family = await prisma.family.findUnique({
    where: { id: session.user.familyId },
    select: {
      subscriptionStatus: true,
      subscriptionEndsAt: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });
  if (!family) redirect("/");

  const plan = getActivePlan(family.subscriptionStatus, family.subscriptionEndsAt);

  // Fetch Stripe data only for PRO users with a Stripe customer
  let invoices: ReturnType<typeof mapStripeInvoice>[] = [];
  let paymentMethod: PaymentMethodInfo = null;

  if (plan === "PRO" && family.stripeCustomerId) {
    try {
      const [invoiceList, subscription] = await Promise.all([
        stripe.invoices.list({ customer: family.stripeCustomerId, limit: 10 }),
        family.stripeSubscriptionId
          ? stripe.subscriptions.retrieve(family.stripeSubscriptionId, {
              expand: ["default_payment_method"],
            })
          : null,
      ]);

      invoices = invoiceList.data.map(mapStripeInvoice);

      const pm = subscription?.default_payment_method;
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
    } catch {
      // Stripe not configured or network error — degrade gracefully
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Paramètres</h1>
        <p className="mt-1 text-slate-400">Gérez votre abonnement HomeBudget</p>
      </div>

      {/* Plan actuel */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Plan actuel</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-lg font-semibold text-white">{plan}</span>
              <PlanBadge
                status={family.subscriptionStatus}
                endsAt={family.subscriptionEndsAt}
              />
            </div>
            {plan === "PRO" && family.subscriptionEndsAt && (
              <p className="mt-1 text-xs text-slate-500">
                Renouvellement le{" "}
                {family.subscriptionEndsAt.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
          <SettingsActions
            plan={plan}
            hasStripeCustomer={!!family.stripeCustomerId}
          />
        </div>
      </div>

      {/* Moyen de paiement (PRO uniquement) */}
      {paymentMethod && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-400">Moyen de paiement</h2>
            <SettingsActions plan={plan} hasStripeCustomer={!!family.stripeCustomerId} portalOnly label="Modifier" />
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

      {/* Liens légaux */}
      <nav className="flex gap-4 text-xs text-slate-500">
        <a href="/legal/cgu" className="hover:text-slate-300 transition-colors">CGU</a>
        <a href="/legal/cgv" className="hover:text-slate-300 transition-colors">CGV</a>
        <a href="/legal/mentions-legales" className="hover:text-slate-300 transition-colors">Mentions légales</a>
        <a href="/legal/confidentialite" className="hover:text-slate-300 transition-colors">Confidentialité</a>
      </nav>

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
                <td className="px-4 py-3 text-center text-amber-300 font-medium">{row.pro}</td>
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
    </div>
  );
}
