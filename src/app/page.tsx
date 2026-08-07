import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HomeBudget — Gérez votre budget et votre patrimoine en famille",
  alternates: { canonical: "/" },
};

const features = [
  {
    icon: "📊",
    title: "Budget mensuel collaboratif",
    description:
      "Créez vos fiches mensuelles en famille : salaires, charges fixes et variables, épargne. Visualisez l'équilibre en temps réel.",
  },
  {
    icon: "🏦",
    title: "Suivi du patrimoine",
    description:
      "Centralisez PEA, assurance vie, PER, immobilier, crypto. Suivez l'évolution de votre patrimoine net mois après mois.",
  },
  {
    icon: "🧮",
    title: "Simulation IR & quotient familial",
    description:
      "Calculez votre impôt sur le revenu 2024 avec barème progressif, quotient familial et plafonnement. Extrayez votre déclaration 2042 par IA.",
  },
  {
    icon: "📈",
    title: "Analytiques & tendances",
    description:
      "Visualisez la répartition de vos revenus, le poids de vos charges et l'évolution de votre épargne sur plusieurs mois.",
  },
];

const pricingFree = [
  "3 fiches mensuelles",
  "5 actifs patrimoniaux",
  "3 dettes",
  "2 objectifs",
];

const pricingPro = [
  "Fiches mensuelles illimitées",
  "Actifs, dettes et objectifs illimités",
  "Déclaration 2042 + extraction IA",
  "Quotient familial & simulation IR",
  "Comparaison N-1",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#1e293b,black)] text-white">
      {/* Nav */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="text-sm font-bold tracking-widest text-slate-300">HomeBudget</span>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/auth/login?mode=register"
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
          >
            Commencer gratuitement
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.3rem] text-amber-400">
          Budget · Patrimoine · Fiscalité · Famille
        </p>
        <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
          Prenez le contrôle de{" "}
          <span className="text-amber-400">vos finances</span>{" "}
          en famille
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
          HomeBudget centralise votre budget mensuel, votre patrimoine et votre situation
          fiscale dans un espace collaboratif sécurisé. Conçu pour les familles françaises.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/auth/login?mode=register"
            className="rounded-2xl bg-amber-500 px-8 py-4 text-base font-semibold text-black hover:bg-amber-400 transition-colors shadow-lg shadow-amber-900/30"
          >
            Commencer gratuitement — sans CB
          </Link>
          <Link
            href="/auth/login"
            className="rounded-2xl border border-white/10 px-8 py-4 text-base text-slate-300 hover:bg-white/5 transition-colors"
          >
            Se connecter
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-600">
          Données chiffrées AES-256 · Hébergement UE · RGPD
        </p>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-16" aria-labelledby="features-heading">
        <h2 id="features-heading" className="mb-12 text-center text-2xl font-bold text-white">
          Tout ce dont votre famille a besoin
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <article
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3"
            >
              <span className="text-3xl" aria-hidden="true">{f.icon}</span>
              <h3 className="text-base font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-3xl px-6 py-16" aria-labelledby="pricing-heading">
        <h2 id="pricing-heading" className="mb-12 text-center text-2xl font-bold text-white">
          Tarifs simples et transparents
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {/* FREE */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Gratuit</p>
              <p className="mt-1 text-3xl font-bold text-white">
                0 <span className="text-xl">€</span>
              </p>
              <p className="text-sm text-slate-500">pour toujours</p>
            </div>
            <ul className="space-y-2">
              {pricingFree.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="text-slate-600" aria-hidden="true">✓</span> {item}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/login?mode=register"
              className="block w-full rounded-xl border border-white/10 py-3 text-center text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
            >
              Créer un compte gratuit
            </Link>
          </div>

          {/* PRO */}
          <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-6 space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-amber-400">Pro</p>
              <p className="mt-1 text-3xl font-bold text-white">
                9,90 <span className="text-xl">€</span>
              </p>
              <p className="text-sm text-slate-500">par mois · annulable à tout moment</p>
            </div>
            <ul className="space-y-2">
              {pricingPro.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="text-amber-400" aria-hidden="true">✓</span> {item}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/login?mode=register"
              className="block w-full rounded-xl bg-amber-500 py-3 text-center text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
            >
              Commencer avec PRO
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} HomeBudget — Données chiffrées, hébergées en UE
          </p>
          <nav aria-label="Liens légaux" className="flex gap-4 text-xs text-slate-600">
            <Link href="/legal/cgu" className="hover:text-slate-400 transition-colors">CGU</Link>
            <Link href="/legal/cgv" className="hover:text-slate-400 transition-colors">CGV</Link>
            <Link href="/legal/mentions-legales" className="hover:text-slate-400 transition-colors">Mentions légales</Link>
            <Link href="/legal/confidentialite" className="hover:text-slate-400 transition-colors">Confidentialité</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
