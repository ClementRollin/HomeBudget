import { NextResponse, type NextRequest } from "next/server";

import { requireFamilySession } from "@/lib/tenant";
import { sheetRepository } from "@/lib/repositories/sheets";
import { getCurrentPeriod, isPastPeriod, type SheetWithRelations } from "@/lib/sheets";
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

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await resolveFamilySession();
  if (!session) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const { id } = await context.params;
  const sheet = await sheetRepository.getById(session.familyId, id);
  if (!sheet) {
    return NextResponse.json({ message: "Fiche introuvable" }, { status: 404 });
  }

  return NextResponse.json(serializeSheet(sheet));
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await resolveFamilySession();
  if (!session) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await sheetRepository.getById(session.familyId, id);
  if (!existing) {
    return NextResponse.json({ message: "Fiche introuvable" }, { status: 404 });
  }
  if (isPastPeriod(existing.year, existing.month, getCurrentPeriod())) {
    return NextResponse.json({ message: "Fiche verrouillee" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = sheetFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalide" }, { status: 400 });
  }

  await sheetRepository.updateForFamily(session.familyId, id, parsed.data);

  return NextResponse.json({ id });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await resolveFamilySession();
  if (!session) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await sheetRepository.getById(session.familyId, id);
  if (!existing) {
    return NextResponse.json({ message: "Fiche introuvable" }, { status: 404 });
  }
  if (isPastPeriod(existing.year, existing.month, getCurrentPeriod())) {
    return NextResponse.json({ message: "Fiche verrouillee" }, { status: 403 });
  }

  await sheetRepository.deleteForFamily(session.familyId, id);

  return NextResponse.json({ id });
}
