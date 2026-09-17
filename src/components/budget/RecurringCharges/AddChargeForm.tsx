"use client";

import { useEffect, useRef, useState } from "react";
import { CHARGE_TYPE_LABELS, CHARGE_TYPES } from "@/lib/validations/sheet";
import type { ChargeCategory, Member, RecurringCharge } from "./ChargeRow";

const CATEGORY_OPTIONS = CHARGE_TYPES.filter(
  (t) => t === "FIXE_COMMUN" || t === "FIXE_INDIVIDUEL",
) as ChargeCategory[];

interface AddChargeFormProps {
  members: Member[];
  onAdd: (data: Omit<RecurringCharge, "id" | "isActive" | "memberName">) => Promise<void>;
  onCancel: () => void;
}

export function AddChargeForm({ members, onAdd, onCancel }: AddChargeFormProps) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ChargeCategory>("FIXE_COMMUN");
  const [memberId, setMemberId] = useState("");
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !amount) return;
    setSaving(true);
    await onAdd({
      label: label.trim(),
      amount: parseFloat(amount) || 0,
      category,
      memberId: memberId || null,
    });
    setSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3"
    >
      <p className="text-sm font-medium text-emerald-400">Nouvelle charge récurrente</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="text-xs text-slate-400 mb-1 block">Intitulé</label>
          <input
            ref={ref}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex. Loyer, EDF, Assurance…"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Montant (€)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Catégorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ChargeCategory)}
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {CHARGE_TYPE_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Membre (optionnel)</label>
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">— Commun —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={saving || !label.trim() || !amount}
          className="px-4 py-1.5 rounded-lg bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
        >
          {saving ? "Ajout…" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}
