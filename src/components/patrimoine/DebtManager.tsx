"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import type { DebtFormValues } from "@/lib/validations/patrimoine";
import type { DecryptedDebt } from "@/lib/patrimoine";

const defaultValues: DebtFormValues = {
  label: "",
  balance: 0,
  rate: 0,
  monthlyPayment: 0,
  endDate: "",
};

const DebtManager = ({ initialDebts }: { initialDebts: DecryptedDebt[] }) => {
  const router = useRouter();
  const [debts, setDebts] = useState(initialDebts);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<DebtFormValues>(defaultValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setEditId(null);
    setForm(defaultValues);
    setShowForm(true);
    setError(null);
  };

  const openEdit = (debt: DecryptedDebt) => {
    setEditId(debt.id);
    setForm({
      label: debt.label,
      balance: debt.balance,
      rate: debt.rate,
      monthlyPayment: debt.monthlyPayment,
      endDate: debt.endDate ? debt.endDate.substring(0, 10) : "",
    });
    setShowForm(true);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const url = editId ? `/api/debts/${editId}` : "/api/debts";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const e = await res.json().catch(() => null);
      setError(e?.message ?? "Erreur");
      return;
    }
    const saved: DecryptedDebt = await res.json();
    setDebts((prev) => (editId ? prev.map((d) => (d.id === editId ? saved : d)) : [saved, ...prev]));
    setShowForm(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cette dette ?")) return;
    const res = await fetch(`/api/debts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDebts((prev) => prev.filter((d) => d.id !== id));
      router.refresh();
    }
  };

  return (
    <section className="rounded-3xl border border-white/5 bg-black/30 p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Dettes</h2>
          <p className="text-sm text-slate-400">
            {debts.length} dette{debts.length !== 1 ? "s" : ""} enregistrée{debts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-slate-900"
        >
          + Ajouter une dette
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
          <h3 className="text-base font-semibold text-white">
            {editId ? "Modifier la dette" : "Nouvelle dette"}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-xs text-slate-400">Libellé</label>
              <input
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="ex: Crédit immobilier"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Solde restant dû (€)</label>
              <input
                type="number"
                step="0.01"
                value={form.balance}
                onChange={(e) => setForm((f) => ({ ...f, balance: parseFloat(e.target.value) || 0 }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Taux annuel (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.rate}
                onChange={(e) => setForm((f) => ({ ...f, rate: parseFloat(e.target.value) || 0 }))}
                placeholder="ex: 3.5"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Mensualité (€)</label>
              <input
                type="number"
                step="0.01"
                value={form.monthlyPayment}
                onChange={(e) => setForm((f) => ({ ...f, monthlyPayment: parseFloat(e.target.value) || 0 }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Date de fin (optionnel)</label>
              <input
                type="date"
                value={form.endDate ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {debts.length === 0 && !showForm && (
        <p className="text-sm text-slate-400">Aucune dette enregistrée. Ajoutez votre première dette pour commencer.</p>
      )}

      <div className="space-y-3">
        {debts.map((debt) => (
          <div
            key={debt.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4"
          >
            <div>
              <p className="font-semibold text-white">{debt.label}</p>
              <p className="mt-1 text-xs text-slate-400">
                Taux : {debt.rate.toFixed(2)} % • Mensualité : {formatCurrency(debt.monthlyPayment)}
                {debt.monthsRemaining !== null && ` • ${debt.monthsRemaining} mois restants`}
                {debt.totalCost !== null && ` • Coût total restant : ${formatCurrency(debt.totalCost)}`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-lg font-semibold text-rose-300">{formatCurrency(debt.balance)}</p>
              <button
                type="button"
                onClick={() => openEdit(debt)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => handleDelete(debt.id)}
                className="text-xs text-rose-400 hover:text-rose-300"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DebtManager;
