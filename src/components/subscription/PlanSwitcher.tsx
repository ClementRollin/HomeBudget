"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  currentPriceId: string | null;
};

const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY ?? "";
const ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_ANNUAL ?? "";

function PricingCard({
  label,
  price,
  sub,
  badge,
  isCurrent,
  loading,
  onAction,
  actionLabel,
}: {
  label: string;
  price: string;
  sub: string;
  badge?: string;
  isCurrent: boolean;
  loading: boolean;
  onAction: () => void;
  actionLabel: string;
}) {
  return (
    <div
      className={`relative rounded-xl border p-4 space-y-3 ${
        badge ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-card/50"
      }`}
    >
      {badge && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-black">
            {badge}
          </span>
        </div>
      )}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-xl font-bold text-white">
          {price.split("/")[0]}
          <span className="text-sm font-normal text-slate-400">/{price.split("/")[1]}</span>
        </p>
        <p className="text-xs text-slate-500">{sub}</p>
      </div>
      {isCurrent ? (
        <div className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-center text-xs font-medium text-emerald-400">
          Plan actuel
        </div>
      ) : (
        <button
          type="button"
          onClick={onAction}
          disabled={loading}
          className="w-full rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-60"
        >
          {loading ? "…" : actionLabel}
        </button>
      )}
    </div>
  );
}

// FREE user: show both options, clicking triggers checkout
export function UpgradeOptions() {
  const router = useRouter();
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);

  const handleCheckout = async (priceId: string, plan: "monthly" | "annual") => {
    if (!priceId) return;
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        console.error("[checkout]", err.error ?? res.status);
        return;
      }
      const data = await res.json() as { url?: string };
      if (data.url) router.push(data.url);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <PricingCard
        label="Mensuel"
        price="9,90 €/mois"
        sub="Sans engagement"
        isCurrent={false}
        loading={loading === "monthly"}
        onAction={() => void handleCheckout(MONTHLY_PRICE_ID, "monthly")}
        actionLabel="Passer PRO"
      />
      <PricingCard
        label="Annuel"
        price="99 €/an"
        sub="soit 8,25 €/mois"
        badge="-17%"
        isCurrent={false}
        loading={loading === "annual"}
        onAction={() => void handleCheckout(ANNUAL_PRICE_ID, "annual")}
        actionLabel="Passer PRO"
      />
    </div>
  );
}

// PRO user: show both options with current plan highlighted, allow plan switch
export function PlanSwitch({ currentPriceId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMonthly = currentPriceId === MONTHLY_PRICE_ID;
  const isAnnual = currentPriceId === ANNUAL_PRICE_ID;

  const handleSwitch = async (targetPriceId: string, plan: "monthly" | "annual") => {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/stripe/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPriceId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        setError(err.error ?? "Erreur lors du changement de plan");
        return;
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PricingCard
          label="Mensuel"
          price="9,90 €/mois"
          sub="Sans engagement"
          isCurrent={isMonthly}
          loading={loading === "monthly"}
          onAction={() => void handleSwitch(MONTHLY_PRICE_ID, "monthly")}
          actionLabel="Passer au mensuel"
        />
        <PricingCard
          label="Annuel"
          price="99 €/an"
          sub="soit 8,25 €/mois"
          badge="-17%"
          isCurrent={isAnnual}
          loading={loading === "annual"}
          onAction={() => void handleSwitch(ANNUAL_PRICE_ID, "annual")}
          actionLabel="Passer à l'annuel"
        />
      </div>
      {error && (
        <p className="text-xs text-rose-400">{error}</p>
      )}
      <p className="text-xs text-slate-500">
        {isMonthly
          ? "Passer à l'annuel = différence facturée immédiatement au prorata."
          : "Passer au mensuel = changement effectif à la prochaine échéance."}
      </p>
    </div>
  );
}
