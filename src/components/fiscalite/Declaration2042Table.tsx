"use client";

import type { Declaration2042Result, Declaration2042Case } from "@/lib/fiscalite";

type Props = {
  result: Declaration2042Result;
};

const formatEuro = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const DeltaBadge = ({ delta }: { delta?: number }) => {
  if (delta === undefined || delta === null) return null;
  const isPositive = delta > 0;
  const label = `${isPositive ? "+" : ""}${delta.toFixed(1)} %`;
  // Pour l'impôt : hausse = rouge, baisse = vert
  return (
    <span
      className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
        isPositive ? "bg-rose-400/10 text-rose-400" : "bg-emerald-400/10 text-emerald-400"
      }`}
    >
      {label}
    </span>
  );
};

const CopyButton = ({ value }: { value: number }) => {
  return (
    <button
      type="button"
      onClick={() => void navigator.clipboard.writeText(String(Math.round(value)))}
      className="ml-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
      title="Copier pour le formulaire Cerfa"
    >
      Copier
    </button>
  );
};

const SourceBadge = ({ source }: { source: Declaration2042Case["source"] }) => {
  const map: Record<Declaration2042Case["source"], { label: string; className: string }> = {
    computed: { label: "Calculé", className: "text-blue-400 bg-blue-400/10" },
    manual: { label: "Manuel", className: "text-amber-400 bg-amber-400/10" },
    ai_extracted: { label: "IA", className: "text-purple-400 bg-purple-400/10" },
  };
  const { label, className } = map[source];
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{label}</span>
  );
};

const groupBySection = (cases: Declaration2042Case[]) => {
  const sections = new Map<string, Declaration2042Case[]>();
  for (const c of cases) {
    const existing = sections.get(c.section) ?? [];
    existing.push(c);
    sections.set(c.section, existing);
  }
  return sections;
};

export default function Declaration2042Table({ result }: Props) {
  const { cases, warnings } = result;
  const sections = groupBySection(cases);

  return (
    <div className="space-y-6">
      {/* Avertissements */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-400"
            >
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Sections groupées */}
      {Array.from(sections.entries()).map(([section, sectionCases]) => (
        <div key={section} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
            {section}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs uppercase tracking-widest text-slate-500">
                  <th className="pb-3 pr-4">Case</th>
                  <th className="pb-3 pr-4">Libellé</th>
                  <th className="pb-3 pr-4 text-right">Montant N</th>
                  <th className="pb-3 pr-4 text-right">N-1</th>
                  <th className="pb-3 pr-4">Source</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sectionCases.map((c) => (
                  <tr key={c.code}>
                    <td className="py-3 pr-4 font-mono font-semibold text-white">
                      {c.code}
                      <span className="ml-1.5 text-xs text-slate-600">p.{c.page}</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-300">{c.label}</td>
                    <td className="py-3 pr-4 text-right font-semibold text-white">
                      {formatEuro(c.amount)}
                      <DeltaBadge delta={c.delta} />
                    </td>
                    <td className="py-3 pr-4 text-right text-slate-500">
                      {c.previousAmount !== undefined ? formatEuro(c.previousAmount) : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <SourceBadge source={c.source} />
                    </td>
                    <td className="py-3">
                      <CopyButton value={c.amount} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
