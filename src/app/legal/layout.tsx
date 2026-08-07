import Link from "next/link";
import type { ReactNode } from "react";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1e293b,black)] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-widest text-slate-300 hover:text-white">
            HomeBudget
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Retour
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12 space-y-6 prose prose-invert prose-sm max-w-none">
        {children}
      </main>
      <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-slate-500">
        <nav className="flex justify-center gap-6">
          <Link href="/legal/cgu" className="hover:text-slate-300 transition-colors">CGU</Link>
          <Link href="/legal/cgv" className="hover:text-slate-300 transition-colors">CGV</Link>
          <Link href="/legal/mentions-legales" className="hover:text-slate-300 transition-colors">Mentions légales</Link>
          <Link href="/legal/confidentialite" className="hover:text-slate-300 transition-colors">Confidentialité</Link>
        </nav>
      </footer>
    </div>
  );
}
