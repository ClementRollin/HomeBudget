"use client";

import { formatCurrency } from "@/lib/format";
import type { SimulationResult } from "@/lib/amortization";

interface DebtSimulatorProps {
  extraPayment: number;
  simResult: SimulationResult | null;
  onExtraPaymentChange: (n: number) => void;
  onCalculate: () => void;
}

export const DebtSimulator = ({
  extraPayment,
  simResult,
  onExtraPaymentChange,
  onCalculate,
}: DebtSimulatorProps) => (
  <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-4">
    <p className="text-sm font-semibold text-white">Simulation — Remboursement anticipé</p>
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="text-xs text-slate-400">Versement supplémentaire (€)</label>
        <input
          type="number"
          step="100"
          min={0}
          value={extraPayment}
          onChange={(e) => onExtraPaymentChange(parseFloat(e.target.value) || 0)}
          className="mt-1 block w-48 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
        />
      </div>
      <button
        type="button"
        onClick={onCalculate}
        className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-900"
      >
        Calculer
      </button>
    </div>
    {simResult !== null && (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {(
          [
            { label: "Durée actuelle", value: `${simResult.standardMonths} mois`, highlight: false },
            {
              label: "Durée avec versement",
              value: `${simResult.withExtraMonths} mois`,
              highlight: false,
            },
            { label: "Mois gagnés", value: `${simResult.monthsSaved} mois`, highlight: true },
            {
              label: "Intérêts économisés",
              value: formatCurrency(simResult.interestSaved),
              highlight: true,
            },
          ] as const
        ).map((card) => (
          <div key={card.label} className="rounded-xl border border-white/5 bg-white/[0.04] p-3">
            <p className="text-xs text-slate-500">{card.label}</p>
            <p
              className={`mt-1 text-lg font-semibold ${
                card.highlight ? "text-emerald-300" : "text-white"
              }`}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>
    )}
    {simResult === null && extraPayment > 0 && (
      <p className="text-xs text-slate-400">Cliquez sur Calculer pour voir l&apos;impact.</p>
    )}
  </div>
);
