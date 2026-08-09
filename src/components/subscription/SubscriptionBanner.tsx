"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type BannerType = "checkout_success" | "checkout_canceled" | "portal_pm_updated" | "portal_generic";

export default function SubscriptionBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [banner, setBanner] = useState<BannerType | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const portal = searchParams.get("portal");
    const action = searchParams.get("action");

    if (success === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBanner("checkout_success");
    } else if (canceled === "1") {
      setBanner("checkout_canceled");
    } else if (portal === "1") {
      // sub cancellation is handled by the persistent banner — don't duplicate
      if (action === "pm_updated") {
        setBanner("portal_pm_updated");
      } else if (action !== "canceled") {
        setBanner("portal_generic");
      }
    }

    if (success || canceled || portal) {
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      url.searchParams.delete("canceled");
      url.searchParams.delete("portal");
      url.searchParams.delete("action");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);

  if (!banner) return null;

  const config: Record<BannerType, { text: string; cls: string }> = {
    checkout_success: {
      text: "Abonnement PRO activé. Bienvenue !",
      cls: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    },
    checkout_canceled: {
      text: "Paiement annulé. Votre abonnement n'a pas été modifié.",
      cls: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    },
    portal_pm_updated: {
      text: "Moyen de paiement mis à jour.",
      cls: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    },
    portal_generic: {
      text: "Vos paramètres d'abonnement ont été mis à jour.",
      cls: "border-sky-500/20 bg-sky-500/10 text-sky-400",
    },
  };

  const { text, cls } = config[banner];

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${cls}`}>
      {text}
    </div>
  );
}
