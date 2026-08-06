import { redirect } from "next/navigation";

import SheetForm from "@/components/forms/SheetForm";
import { getCurrentSession } from "@/lib/auth";
import { buildPeopleOptions } from "@/lib/utils";
import { fetchFamilyMembers } from "@/lib/sheets";
import { prisma } from "@/lib/prisma";
import { getFamilySubscription, getActivePlan, PLAN_LIMITS } from "@/lib/subscription";
import UpgradeGate from "@/components/subscription/UpgradeGate";

const NewSheetPage = async () => {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/");
  }

  const [members, sub, sheetCount] = await Promise.all([
    fetchFamilyMembers(session.user.familyId),
    getFamilySubscription(session.user.familyId),
    prisma.sheet.count({ where: { familyId: session.user.familyId } }),
  ]);

  const plan = getActivePlan(sub.subscriptionStatus, sub.subscriptionEndsAt);
  const atLimit = plan === "FREE" && sheetCount >= PLAN_LIMITS.FREE.maxSheets;
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
      {atLimit ? (
        <UpgradeGate plan={plan} feature="Fiches mensuelles illimitées">{null}</UpgradeGate>
      ) : (
        <SheetForm peopleOptions={peopleOptions} />
      )}
    </div>
  );
};

export default NewSheetPage;
