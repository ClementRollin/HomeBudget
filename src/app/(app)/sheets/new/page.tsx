import { redirect } from "next/navigation";

import SheetForm from "@/components/forms/SheetForm";
import { getCurrentSession } from "@/lib/auth";
import { buildPeopleOptions } from "@/lib/utils";
import { fetchFamilyMembers } from "@/lib/sheets";

const NewSheetPage = async () => {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/");
  }

  const members = await fetchFamilyMembers(session.user.familyId);
  const peopleOptions = buildPeopleOptions(members, session.user.familyMemberId);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3rem] text-slate-500">Nouvelle fiche de compte</p>
        <h1 className="text-3xl font-semibold text-white">Préparer le mois</h1>
        <p className="text-sm text-slate-400">
          Renseignez salaires, charges et budgets pour anticiper votre trésorerie.
        </p>
      </div>
      <SheetForm peopleOptions={peopleOptions} />
    </div>
  );
};

export default NewSheetPage;
