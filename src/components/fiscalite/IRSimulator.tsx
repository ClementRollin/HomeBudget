import type { IRSimulationResult } from "@/lib/fiscalite";

const fmt = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const pct = (r: number) => `${(r * 100).toFixed(1)} %`;

export default function IRSimulator({ result }: { result: IRSimulationResult }) {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "IR estimé", value: fmt(result.totalIR), sub: "barème + PFU" },
          { label: "Taux marginal", value: pct(result.marginalRate), sub: "tranche supérieure" },
          { label: "Taux effectif", value: pct(result.averageRate), sub: "sur revenus bruts" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.25rem] text-slate-500">{card.label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
            <p className="mt-1 text-xs text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Décomposition du revenu imposable */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
          Revenu net imposable — {fmt(result.taxableIncome)}
        </h3>
        <div className="space-y-2">
          {result.breakdown.map((line) => (
            <div key={line.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{line.label}</span>
              <span className={line.amount < 0 ? "text-emerald-400" : "text-white"}>
                {line.amount < 0 ? `− ${fmt(-line.amount)}` : fmt(line.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Détail IR */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
          Détail de l&apos;imposition
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-300">
              IR barème progressif ({result.parts} part{result.parts > 1 ? "s" : ""})
            </span>
            <span className="text-white">{fmt(result.irProgressive)}</span>
          </div>
          {result.pfuCapitalGains > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-300">PFU sur plus-values (12,8 %)</span>
              <span className="text-white">{fmt(result.pfuCapitalGains)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-white/10 pt-2 font-semibold">
            <span className="text-white">Total IR estimé</span>
            <span className="text-amber-300">{fmt(result.totalIR)}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600">
        Simulation indicative. Hors contributions sociales (17,2 %), décote, réductions et crédits d&apos;impôt.
        Basée sur le barème IR 2024. Consultez un conseiller fiscal pour une estimation définitive.
      </p>
    </div>
  );
}
