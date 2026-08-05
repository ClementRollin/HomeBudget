"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type UploadedDoc = {
  documentId: string;
  status: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
};

type StatusResponse = {
  id: string;
  extractionStatus: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
};

const POLL_INTERVAL_MS = 3_000;

export default function TaxDocumentUploader({ taxYear }: { taxYear: number }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDoc | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollStatus = useCallback(
    (documentId: string) => {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/tax-documents?taxYear=${taxYear}`);
          if (!res.ok) return;
          const docs = (await res.json()) as StatusResponse[];
          const doc = docs.find((d) => d.id === documentId);
          if (!doc) return;

          if (doc.extractionStatus === "DONE" || doc.extractionStatus === "FAILED") {
            clearInterval(interval);
            setUploadedDoc({ documentId, status: doc.extractionStatus });
            router.refresh();
          } else {
            setUploadedDoc({ documentId, status: doc.extractionStatus });
          }
        } catch {
          // Silencieux — on réessaie au prochain tick
        }
      }, POLL_INTERVAL_MS);

      return () => clearInterval(interval);
    },
    [taxYear, router]
  );

  useEffect(() => {
    if (uploadedDoc && (uploadedDoc.status === "PENDING" || uploadedDoc.status === "PROCESSING")) {
      return pollStatus(uploadedDoc.documentId);
    }
  }, [uploadedDoc, pollStatus]);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setError("Format non supporté. Utilisez PDF, JPEG ou PNG.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("Fichier trop volumineux (max 10 Mo).");
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("taxYear", String(taxYear));

      try {
        const res = await fetch("/api/tax-documents", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "Erreur lors de l'upload");
        }

        const data = (await res.json()) as { documentId: string; status: string };
        setUploadedDoc({
          documentId: data.documentId,
          status: "PENDING",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setUploading(false);
      }
    },
    [taxYear]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  const statusLabel: Record<UploadedDoc["status"], string> = {
    PENDING: "En attente d'extraction…",
    PROCESSING: "Extraction IA en cours…",
    DONE: "Extraction terminée.",
    FAILED: "Extraction échouée. Vous pouvez saisir les cases manuellement.",
  };

  const statusColor: Record<UploadedDoc["status"], string> = {
    PENDING: "text-amber-400",
    PROCESSING: "text-blue-400",
    DONE: "text-emerald-400",
    FAILED: "text-rose-400",
  };

  return (
    <div className="space-y-4">
      {/* Zone drag & drop */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`
          relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed
          p-10 text-center transition-colors
          ${dragging ? "border-blue-400 bg-blue-400/5" : "border-white/10 bg-white/[0.02] hover:border-white/20"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          className="hidden"
          onChange={onInputChange}
        />
        <div className="text-4xl text-slate-500">📄</div>
        <div>
          <p className="text-sm font-medium text-slate-300">
            Déposez votre déclaration 2042 ou avis d&apos;imposition ici
          </p>
          <p className="mt-1 text-xs text-slate-500">PDF, JPEG ou PNG — max 10 Mo</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          {uploading ? "Envoi en cours…" : "Sélectionner un fichier"}
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-400">
          {error}
        </p>
      )}

      {/* Statut extraction */}
      {uploadedDoc && (
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
          {(uploadedDoc.status === "PENDING" || uploadedDoc.status === "PROCESSING") && (
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          )}
          <p className={`text-sm font-medium ${statusColor[uploadedDoc.status]}`}>
            {statusLabel[uploadedDoc.status]}
          </p>
        </div>
      )}
    </div>
  );
}
