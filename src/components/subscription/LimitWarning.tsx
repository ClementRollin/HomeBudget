"use client";

export default function LimitWarning({
  resource,
  current,
  limit,
}: {
  resource: string;
  current: number;
  limit: number;
}) {
  if (current < limit - 1) return null;

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-300">
      Vous approchez de la limite FREE — {current}/{limit} {resource}. Passez PRO pour continuer sans restriction.
    </div>
  );
}
