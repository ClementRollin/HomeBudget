"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Flow = "full" | "cancel" | "update_pm";

async function openPortal(flow: Flow, router: ReturnType<typeof useRouter>) {
  const res = await fetch("/api/stripe/create-portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ flow }),
  });
  const data = await res.json() as { url?: string; error?: string };
  if (data.url) router.push(data.url);
}

export function ManageButton({ label = "Gérer l'abonnement" }: { label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => { setLoading(true); await openPortal("full", router).finally(() => setLoading(false)); }}
      className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-60"
    >
      {loading ? "Redirection…" : label}
    </button>
  );
}

export function UpdatePaymentButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => { setLoading(true); await openPortal("update_pm", router).finally(() => setLoading(false)); }}
      className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-60"
    >
      {loading ? "Redirection…" : "Modifier"}
    </button>
  );
}

export function CancelButton({ isCanceled }: { isCanceled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  if (isCanceled) return null;
  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => { setLoading(true); await openPortal("cancel", router).finally(() => setLoading(false)); }}
      className="rounded-xl border border-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-60"
    >
      {loading ? "Redirection…" : "Annuler l'abonnement"}
    </button>
  );
}

// Legacy default export — kept for backward compatibility in places still using it
export default function SettingsActions({
  plan,
  hasStripeCustomer,
  portalOnly = false,
  label,
}: {
  plan: "FREE" | "PRO";
  hasStripeCustomer: boolean;
  portalOnly?: boolean;
  label?: string;
}) {
  if ((plan === "PRO" && hasStripeCustomer) || portalOnly) {
    return <ManageButton label={label} />;
  }
  return null;
}
