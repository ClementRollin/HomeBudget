"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { ASSET_TYPES, ASSET_TYPE_LABELS, type AssetFormValues } from "@/lib/validations/patrimoine";
import type { DecryptedAsset } from "@/lib/patrimoine";
import { PLAN_LIMITS, type PlanName } from "@/lib/subscription";
import LimitWarning from "@/components/subscription/LimitWarning";
import UpgradeGate from "@/components/subscription/UpgradeGate";

const defaultValues: AssetFormValues = {
  type: "AUTRE",
  name: "",
  currentValue: 0,
  totalInvested: 0,
  annualFee: undefined,
};

const AssetManager = ({ initialAssets, plan }: { initialAssets: DecryptedAsset[]; plan: PlanName }) => {
  const router = useRouter();
  const [assets, setAssets] = useState(initialAssets);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<AssetFormValues>(defaultValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setEditId(null);
    setForm(defaultValues);
    setShowForm(true);
    setError(null);
  };

  const openEdit = (asset: DecryptedAsset) => {
    setEditId(asset.id);
    setForm({
      type: asset.type,
      name: asset.name,
      currentValue: asset.currentValue,
      totalInvested: asset.totalInvested,
      annualFee: asset.annualFee || undefined,
    });
    setShowForm(true);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const url = editId ? `/api/assets/${editId}` : "/api/assets";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
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
      setError(e?.message ?? "Erreur");
      return;
    }
    const saved: DecryptedAsset = await res.json();
    setAssets((prev) => (editId ? prev.map((a) => (a.id === editId ? saved : a)) : [saved, ...prev]));
    setShowForm(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cet actif ?")) return;
    const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAssets((prev) => prev.filter((a) => a.id !== id));
      router.refresh();
    }
  };

  const freeLimit = PLAN_LIMITS.FREE.maxAssets;
  const atLimit = plan === "FREE" && assets.length >= freeLimit;

  return (
    <section className="rounded-3xl border border-white/5 bg-black/30 p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Actifs</h2>
          <p className="text-sm text-slate-400">
            {assets.length} actif{assets.length !== 1 ? "s" : ""} enregistré{assets.length !== 1 ? "s" : ""}
          </p>
        </div>
        {atLimit ? (
          <UpgradeGate plan={plan} feature="Actifs patrimoniaux illimités">{null}</UpgradeGate>
        ) : (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-slate-900"
          >
            + Ajouter un actif
          </button>
        )}
      </div>
      <LimitWarning resource="actifs" current={assets.length} limit={freeLimit} />

      {showForm && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
          <h3 className="text-base font-semibold text-white">
            {editId ? "Modifier l'actif" : "Nouvel actif"}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs text-slate-400">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AssetFormValues["type"] }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {ASSET_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Nom</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="ex: PEA Boursorama"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Valeur actuelle (€)</label>
              <input
                type="number"
                step="0.01"
                value={form.currentValue}
                onChange={(e) => setForm((f) => ({ ...f, currentValue: parseFloat(e.target.value) || 0 }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Total investi (€)</label>
              <input
                type="number"
                step="0.01"
                value={form.totalInvested}
                onChange={(e) => setForm((f) => ({ ...f, totalInvested: parseFloat(e.target.value) || 0 }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Frais annuels (% optionnel)</label>
              <input
                type="number"
                step="0.01"
                value={form.annualFee ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, annualFee: e.target.value ? parseFloat(e.target.value) : undefined }))
                }
                placeholder="ex: 0.5"
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

      {assets.length === 0 && !showForm && (
        <p className="text-sm text-slate-400">Aucun actif enregistré. Ajoutez votre premier actif pour commencer.</p>
      )}

      <div className="space-y-3">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-400">
                  {ASSET_TYPE_LABELS[asset.type]}
                </span>
                <p className="font-semibold text-white">{asset.name}</p>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Investi : {formatCurrency(asset.totalInvested)} •{" "}
                <span className={asset.plusValue >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {asset.plusValue >= 0 ? "+" : ""}
                  {formatCurrency(asset.plusValue)} ({asset.plusValuePct.toFixed(1)} %)
                </span>
                {asset.annualFee > 0 && ` • Frais : ${asset.annualFee.toFixed(2)} %/an`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-lg font-semibold text-white">{formatCurrency(asset.currentValue)}</p>
              <button
                type="button"
                onClick={() => openEdit(asset)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => handleDelete(asset.id)}
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

export default AssetManager;
