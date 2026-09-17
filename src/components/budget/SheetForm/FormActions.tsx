"use client";

import { useState } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface FormActionsProps {
  isNew: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  serverMessage: string | null;
  onDelete: () => void;
}

export const FormActions = ({
  isNew,
  isSubmitting,
  isDeleting,
  serverMessage,
  onDelete,
}: FormActionsProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      {serverMessage && <p className="text-sm text-rose-400">{serverMessage}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-widest text-slate-900 transition hover:bg-teal-300 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Enregistrement...
            </>
          ) : isNew ? (
            "Créer la fiche"
          ) : (
            "Mettre à jour"
          )}
        </button>
        {!isNew && (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
            className="rounded-2xl border border-rose-500/50 px-4 py-2 text-sm text-rose-300"
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </button>
        )}
      </div>
      <ConfirmModal
        isOpen={showConfirm}
        title="Supprimer cette fiche ?"
        message="Cette action est irréversible. La fiche de compte et toutes ses données seront définitivement supprimées."
        onConfirm={() => {
          setShowConfirm(false);
          onDelete();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};
