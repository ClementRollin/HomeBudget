import type { SubscriptionStatus } from "@prisma/client";

import { getActivePlan } from "@/lib/subscription";

export default function PlanBadge({
  status,
  endsAt,
}: {
  status: SubscriptionStatus;
  endsAt: Date | null;
}) {
  const plan = getActivePlan(status, endsAt);

  if (plan === "PRO") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400 ring-1 ring-amber-500/30">
        PRO
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-slate-700/60 px-2 py-0.5 text-xs font-medium text-slate-400 ring-1 ring-slate-600/50">
      FREE
    </span>
  );
}
