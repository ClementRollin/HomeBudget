"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { id: 1, label: "Bienvenue" },
  { id: 2, label: "Votre famille" },
  { id: 3, label: "C'est parti" },
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

type Props = {
  familyName: string;
  inviteCode: string;
  memberCount: number;
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
        <p className="text-4xl">👨‍👩‍👧</p>
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

export default function OnboardingWizard({ familyName, inviteCode, memberCount }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleFinish = async (dest: "sheet" | "dashboard") => {
    setLoading(true);
    try {
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
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
            <StepFamily
              familyName={familyName}
              inviteCode={inviteCode}
              memberCount={memberCount}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepReady onBack={() => setStep(2)} onFinish={handleFinish} loading={loading} />
          )}
        </div>

        <p className="text-center text-xs text-gray-400">
          HomeBudget — Vos données sont chiffrées et restent privées.
        </p>
      </div>
    </div>
  );
}
