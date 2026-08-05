"use client";

import { useState } from "react";

type Props = {
  documentId: string;
  cases: Record<string, number>;
  confidence: number | null;
};

// Labels lisibles pour les cases fiscales connues
const CASE_LABELS: Record<string, string> = {
  "1AJ": "Salaires D1",
  "1BJ": "Salaires D2",
  "1AS": "Pensions D1",
  "1BS": "Pensions D2",
  "6NS": "PER déductible D1",
  "6NT": "PER déductible D2",
  "6NU": "PER déductible personne à charge",
  "2DC": "Dividendes",
  "2CH": "Produits d'épargne",
  "3VG": "Plus-values",
  "4BA": "Revenus fonciers nets",
};

const caseLabel = (code: string) => CASE_LABELS[code] ?? code;

export default function ExtractedCasesEditor({ documentId, cases: initialCases, confidence }: Props) {
  const [cases, setCases] = useState<Record<string, number>>(initialCases);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (code: string, value: string) => {
    const num = Number(value);
    setCases((prev) => ({ ...prev, [code]: isNaN(num) ? 0 : Math.round(num) }));
    setSaved(false);
  };

  const handleValidate = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/tax-documents/${documentId}/validate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cases }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de la validation");
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  const codes = Object.keys(cases).sort();

  if (codes.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        Aucune case extraite. Ajoutez les cases manuellement si besoin.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {confidence !== null && (
        <p className="text-xs text-slate-500">
          Confiance de l&apos;extraction IA :{" "}
          <span className={confidence >= 0.6 ? "text-emerald-400" : "text-amber-400"}>
            {(confidence * 100).toFixed(0)} %
          </span>
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-widest text-slate-500">
              <th className="pb-3 pr-4">Case</th>
              <th className="pb-3 pr-4">Libellé</th>
              <th className="pb-3">Montant (€)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {codes.map((code) => (
              <tr key={code}>
                <td className="py-3 pr-4 font-mono font-semibold text-white">{code}</td>
                <td className="py-3 pr-4 text-slate-400">{caseLabel(code)}</td>
                <td className="py-3">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={cases[code] ?? 0}
                    onChange={(e) => handleChange(code, e.target.value)}
                    className="w-36 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-right text-white focus:border-blue-400/50 focus:outline-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-400">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleValidate}
        disabled={saving}
        className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
      >
        {saving ? "Enregistrement…" : saved ? "Validé ✓" : "Valider les cases"}
      </button>
    </div>
  );
}
