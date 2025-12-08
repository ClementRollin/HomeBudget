import { NextResponse, type NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const sheets = await prisma.sheet.findMany({
    where: { familyId: session.user.familyId },
    include: { salaries: true, charges: true, budgets: true },
    orderBy: [
      { year: "desc" },
      { month: "desc" },
    ],
  });

  return NextResponse.json(sheets.map(serializeSheet));
}

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();

  if (!session?.user) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = sheetFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalide" }, { status: 400 });
  }

  const sheet = await prisma.sheet.create({
    data: {
      year: parsed.data.year,
      month: parsed.data.month,
      familyId: session.user.familyId,
      ownerId: session.user.id,
      salaries: { create: parsed.data.salaries },
      charges: {
        create: parsed.data.charges.map((charge) => ({
          ...charge,
          person: charge.person || null,
        })),
      },
      budgets: { create: parsed.data.budgets },
    },
    include: { salaries: true, charges: true, budgets: true },
  });

  return NextResponse.json({ id: sheet.id });
}
