"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import type { GoalFormValues } from "@/lib/validations/patrimoine";
import type { DecryptedGoal } from "@/lib/patrimoine";

const currentYear = new Date().getFullYear();

const defaultValues: GoalFormValues = {
  label: "",
  target: 0,
  horizon: currentYear + 10,
};

const GoalManager = ({ initialGoals }: { initialGoals: DecryptedGoal[] }) => {
  const router = useRouter();
  const [goals, setGoals] = useState(initialGoals);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormValues>(defaultValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setEditId(null);
    setForm(defaultValues);
    setShowForm(true);
    setError(null);
  };

  const openEdit = (goal: DecryptedGoal) => {
    setEditId(goal.id);
    setForm({
      label: goal.label,
      target: goal.target,
      horizon: goal.horizon,
    });
    setShowForm(true);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const url = editId ? `/api/goals/${editId}` : "/api/goals";
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
    const saved: DecryptedGoal = await res.json();
    setGoals((prev) =>
      editId
        ? prev.map((g) => (g.id === editId ? saved : g)).sort((a, b) => a.horizon - b.horizon)
        : [...prev, saved].sort((a, b) => a.horizon - b.horizon),
    );
    setShowForm(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cet objectif ?")) return;
    const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
    if (res.ok) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      router.refresh();
    }
  };

  return (
    <section className="rounded-3xl border border-white/5 bg-black/30 p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Objectifs patrimoniaux</h2>
          <p className="text-sm text-slate-400">
            {goals.length} objectif{goals.length !== 1 ? "s" : ""} enregistré{goals.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-slate-900"
        >
          + Ajouter un objectif
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
          <h3 className="text-base font-semibold text-white">
            {editId ? "Modifier l'objectif" : "Nouvel objectif"}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-xs text-slate-400">Libellé</label>
              <input
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="ex: Retraite anticipée"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Montant cible (€)</label>
              <input
                type="number"
                step="1000"
                value={form.target}
                onChange={(e) => setForm((f) => ({ ...f, target: parseFloat(e.target.value) || 0 }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Année cible</label>
              <input
                type="number"
                step="1"
                min={2024}
                max={2100}
                value={form.horizon}
                onChange={(e) => setForm((f) => ({ ...f, horizon: parseInt(e.target.value) || currentYear + 10 }))}
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

      {goals.length === 0 && !showForm && (
        <p className="text-sm text-slate-400">
          Aucun objectif enregistré. Ajoutez votre premier objectif patrimonial pour commencer.
        </p>
      )}

      <div className="space-y-3">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4"
          >
            <div>
              <p className="font-semibold text-white">{goal.label}</p>
              <p className="mt-1 text-xs text-slate-400">Horizon : {goal.horizon}</p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-lg font-semibold text-emerald-300">{formatCurrency(goal.target)}</p>
              <button
                type="button"
                onClick={() => openEdit(goal)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => handleDelete(goal.id)}
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

export default GoalManager;
