import { notFound, redirect } from "next/navigation";

import SheetForm from "@/components/forms/SheetForm";
import { prisma } from "@/lib/prisma";
import { computeSheetMetrics, getMonthLabel, toSheetFormValues } from "@/lib/sheets";
import { formatCurrency } from "@/lib/format";
import { getCurrentSession } from "@/lib/auth";

const SheetDetailPage = async ({ params }: { params: { id: string } }) => {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/");
  }

  const sheet = await prisma.sheet.findFirst({
    where: { id: params.id, familyId: session.user.familyId },
    include: { salaries: true, charges: true, budgets: true },
  });

  if (!sheet) {
    notFound();
  }

  const metrics = computeSheetMetrics(sheet);
  const defaultValues = toSheetFormValues(sheet);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3rem] text-slate-500">Fiche</p>
          <h1 className="text-3xl font-semibold text-white">
            {getMonthLabel(sheet.month, sheet.year)}
          </h1>
          <p className="text-sm text-slate-400">
            {sheet.salaries.length} salaires • {sheet.charges.length} charges • {sheet.budgets.length} budgets
          </p>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-slate-400">Solde</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(metrics.balance)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Charges</p>
            <p className="text-2xl font-semibold text-rose-300">
              {formatCurrency(metrics.expenses)}
            </p>
          </div>
        </div>
      </div>

      <SheetForm sheetId={sheet.id} initialValues={defaultValues} />
    </div>
  );
};

export default SheetDetailPage;
