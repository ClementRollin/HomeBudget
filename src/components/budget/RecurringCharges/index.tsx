"use client";

import { useState } from "react";
import { useRecurringCharges } from "@/hooks/useRecurringCharges";
import { ChargeRow, type Member } from "./ChargeRow";
import { AddChargeForm } from "./AddChargeForm";
import type { RecurringCharge } from "./ChargeRow";

interface RecurringChargesSectionProps {
  members: Member[];
}

export default function RecurringChargesSection({ members }: RecurringChargesSectionProps) {
  const { charges, loading, activeCharges, totalActive, add, toggle, remove, save } =
    useRecurringCharges();
  const [adding, setAdding] = useState(false);

  const handleAdd = async (data: Omit<RecurringCharge, "id" | "isActive" | "memberName">) => {
    const ok = await add(data);
    if (ok) setAdding(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">Charges récurrentes</h2>
          <p className="mt-0.5 text-sm text-slate-400">
            Injectées automatiquement dans chaque nouvelle fiche mensuelle.
          </p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 py-2">Chargement…</p>
      ) : (
        <div className="space-y-2">
          {charges.map((charge) => (
            <ChargeRow
              key={charge.id}
              charge={charge}
              members={members}
              onToggle={toggle}
              onDelete={remove}
              onSave={save}
            />
          ))}
          {charges.length === 0 && !adding && (
            <p className="text-sm text-slate-500 py-2">
              Aucune charge récurrente — cliquez sur Ajouter pour commencer.
            </p>
          )}
        </div>
      )}

      {adding && (
        <AddChargeForm
          members={members}
          onAdd={handleAdd}
          onCancel={() => setAdding(false)}
        />
      )}

      {activeCharges.length > 0 && !adding && (
        <div className="pt-2 border-t border-white/5 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            {activeCharges.length} charge{activeCharges.length > 1 ? "s" : ""} active
            {activeCharges.length > 1 ? "s" : ""}
          </span>
          <span className="text-sm font-semibold text-white">
            {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
              totalActive,
            )}{" "}
            / mois
          </span>
        </div>
      )}
    </div>
  );
}
