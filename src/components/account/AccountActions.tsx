"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/ToastProvider";

export default function AccountActions() {
  const { addToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/account", { method: "GET" });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        addToast(data.error ?? "Erreur lors de l'export", "error");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `homebudget-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        addToast(data.error ?? "Erreur lors de la suppression", "error");
        setShowDeleteConfirm(false);
        return;
      }
      await signOut({ callbackUrl: "/" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="rounded-xl border border-border px-4 py-2 text-sm text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-60"
        >
          {exporting ? "Export en cours…" : "Exporter mes données (JSON)"}
        </button>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="rounded-xl border border-red-800/50 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
        >
          Supprimer mon compte
        </button>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Supprimer votre compte ?"
        message="Cette action est irréversible. Toutes vos données (fiches, actifs, dettes, objectifs) seront définitivement supprimées. Votre abonnement Stripe sera également annulé."
        confirmLabel={deleting ? "Suppression…" : "Supprimer définitivement"}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
