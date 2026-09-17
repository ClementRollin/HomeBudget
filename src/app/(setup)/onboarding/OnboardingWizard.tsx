"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { id: 1, label: "Bienvenue" },
  { id: 2, label: "Votre profil" },
  { id: 3, label: "Votre situation" },
  { id: 4, label: "Votre famille" },
  { id: 5, label: "C'est parti" },
];

const FEATURES = [
  {
    icon: "📊",
    title: "Budget mensuel",
    desc: "Saisissez vos revenus et charges mois par mois et suivez votre solde en temps réel.",
  },
  {
    icon: "🏦",
    title: "Patrimoine",
    desc: "Inventoriez vos actifs (PEA, AV, immobilier…) et vos dettes pour piloter votre patrimoine net.",
  },
  {
    icon: "📋",
    title: "Fiscalité",
    desc: "Estimez votre IR, votre plafond PER et préparez votre déclaration 2042 sans surprise.",
  },
  {
    icon: "📈",
    title: "Analytiques",
    desc: "Visualisez l'évolution de votre budget sur 12 mois et identifiez les postes de dépenses clés.",
  },
];

type FiscalRole = "DECLARANT_1" | "DECLARANT_2";

type ProfileData = {
  birthDate: string;
  fiscalRole: FiscalRole;
};

type SituationData = {
  isCoupled: boolean;
};

type Props = {
  familyName: string;
  inviteCode: string;
  memberCount: number;
  memberId: string;
};

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <p className="text-5xl">👋</p>
        <h1 className="text-3xl font-bold text-gray-900">Bienvenue sur HomeBudget</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Votre outil de gestion patrimoniale personnelle. Voici ce que vous pouvez faire dès maintenant.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
            <div className="text-2xl">{f.icon}</div>
            <h3 className="font-semibold text-gray-900">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}

function StepProfile({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: ProfileData;
  onChange: (d: Partial<ProfileData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-4xl">👤</p>
        <h2 className="text-2xl font-bold text-gray-900">Votre profil</h2>
        <p className="text-gray-500 text-sm">
          Ces informations permettent de calculer votre plafond PER et votre situation fiscale.
          Vous pourrez les modifier à tout moment.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de naissance <span className="text-gray-400 font-normal">(optionnel)</span>
          </label>
          <input
            type="date"
            value={data.birthDate}
            onChange={(e) => onChange({ birthDate: e.target.value })}
            max={new Date().toISOString().slice(0, 10)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rôle fiscal sur votre déclaration
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(["DECLARANT_1", "DECLARANT_2"] as FiscalRole[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => onChange({ fiscalRole: role })}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                  data.fiscalRole === role
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {role === "DECLARANT_1" ? "Déclarant 1" : "Déclarant 2"}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Si vous êtes le seul déclarant de votre foyer fiscal, choisissez Déclarant 1.
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
        >
          ← Retour
        </button>
        <div className="flex gap-3">
          <button
            onClick={onNext}
            className="text-sm text-gray-400 px-4 py-2.5 hover:text-gray-600 transition-colors"
          >
            Passer
          </button>
          <button
            onClick={onNext}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Suivant →
          </button>
        </div>
      </div>
    </div>
  );
}

function StepSituation({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: SituationData;
  onChange: (d: Partial<SituationData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-4xl">👨‍👩‍👧</p>
        <h2 className="text-2xl font-bold text-gray-900">Votre situation</h2>
        <p className="text-gray-500 text-sm">
          Précisez votre situation familiale pour affiner les calculs fiscaux et patrimoniaux.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <button
          type="button"
          onClick={() => onChange({ isCoupled: !data.isCoupled })}
          className="w-full flex items-center justify-between gap-4 text-left"
        >
          <div className="space-y-0.5">
            <p className="font-medium text-gray-900">En couple / pacsé(e)</p>
            <p className="text-sm text-gray-500">
              Vous faites une déclaration fiscale commune (mariage ou PACS).
            </p>
          </div>
          <div
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
              data.isCoupled ? "bg-emerald-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                data.isCoupled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </div>
        </button>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
        >
          ← Retour
        </button>
        <div className="flex gap-3">
          <button
            onClick={onNext}
            className="text-sm text-gray-400 px-4 py-2.5 hover:text-gray-600 transition-colors"
          >
            Passer
          </button>
          <button
            onClick={onNext}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Suivant →
          </button>
        </div>
      </div>
    </div>
  );
}

function StepFamily({
  familyName,
  inviteCode,
  memberCount,
  onNext,
  onBack,
}: Props & { onNext: () => void; onBack: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-4xl">🔗</p>
        <h2 className="text-2xl font-bold text-gray-900">Votre famille</h2>
        <p className="text-gray-500">Invitez vos proches pour partager votre suivi budgétaire.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <p className="text-sm text-gray-500">Nom du foyer</p>
          <p className="font-semibold text-gray-900 text-lg">{familyName}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Membres actifs</p>
          <p className="font-semibold text-gray-900">
            {memberCount} membre{memberCount > 1 ? "s" : ""}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">
            Code d&apos;invitation — partagez-le pour inviter un proche
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-mono text-sm text-gray-800 tracking-widest">
              {inviteCode}
            </code>
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              {copied ? "✓ Copié" : "Copier"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
        >
          ← Retour
        </button>
        <button
          onClick={onNext}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}

function StepReady({
  onBack,
  onFinish,
  loading,
}: {
  onBack: () => void;
  onFinish: (dest: "sheet" | "dashboard") => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-4xl">🚀</p>
        <h2 className="text-2xl font-bold text-gray-900">Vous êtes prêt !</h2>
        <p className="text-gray-500 max-w-sm mx-auto">
          Commencez par créer votre première fiche de compte pour enregistrer vos revenus et charges du mois.
        </p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-2">
        <p className="font-semibold text-emerald-900">Conseil de démarrage</p>
        <p className="text-sm text-emerald-700">
          Créez une fiche pour le mois en cours avec vos salaires et vos principales charges fixes.
          HomeBudget calculera automatiquement votre solde.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          ← Retour
        </button>
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onFinish("dashboard")}
            disabled={loading}
            className="flex-1 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Explorer le dashboard
          </button>
          <button
            onClick={() => onFinish("sheet")}
            disabled={loading}
            className="flex-1 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? "En cours…" : "Créer ma première fiche →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingWizard({ familyName, inviteCode, memberCount, memberId }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    birthDate: "",
    fiscalRole: "DECLARANT_1",
  });

  const [situation, setSituation] = useState<SituationData>({
    isCoupled: false,
  });

  const handleFinish = async (dest: "sheet" | "dashboard") => {
    setLoading(true);
    try {
      const memberPayload: Record<string, unknown> = {
        fiscalRole: profile.fiscalRole,
      };
      if (profile.birthDate) {
        memberPayload.birthDate = profile.birthDate;
      }

      await Promise.all([
        fetch(`/api/family/members/${memberId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(memberPayload),
        }),
        fetch("/api/fiscal-config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isCoupled: situation.isCoupled, perContribYTD: 0 }),
        }),
        fetch("/api/onboarding/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }),
      ]);

      router.push(dest === "sheet" ? "/sheets/new" : "/dashboard");
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                  step > s.id
                    ? "bg-emerald-600 text-white"
                    : step === s.id
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s.id ? "✓" : s.id}
              </div>
              <span
                className={`text-sm hidden sm:block ${step === s.id ? "text-gray-900 font-medium" : "text-gray-400"}`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-1 ${step > s.id ? "bg-emerald-600" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Wizard card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {step === 1 && <StepWelcome onNext={() => setStep(2)} />}
          {step === 2 && (
            <StepProfile
              data={profile}
              onChange={(d) => setProfile((prev) => ({ ...prev, ...d }))}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepSituation
              data={situation}
              onChange={(d) => setSituation((prev) => ({ ...prev, ...d }))}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <StepFamily
              familyName={familyName}
              inviteCode={inviteCode}
              memberCount={memberCount}
              memberId={memberId}
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
            />
          )}
          {step === 5 && (
            <StepReady onBack={() => setStep(4)} onFinish={handleFinish} loading={loading} />
          )}
        </div>

        <p className="text-center text-xs text-gray-400">
          HomeBudget — Vos données sont chiffrées et restent privées.
        </p>
      </div>
    </div>
  );
}
