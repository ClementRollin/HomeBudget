import Link from "next/link";
import type { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#1e293b,black)] p-6 text-white gap-6">
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl">
      {children}
    </div>
    <nav className="flex gap-4 text-xs text-slate-500">
      <Link href="/legal/cgu" className="hover:text-slate-300 transition-colors">CGU</Link>
      <Link href="/legal/cgv" className="hover:text-slate-300 transition-colors">CGV</Link>
      <Link href="/legal/mentions-legales" className="hover:text-slate-300 transition-colors">Mentions légales</Link>
      <Link href="/legal/confidentialite" className="hover:text-slate-300 transition-colors">Confidentialité</Link>
    </nav>
  </div>
);

export default AuthLayout;
