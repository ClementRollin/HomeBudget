"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Invitation = {
  id: string;
  familyId: string;
  createdAt: string;
  expiresAt: string | null;
  usedAt: string | null;
};

type Props = {
  invitations: Invitation[];
  isOwner: boolean;
};

const InvitationManager = ({ invitations, isOwner }: Props) => {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevokingId] = useState<string | null>(null);
  const [newCode, setNewCode] = useState<string | null>(null);
  const [newExpiresAt, setNewExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOwner) return null;

  const handleGenerate = async () => {
    setGenerating(true);
    setNewCode(null);
    setError(null);
    try {
      const res = await fetch("/api/family/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        setNewCode(data.rawCode as string);
        setNewExpiresAt(data.expiresAt as string | null);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Erreur lors de la génération du code.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (invitationId: string) => {
    setRevokingId(invitationId);
    setError(null);
    try {
      const res = await fetch(`/api/family/invitations/${invitationId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Erreur lors de la révocation.");
      }
    } finally {
      setRevokingId(null);
    }
  };

  const handleCopy = async () => {
    if (!newCode) return;
    await navigator.clipboard.writeText(newCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-400">
          {error}
        </p>
      )}

      {/* Code nouvellement généré — affiché une seule fois */}
      {newCode && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
          <p className="mb-2 text-xs uppercase tracking-[0.2rem] text-emerald-400">
            Nouveau code d&apos;invitation
          </p>
          <p className="mb-1 text-xs text-slate-400">
            Ce code ne sera plus visible après fermeture de la page.
          </p>
          {newExpiresAt && (
            <p className="mb-3 text-xs text-slate-500">
              Expire le {new Date(newExpiresAt).toLocaleDateString("fr-FR")}
            </p>
          )}
          <div className="flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={newCode}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-mono text-sm text-white focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              {copied ? "Copié !" : "Copier"}
            </button>
          </div>
        </div>
      )}

      {/* Invitations actives */}
      {invitations.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2rem] text-slate-500">
            Invitations actives
          </p>
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.04] px-5 py-4"
            >
              <div>
                <p className="text-sm text-white">
                  Créée le{" "}
                  {new Date(inv.createdAt).toLocaleDateString("fr-FR")}
                </p>
                {inv.expiresAt ? (
                  <p className="text-xs text-slate-400">
                    Expire le {new Date(inv.expiresAt).toLocaleDateString("fr-FR")}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">Sans expiration</p>
                )}
              </div>
              <button
                type="button"
                disabled={revoking === inv.id}
                onClick={() => handleRevoke(inv.id)}
                className="rounded-lg border border-rose-400/20 px-3 py-1.5 text-xs text-rose-400 transition hover:bg-rose-400/10 disabled:opacity-50"
              >
                {revoking === inv.id ? "Révocation…" : "Révoquer"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bouton génération */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating}
        className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-accent disabled:opacity-50"
      >
        {generating ? "Génération…" : "Générer nouveau code"}
      </button>
    </div>
  );
};

export default InvitationManager;
