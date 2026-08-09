"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "hb_cookie_consent_v1";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setVisible(!localStorage.getItem(STORAGE_KEY)); }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-900/95 backdrop-blur-sm px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-400 leading-relaxed">
          HomeBudget utilise uniquement des cookies techniques nécessaires au fonctionnement
          du service (session d&apos;authentification). Aucun cookie publicitaire n&apos;est
          utilisé.{" "}
          <a href="/legal/confidentialite" className="underline hover:text-slate-200 transition-colors">
            En savoir plus
          </a>
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-xl bg-slate-700 px-4 py-2 text-xs font-medium text-white hover:bg-slate-600 transition-colors"
        >
          Compris
        </button>
      </div>
    </div>
  );
}
