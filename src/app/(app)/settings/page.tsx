import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActivePlan, PLAN_LIMITS } from "@/lib/subscription";
import PlanBadge from "@/components/subscription/PlanBadge";
import SettingsActions from "@/components/subscription/SettingsActions";

export default async function SettingsPage() {
  const session = await getCurrentSession();
  if (!session?.user?.familyId) redirect("/");

  const family = await prisma.family.findUnique({
    where: { id: session.user.familyId },
    select: {
      subscriptionStatus: true,
      subscriptionEndsAt: true,
      stripeCustomerId: true,
    },
  });
  if (!family) redirect("/");

  const plan = getActivePlan(family.subscriptionStatus, family.subscriptionEndsAt);

  const limits = [
    { label: "Fiches mensuelles", free: PLAN_LIMITS.FREE.maxSheets, pro: "Illimité" },
    { label: "Actifs patrimoniaux", free: PLAN_LIMITS.FREE.maxAssets, pro: "Illimité" },
    { label: "Dettes", free: PLAN_LIMITS.FREE.maxDebts, pro: "Illimité" },
    { label: "Objectifs", free: PLAN_LIMITS.FREE.maxGoals, pro: "Illimité" },
    { label: "Déclaration 2042 + IA", free: "❌", pro: "✅" },
    { label: "Quotient familial + IR", free: "❌", pro: "✅" },
    { label: "Comparaison N-1", free: "❌", pro: "✅" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Paramètres</h1>
        <p className="mt-1 text-slate-400">Gérez votre abonnement HomeBudget</p>
      </div>

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
    </div>
  );
}
