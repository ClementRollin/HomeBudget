"use client";

import { formatCurrency } from "@/lib/format";
import type { DecryptedDebt } from "@/lib/patrimoine";
import type { SimulationResult } from "@/lib/amortization";
import { DebtSimulator } from "./DebtSimulator";

interface DebtRowProps {
  debt: DecryptedDebt;
  syncMessage: string | undefined;
  syncing: boolean;
  simulationOpen: string | null;
  extraPayment: number;
  simResult: SimulationResult | null;
  onEdit: (debt: DecryptedDebt) => void;
  onDelete: (id: string) => void;
  onSync: (id: string) => void;
  onToggleSimulation: (id: string | null) => void;
  onExtraPaymentChange: (n: number) => void;
  onCalculate: (debt: DecryptedDebt) => void;
}

export const DebtRow = ({
  debt,
  syncMessage,
  syncing,
  simulationOpen,
  extraPayment,
  simResult,
  onEdit,
  onDelete,
  onSync,
  onToggleSimulation,
  onExtraPaymentChange,
  onCalculate,
}: DebtRowProps) => (
  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="font-semibold text-white">{debt.label}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Solde :{" "}
          <span className="text-rose-300 font-semibold">{formatCurrency(debt.balance)}</span>
          {" · "}
          {debt.rate.toFixed(2)} %/an
          {" · "}
          {formatCurrency(debt.monthlyPayment)}/mois
          {debt.monthsRemaining !== null && ` · ${debt.monthsRemaining} mois restants`}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onToggleSimulation(simulationOpen === debt.id ? null : debt.id)}
          className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-accent/50 hover:text-accent"
        >
          {simulationOpen === debt.id ? "Fermer" : "Simuler"}
        </button>
        <button
          type="button"
          onClick={() => onSync(debt.id)}
          disabled={syncing}
          className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-teal-500/50 hover:text-teal-400 disabled:opacity-50"
        >
          {syncing ? "En cours..." : "→ Fiche du mois"}
        </button>
        <button
          type="button"
          onClick={() => onEdit(debt)}
          className="text-xs text-slate-400 hover:text-white px-2"
        >
          Modifier
        </button>
        <button
          type="button"
          onClick={() => onDelete(debt.id)}
          className="text-xs text-rose-400 hover:text-rose-300 px-2"
        >
          Supprimer
        </button>
      </div>
    </div>

    {syncMessage && <p className="text-xs text-teal-400">{syncMessage}</p>}

    {simulationOpen === debt.id && (
      <DebtSimulator
        extraPayment={extraPayment}
        simResult={simResult}
        onExtraPaymentChange={(n) => {
          onExtraPaymentChange(n);
        }}
        onCalculate={() => onCalculate(debt)}
      />
    )}
  </div>
);
