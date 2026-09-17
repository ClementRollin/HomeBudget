"use client";

import { useEffect, useRef, useState } from "react";

import { CHARGE_TYPE_LABELS, CHARGE_TYPES } from "@/lib/validations/sheet";

type ChargeCategory = (typeof CHARGE_TYPES)[number];

type Member = { id: string; displayName: string };

type RecurringCharge = {
  id: string;
  category: ChargeCategory;
  memberId: string | null;
  memberName: string | null;
  label: string;
  amount: number;
  isActive: boolean;
};

type Props = { members: Member[] };

const CATEGORY_OPTIONS = CHARGE_TYPES.filter(
  (t) => t === "FIXE_COMMUN" || t === "FIXE_INDIVIDUEL",
) as ChargeCategory[];

function formatAmount(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

function ChargeRow({
  charge,
  members,
  onToggle,
  onDelete,
  onSave,
}: {
  charge: RecurringCharge;
  members: Member[];
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onSave: (id: string, data: Partial<RecurringCharge>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(charge.label);
  const [amount, setAmount] = useState(String(charge.amount));
  const [category, setCategory] = useState<ChargeCategory>(charge.category);
  const [memberId, setMemberId] = useState(charge.memberId ?? "");
  const [saving, setSaving] = useState(false);
  const labelRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) labelRef.current?.focus();
  }, [editing]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(charge.id, {
      label,
      amount: parseFloat(amount) || 0,
      category,
      memberId: memberId || null,
    });
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setLabel(charge.label);
    setAmount(String(charge.amount));
    setCategory(charge.category);
    setMemberId(charge.memberId ?? "");
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="text-xs text-slate-400 mb-1 block">Intitulé</label>
            <input
              ref={labelRef}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
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
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                <option key={c} value={c}>{CHARGE_TYPE_LABELS[c]}</option>
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
                <option key={m.id} value={m.id}>{m.displayName}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !label.trim()}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${charge.isActive ? "border-white/10 bg-white/3" : "border-white/5 bg-transparent opacity-50"}`}>
      <button
        onClick={() => onToggle(charge.id, !charge.isActive)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${charge.isActive ? "bg-emerald-600" : "bg-slate-600"}`}
        title={charge.isActive ? "Désactiver" : "Activer"}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${charge.isActive ? "translate-x-4.5" : "translate-x-0.5"}`} />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{charge.label}</p>
        <p className="text-xs text-slate-500 truncate">
          {CHARGE_TYPE_LABELS[charge.category]}
          {charge.memberName ? ` · ${charge.memberName}` : ""}
        </p>
      </div>

      <span className="text-sm font-semibold text-emerald-400 whitespace-nowrap">
        {formatAmount(charge.amount)}
      </span>

      <div className="flex gap-1">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Modifier"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(charge.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Supprimer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function AddChargeForm({
  members,
  onAdd,
  onCancel,
}: {
  members: Member[];
  onAdd: (data: Omit<RecurringCharge, "id" | "isActive" | "memberName">) => Promise<void>;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ChargeCategory>("FIXE_COMMUN");
  const [memberId, setMemberId] = useState("");
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !amount) return;
    setSaving(true);
    await onAdd({ label: label.trim(), amount: parseFloat(amount) || 0, category, memberId: memberId || null });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
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
              <option key={c} value={c}>{CHARGE_TYPE_LABELS[c]}</option>
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
              <option key={m.id} value={m.id}>{m.displayName}</option>
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

export default function RecurringChargesSection({ members }: Props) {
  const [charges, setCharges] = useState<RecurringCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch("/api/recurring-charges")
      .then((r) => r.json())
      .then((data) => { setCharges(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleAdd = async (data: Omit<RecurringCharge, "id" | "isActive" | "memberName">) => {
    const res = await fetch("/api/recurring-charges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    const created: RecurringCharge = await res.json();
    setCharges((prev) => [...prev, created]);
    setAdding(false);
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    setCharges((prev) => prev.map((c) => (c.id === id ? { ...c, isActive } : c)));
    await fetch(`/api/recurring-charges/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
  };

  const handleDelete = async (id: string) => {
    setCharges((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/recurring-charges/${id}`, { method: "DELETE" });
  };

  const handleSave = async (id: string, data: Partial<RecurringCharge>) => {
    const res = await fetch(`/api/recurring-charges/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    const updated: RecurringCharge = await res.json();
    setCharges((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const totalActive = charges
    .filter((c) => c.isActive)
    .reduce((sum, c) => sum + c.amount, 0);

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
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
              onToggle={handleToggle}
              onDelete={handleDelete}
              onSave={handleSave}
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

      {charges.filter((c) => c.isActive).length > 0 && !adding && (
        <div className="pt-2 border-t border-white/5 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            {charges.filter((c) => c.isActive).length} charge{charges.filter((c) => c.isActive).length > 1 ? "s" : ""} active{charges.filter((c) => c.isActive).length > 1 ? "s" : ""}
          </span>
          <span className="text-sm font-semibold text-white">
            {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(totalActive)} / mois
          </span>
        </div>
      )}
    </div>
  );
}
