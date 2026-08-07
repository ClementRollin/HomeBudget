"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import type { DebtFormValues } from "@/lib/validations/patrimoine";
import { simulateEarlyRepayment, type SimulationResult } from "@/lib/amortization";
import type { DecryptedDebt } from "@/lib/patrimoine";
import { PLAN_LIMITS, type PlanName } from "@/lib/subscription";
import LimitWarning from "@/components/subscription/LimitWarning";
import UpgradeGate from "@/components/subscription/UpgradeGate";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/ToastProvider";

const defaultForm: DebtFormValues = {
  label: "",
  balance: 0,
  rate: 0,
  monthlyPayment: 0,
  endDate: "",
};

const DebtTracker = ({ initialDebts, plan }: { initialDebts: DecryptedDebt[]; plan: PlanName }) => {
  const router = useRouter();
  const { addToast } = useToast();
  const [debts, setDebts] = useState(initialDebts);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // État CRUD
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<DebtFormValues>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // État simulation — id de la dette ouverte + montant du versement
  const [simulationOpen, setSimulationOpen] = useState<string | null>(null);
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  // État sync-charge — id de la dette en cours + messages par dette
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<Record<string, string>>({});

  // --- Handlers CRUD ---

  const openCreate = () => {
    setEditId(null);
    setForm(defaultForm);
    setShowForm(true);
    setFormError(null);
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
    setFormError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError(null);
    const url = editId ? `/api/debts/${editId}` : "/api/debts";
    const res = await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.status === 402) {
      setShowForm(false);
      return;
    }
    if (!res.ok) {
      const e = await res.json().catch(() => null);
      setFormError((e as { message?: string } | null)?.message ?? "Erreur");
      return;
    }
    const saved = (await res.json()) as DecryptedDebt;
    setDebts((prev) => (editId ? prev.map((d) => (d.id === editId ? saved : d)) : [saved, ...prev]));
    setShowForm(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    const res = await fetch(`/api/debts/${deleteTargetId}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
    setDeleteTargetId(null);
    if (res.ok) {
      setDebts((prev) => prev.filter((d) => d.id !== deleteTargetId));
      addToast("Dette supprimée");
      router.refresh();
    } else {
      addToast("Erreur lors de la suppression", "error");
    }
  };

  // --- Handlers simulation ---

  const openSimulation = (debtId: string | null) => {
    setSimulationOpen(debtId);
    setExtraPayment(0);
    setSimResult(null);
  };

  const runSimulation = (debt: DecryptedDebt) => {
    const result = simulateEarlyRepayment(debt.balance, debt.rate, debt.monthlyPayment, extraPayment);
    setSimResult(result);
  };

  // --- Handler sync-charge ---

  const handleSyncCharge = async (debtId: string) => {
    setSyncing(debtId);
    setSyncMessage((prev) => ({ ...prev, [debtId]: "" }));
    const res = await fetch(`/api/debts/${debtId}/sync-charge`, { method: "POST" });
    const data = await res.json().catch(() => ({})) as { message?: string };
    setSyncing(null);
    setSyncMessage((prev) => ({
      ...prev,
      [debtId]: res.ok
        ? "Charge ajoutée à la fiche courante."
        : (data.message ?? "Erreur lors de la synchronisation."),
    }));
    if (res.ok) router.refresh();
  };

  const freeLimit = PLAN_LIMITS.FREE.maxDebts;
  const atLimit = plan === "FREE" && debts.length >= freeLimit;

  return (
    <section className="rounded-3xl border border-white/5 bg-black/30 p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Dettes</h2>
          <p className="text-sm text-slate-400">
            {debts.length} dette{debts.length !== 1 ? "s" : ""} enregistrée{debts.length !== 1 ? "s" : ""}
          </p>
        </div>
        {atLimit ? (
          <UpgradeGate plan={plan} feature="Dettes illimitées">{null}</UpgradeGate>
        ) : (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-slate-900"
          >
            + Ajouter une dette
          </button>
        )}
      </div>
      <LimitWarning resource="dettes" current={debts.length} limit={freeLimit} />

      {/* Formulaire CRUD */}
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
          {formError && <p className="text-sm text-rose-400">{formError}</p>}
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
        <p className="text-sm text-slate-400">Aucune dette enregistrée.</p>
      )}

      {/* Liste des dettes */}
      <div className="space-y-4">
        {debts.map((debt) => (
          <div key={debt.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 space-y-4">
            {/* En-tête de la carte */}
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
                  onClick={() => openSimulation(simulationOpen === debt.id ? null : debt.id)}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-accent/50 hover:text-accent"
                >
                  {simulationOpen === debt.id ? "Fermer" : "Simuler"}
                </button>
                <button
                  type="button"
                  onClick={() => handleSyncCharge(debt.id)}
                  disabled={syncing === debt.id}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-teal-500/50 hover:text-teal-400 disabled:opacity-50"
                >
                  {syncing === debt.id ? "En cours..." : "→ Fiche du mois"}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(debt)}
                  className="text-xs text-slate-400 hover:text-white px-2"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(debt.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 px-2"
                >
                  Supprimer
                </button>
              </div>
            </div>

            {/* Message sync */}
            {syncMessage[debt.id] && (
              <p className="text-xs text-teal-400">{syncMessage[debt.id]}</p>
            )}

            {/* Panneau simulation */}
            {simulationOpen === debt.id && (
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
                      onChange={(e) => {
                        setExtraPayment(parseFloat(e.target.value) || 0);
                        setSimResult(null);
                      }}
                      className="mt-1 block w-48 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => runSimulation(debt)}
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
                        { label: "Durée avec versement", value: `${simResult.withExtraMonths} mois`, highlight: false },
                        { label: "Mois gagnés", value: `${simResult.monthsSaved} mois`, highlight: true },
                        { label: "Intérêts économisés", value: formatCurrency(simResult.interestSaved), highlight: true },
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
                  <p className="text-xs text-slate-400">
                    Cliquez sur Calculer pour voir l&apos;impact.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Supprimer cette dette ?"
        message="Cette action est irréversible. La dette sera définitivement supprimée."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </section>
  );
};

export default DebtTracker;
