import { NextResponse, type NextRequest } from "next/server";

import { requireFamilySession } from "@/lib/tenant";
import { sheetRepository } from "@/lib/repositories/sheets";
import type { SheetWithRelations } from "@/lib/sheets";
import { sheetFormSchema } from "@/lib/validations/sheet";

const serializeSheet = (sheet: SheetWithRelations) => ({
  ...sheet,
  createdAt: sheet.createdAt.toISOString(),
  salaries: sheet.salaries.map((salary: SheetWithRelations["salaries"][number]) => ({
    ...salary,
    amount: Number(salary.amount),
  })),
  charges: sheet.charges.map((charge: SheetWithRelations["charges"][number]) => ({
    ...charge,
    amount: Number(charge.amount),
  })),
  budgets: sheet.budgets.map((budget: SheetWithRelations["budgets"][number]) => ({
    ...budget,
    amount: Number(budget.amount),
  })),
});

const resolveFamilySession = async () => {
  try {
    return await requireFamilySession();
  } catch {
    return null;
  }
};

export async function GET() {
  const familySession = await resolveFamilySession();
  if (!familySession) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const sheets = await sheetRepository.listAllWithDetails(familySession.familyId);
  return NextResponse.json(sheets.map(serializeSheet));
}

export async function POST(request: NextRequest) {
  const familySession = await resolveFamilySession();
  if (!familySession) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = sheetFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalide" }, { status: 400 });
  }

  const sheet = await sheetRepository.createForFamily(
    familySession.familyId,
    familySession.userId,
    parsed.data,
  );

  return NextResponse.json({ id: sheet.id });
}
