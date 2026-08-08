"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FamilyDetail {
  id: string;
  name: string;
  slug: string;
  subscriptionStatus: string;
  subscriptionEndsAt: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
  onboardingCompletedAt: string | null;
  _count: { sheets: number; assets: number; debts: number; goals: number };
  users: { id: string; name: string | null; email: string; familyRole: string; createdAt: string }[];
  members: { id: string; displayName: string; fiscalRole: string; createdAt: string }[];
}

const STATUS_OPTIONS = ["FREE", "PRO", "PRO_CANCELED", "PRO_PAST_DUE"] as const;
const STATUS_LABEL: Record<string, string> = {
  FREE: "Gratuit",
  PRO: "Pro",
  PRO_CANCELED: "Pro (annulé)",
  PRO_PAST_DUE: "Pro (impayé)",
};

function applyFamily(
  data: FamilyDetail,
  setFamily: (f: FamilyDetail) => void,
  setStatus: (s: string) => void,
  setEndsAt: (d: string) => void,
  setLoading: (b: boolean) => void,
) {
  setFamily(data);
  setStatus(data.subscriptionStatus);
  setEndsAt(data.subscriptionEndsAt ? data.subscriptionEndsAt.slice(0, 10) : "");
  setLoading(false);
}

export default function FamilyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [family, setFamily] = useState<FamilyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    fetch(`/api/admin/families/${id}`)
      .then((res) => (res.ok ? (res.json() as Promise<FamilyDetail>) : Promise.reject())
      )
      .then((data) => applyFamily(data, setFamily, setStatus, setEndsAt, setLoading))
      .catch(() => setLoading(false));
  }, [id, reload]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/admin/families/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscriptionStatus: status,
        subscriptionEndsAt: endsAt || null,
      }),
    });
    setSaving(false);
    setReload((n) => n + 1);
  };

  if (loading) {
    return <div className="text-slate-400">Chargement...</div>;
  }

  if (!family) {
    return <div className="text-red-400">Famille introuvable.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          ← Retour
        </button>
        <h1 className="text-2xl font-bold">{family.name}</h1>
        <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
          {family.slug}
        </span>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Fiches", value: family._count.sheets },
          { label: "Actifs", value: family._count.assets },
          { label: "Dettes", value: family._count.debts },
          { label: "Objectifs", value: family._count.goals },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-2xl font-bold text-amber-400">{s.value}</div>
            <div className="text-sm text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Override plan */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-lg font-semibold">Abonnement (override admin)</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Fin d&apos;accès (optionnel)
            </label>
            <input
              type="date"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Appliquer"}
          </button>
        </div>
        {family.stripeCustomerId && (
          <p className="mt-3 text-xs text-slate-500">
            Stripe customer: <code>{family.stripeCustomerId}</code>
          </p>
        )}
      </div>

      {/* Utilisateurs */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-lg font-semibold">
          Utilisateurs ({family.users.length})
        </h2>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-400">
            <tr>
              <th className="pb-2 font-medium">Nom</th>
              <th className="pb-2 font-medium">Email</th>
              <th className="pb-2 font-medium">Rôle</th>
              <th className="pb-2 font-medium">Inscrit le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {family.users.map((u) => (
              <tr key={u.id}>
                <td className="py-2">{u.name ?? "—"}</td>
                <td className="py-2 text-slate-400">{u.email}</td>
                <td className="py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${u.familyRole === "OWNER" ? "bg-amber-700 text-amber-100" : "bg-slate-700 text-slate-300"}`}
                  >
                    {u.familyRole}
                  </span>
                </td>
                <td className="py-2 text-slate-400">
                  {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Membres */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-lg font-semibold">
          Membres fiscaux ({family.members.length})
        </h2>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-400">
            <tr>
              <th className="pb-2 font-medium">Nom</th>
              <th className="pb-2 font-medium">Rôle fiscal</th>
              <th className="pb-2 font-medium">Ajouté le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {family.members.map((m) => (
              <tr key={m.id}>
                <td className="py-2">{m.displayName}</td>
                <td className="py-2 text-slate-400 text-xs">{m.fiscalRole}</td>
                <td className="py-2 text-slate-400">
                  {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-600">
        Famille créée le {new Date(family.createdAt).toLocaleDateString("fr-FR")}
        {family.onboardingCompletedAt &&
          ` · onboarding terminé le ${new Date(family.onboardingCompletedAt).toLocaleDateString("fr-FR")}`}
      </div>
    </div>
  );
}
