import { getCurrentPeriod, getMonthLabel } from "@/lib/sheets";
import { getCurrentSession } from "@/lib/auth";
import SignOutButton from "@/components/auth/SignOutButton";

const Header = async () => {
  const session = await getCurrentSession();
  const { month, year } = getCurrentPeriod();
  const firstName = session?.user?.name?.split(" ")[0] ?? "HomeBudget";
  const familyName = session?.user?.familyName ?? "Famille";
  const inviteCode = session?.user?.familyInviteCode;

  return (
    <header className="flex flex-col gap-4 border-b border-border bg-background/80 px-6 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.25rem] text-slate-400">
          Bonjour {firstName} · {familyName}
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
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
          Dashboard sécurisé
        </span>
        <SignOutButton />
      </div>
    </header>
  );
};

export default Header;
