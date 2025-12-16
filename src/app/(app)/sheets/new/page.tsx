import { redirect } from "next/navigation";

import SheetForm from "@/components/forms/SheetForm";
import { requireFamilySession } from "@/lib/tenant";
import { userRepository } from "@/lib/repositories/users";
import { buildPeopleOptions } from "@/lib/utils";
import { sheetRepository } from "@/lib/repositories/sheets";
import { defaultSheetFormValues } from "@/lib/validations/sheet";
import { getCurrentPeriod } from "@/lib/sheets";

const getSuggestedPeriod = async (familyId: string) => {
  const { month, year } = getCurrentPeriod();
  const currentSheet = await sheetRepository.findForMonth(familyId, { month, year });
  if (!currentSheet) {
    return { month, year };
  }
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return { month: nextMonth, year: nextYear };
};

const NewSheetPage = async () => {
  const familyContext = await requireFamilySession().catch(() => null);
  if (!familyContext) {
    redirect("/");
  }

  const suggestedPeriod = await getSuggestedPeriod(familyContext.familyId);
  const initialValues = { ...defaultSheetFormValues(), ...suggestedPeriod };
  const members = await userRepository.listFamilyMembers(familyContext.familyId);
  const peopleOptions = buildPeopleOptions(members, familyContext.userId);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3rem] text-slate-500">Nouvelle fiche de compte</p>
        <h1 className="text-3xl font-semibold text-white">Preparer le mois</h1>
        <p className="text-sm text-slate-400">
          Renseignez salaires, charges et budgets pour anticiper votre tresorerie.
        </p>
      </div>
      <SheetForm peopleOptions={peopleOptions} initialValues={initialValues} lockPeriod />
    </div>
  );
};

export default NewSheetPage;
