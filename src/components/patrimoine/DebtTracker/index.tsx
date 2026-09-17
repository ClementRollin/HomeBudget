"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { simulateEarlyRepayment, type SimulationResult } from "@/lib/amortization";
import type { DecryptedDebt } from "@/lib/patrimoine";
import type { DebtFormValues } from "@/lib/validations/patrimoine";
import { PLAN_LIMITS, type PlanName } from "@/lib/subscription";
import LimitWarning from "@/components/subscription/LimitWarning";
import UpgradeGate from "@/components/subscription/UpgradeGate";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/ToastProvider";
import { DebtForm } from "./DebtForm";
import { DebtRow } from "./DebtRow";

const defaultForm: DebtFormValues = {
  label: "",
  balance: 0,
  rate: 0,
  monthlyPayment: 0,
  endDate: "",
};

const DebtTracker = ({
  initialDebts,
  plan,
}: {
  initialDebts: DecryptedDebt[];
  plan: PlanName;
}) => {
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

  // État simulation
  const [simulationOpen, setSimulationOpen] = useState<string | null>(null);
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  // État sync-charge
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<Record<string, string>>({});

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
    const res = await fetch(`/api/debts/${deleteTargetId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    setDeleteTargetId(null);
    if (res.ok) {
      setDebts((prev) => prev.filter((d) => d.id !== deleteTargetId));
      addToast("Dette supprimée");
      router.refresh();
    } else {
      addToast("Erreur lors de la suppression", "error");
    }
  };

  const openSimulation = (debtId: string | null) => {
    setSimulationOpen(debtId);
    setExtraPayment(0);
    setSimResult(null);
  };

  const runSimulation = (debt: DecryptedDebt) => {
    const result = simulateEarlyRepayment(
      debt.balance,
      debt.rate,
      debt.monthlyPayment,
      extraPayment,
    );
    setSimResult(result);
  };

  const handleSyncCharge = async (debtId: string) => {
    setSyncing(debtId);
    setSyncMessage((prev) => ({ ...prev, [debtId]: "" }));
    const res = await fetch(`/api/debts/${debtId}/sync-charge`, { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { message?: string };
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Dettes</h2>
          <p className="text-sm text-slate-400">
            {debts.length} dette{debts.length !== 1 ? "s" : ""} enregistrée
            {debts.length !== 1 ? "s" : ""}
          </p>
        </div>
        {atLimit ? (
          <UpgradeGate plan={plan} feature="Dettes illimitées">
            {null}
          </UpgradeGate>
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

      {showForm && (
        <DebtForm
          editId={editId}
          form={form}
          setForm={setForm}
          saving={saving}
          formError={formError}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      {debts.length === 0 && !showForm && (
        <p className="text-sm text-slate-400">Aucune dette enregistrée.</p>
      )}

      <div className="space-y-4">
        {debts.map((debt) => (
          <DebtRow
            key={debt.id}
            debt={debt}
            syncMessage={syncMessage[debt.id]}
            syncing={syncing === debt.id}
            simulationOpen={simulationOpen}
            extraPayment={extraPayment}
            simResult={simResult}
            onEdit={openEdit}
            onDelete={setDeleteTargetId}
            onSync={handleSyncCharge}
            onToggleSimulation={openSimulation}
            onExtraPaymentChange={(n) => {
              setExtraPayment(n);
              setSimResult(null);
            }}
            onCalculate={runSimulation}
          />
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
