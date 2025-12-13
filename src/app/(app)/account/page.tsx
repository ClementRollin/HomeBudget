import { redirect } from "next/navigation";

import AccountForm from "@/components/account/AccountForm";
import CopyInviteCodeButton from "@/components/account/CopyInviteCodeButton";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

const AccountPage = async () => {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { family: true },
  });

  if (!user || !user.family) {
    redirect("/");
  }

  const inviteCode = user.family.inviteCode;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/5 bg-black/40 p-6">
        <h1 className="text-2xl font-semibold text-white">Mon compte</h1>
        <p className="text-sm text-slate-400">
          Modifiez vos informations personnelles et partagez le code famille pour inviter vos proches.
        </p>
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3rem] text-slate-500">Code famille</p>
            <p className="text-3xl font-semibold text-white">{inviteCode}</p>
            <p className="text-xs text-slate-400">Donnez ce code pour permettre a un proche de rejoindre votre foyer.</p>
          </div>
          <CopyInviteCodeButton code={inviteCode} />
        </div>
      </section>

      <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <h2 className="text-xl font-semibold text-white">Informations personnelles</h2>
        <p className="text-sm text-slate-400">Tous les champs sont obligatoires pour garder un compte a jour.</p>
        <div className="mt-6">
          <AccountForm initialName={user.name ?? ""} initialEmail={user.email} />
        </div>
      </section>
    </div>
  );
};

export default AccountPage;
