"use client";

import { useState } from "react";

import CopyInviteCodeButton from "@/components/account/CopyInviteCodeButton";

const InviteCodeManager = () => {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const generateCode = async () => {
    setStatus("loading");
    setMessage(null);
    setCode(null);
    setExpiresAt(null);
    const response = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      setStatus("error");
      setMessage(error?.message ?? "Impossible de generer un nouveau code.");
      return;
    }

    const payload = await response.json();
    setCode(payload.code);
    setExpiresAt(payload.expiresAt ?? null);
    setStatus("success");
  };

  const revokeCodes = async () => {
    setStatus("loading");
    setMessage(null);
    const response = await fetch("/api/invitations", { method: "DELETE" });
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      setStatus("error");
      setMessage(error?.message ?? "Impossible de revoquer les codes.");
      return;
    }
    setStatus("idle");
    setCode(null);
    setExpiresAt(null);
    setMessage("Tous les anciens codes ont ete revoques.");
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3rem] text-slate-500">
          Codes d&apos;invitation
        </p>
        <p className="text-sm text-slate-400">
          Generez un code unique (valide quelques jours) et partagez-le immediatement. Le code
          n&apos;est pas memorise en clair : notez-le ou copiez-le avant de quitter la page.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={generateCode}
          disabled={status === "loading"}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
        >
          Generer un code
        </button>
        <button
          type="button"
          onClick={revokeCodes}
          disabled={status === "loading"}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
        >
          Revoquer tous les codes
        </button>
        {code ? <CopyInviteCodeButton code={code} /> : null}
      </div>
      {code ? (
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <p className="text-xs uppercase tracking-[0.3rem] text-slate-500">Code genere</p>
          <p className="text-3xl font-semibold text-white">{code}</p>
          <p className="text-xs text-slate-400">
            {expiresAt
              ? `Expire le ${new Date(expiresAt).toLocaleString("fr-FR")}`
              : "Pas de date d'expiration (pensez a le renouveler regulierement)."}
          </p>
        </div>
      ) : null}
      {message ? (
        <p className={`text-sm ${status === "error" ? "text-rose-300" : "text-emerald-300"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
};

export default InviteCodeManager;
