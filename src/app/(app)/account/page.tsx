import { redirect } from "next/navigation";

import AccountForm from "@/components/account/AccountForm";
import InviteCodeManager from "@/components/account/InviteCodeManager";
import { requireFamilySession } from "@/lib/tenant";
import { userRepository } from "@/lib/repositories/users";

const AccountPage = async () => {
  const familyContext = await requireFamilySession().catch(() => null);
  if (!familyContext) {
    redirect("/");
  }

  const user = await userRepository.findByIdWithFamily(familyContext.userId);

  if (!user || !user.family || user.family.id !== familyContext.familyId) {
    redirect("/");
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/5 bg-black/40 p-6">
        <h1 className="text-2xl font-semibold text-white">Mon compte</h1>
        <p className="text-sm text-slate-400">
          Modifiez vos informations personnelles et genere z des codes d&apos;invitation securises
          pour vos proches.
        </p>
        <div className="mt-6">
          <InviteCodeManager />
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
