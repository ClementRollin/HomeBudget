"use client";

import type { Session } from "next-auth";

import SignOutButton from "@/components/auth/SignOutButton";
import { getCurrentPeriod, getMonthLabel } from "@/lib/sheets";

const Header = ({ session, onToggleSidebar }: { session: Session; onToggleSidebar: () => void }) => {
  const { month, year } = getCurrentPeriod();
  const firstName = session?.user?.name?.split(" ")[0] ?? "HomeBudget";
  const familyName = session?.user?.familyName ?? "Famille";
  const inviteCode = session?.user?.familyInviteCode;

  return (
    <header className="flex flex-col gap-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="flex items-start justify-between gap-3 md:block">
        <div>
          <p className="text-sm uppercase tracking-[0.25rem] text-slate-400">
            Bonjour {firstName} • {familyName}
          </p>
          <h1 className="text-3xl font-semibold text-white">{getMonthLabel(month, year)}</h1>
          <p className="text-sm text-slate-400">
            Planifiez, mesurez et ajustez vos finances du foyer en un coup d&apos;œil.
          </p>
          {inviteCode ? (
            <p className="text-xs text-slate-500">
              Code famille : <span className="font-semibold text-slate-200">{inviteCode}</span>
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-xl border border-white/10 p-2 text-white transition hover:bg-white/10 md:hidden"
          aria-label="Ouvrir le menu"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-slate-300 md:inline-flex">
          Dashboard sécurisé
        </span>
        <SignOutButton />
      </div>
    </header>
  );
};

export default Header;
