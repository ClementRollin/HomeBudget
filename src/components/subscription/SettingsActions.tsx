"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { PlanName } from "@/lib/subscription";

export default function SettingsActions({
  plan,
  hasStripeCustomer,
}: {
  plan: PlanName;
  hasStripeCustomer: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY;
      if (!priceId) {
        console.error("NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY manquant");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json() as { url?: string };
      if (data.url) router.push(data.url);
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-portal", { method: "POST" });
      const data = await res.json() as { url?: string };
      if (data.url) router.push(data.url);
    } finally {
      setLoading(false);
    }
  };

  if (plan === "PRO" && hasStripeCustomer) {
    return (
      <button
        type="button"
        onClick={handlePortal}
        disabled={loading}
        className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-60"
      >
        {loading ? "Redirection…" : "Gérer l'abonnement"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleUpgrade}
      disabled={loading}
      className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-60"
    >
      {loading ? "Redirection…" : "Passer PRO — 9,90 €/mois"}
    </button>
  );
}
