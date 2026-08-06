"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { PlanName } from "@/lib/subscription";

const PRO_FEATURES = [
  "Fiches mensuelles illimitées (FREE : 3 max)",
  "Actifs, dettes et objectifs illimités",
  "Déclaration 2042 assistée par IA",
  "Quotient familial et simulation IR",
  "Comparaison N-1 sur votre déclaration",
];

export default function UpgradeGate({
  plan,
  feature,
  children,
}: {
  plan: PlanName;
  feature: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (plan === "PRO") return <>{children}</>;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY }),
      });
      const data = await res.json() as { url?: string };
      if (data.url) router.push(data.url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
      <div className="mb-4">
        <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
          PRO
        </span>
        <h3 className="mt-2 text-base font-semibold text-white">{feature}</h3>
        <p className="mt-1 text-sm text-slate-400">
          Cette fonctionnalité est réservée aux abonnés PRO.
        </p>
      </div>
      <ul className="mb-5 space-y-1.5">
        {PRO_FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="mt-0.5 text-amber-400">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-60"
      >
        {loading ? "Redirection…" : "Passer PRO — 9,90 €/mois"}
      </button>
    </div>
  );
}
