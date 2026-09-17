"use client";

import type { DebtFormValues } from "@/lib/validations/patrimoine";

interface DebtFormProps {
  editId: string | null;
  form: DebtFormValues;
  setForm: React.Dispatch<React.SetStateAction<DebtFormValues>>;
  saving: boolean;
  formError: string | null;
  onSave: () => void;
  onCancel: () => void;
}

export const DebtForm = ({
  editId,
  form,
  setForm,
  saving,
  formError,
  onSave,
  onCancel,
}: DebtFormProps) => (
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
          onChange={(e) =>
            setForm((f) => ({ ...f, monthlyPayment: parseFloat(e.target.value) || 0 }))
          }
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
    {formError && <p className="text-sm text-rose-400">{formError}</p>}
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
      >
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300"
      >
        Annuler
      </button>
    </div>
  </div>
);
