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

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const sheet = await prisma.sheet.findFirst({
    where: { id, familyId: session.user.familyId },
    include: { salaries: true, charges: true, budgets: true },
  });

  if (!sheet) {
    return NextResponse.json({ message: "Fiche introuvable" }, { status: 404 });
  }

  return NextResponse.json(serializeSheet(sheet));
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = sheetFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalide" }, { status: 400 });
  }

  const existingSheet = await prisma.sheet.findFirst({
    where: { id, familyId: session.user.familyId },
  });
  if (!existingSheet) {
    return NextResponse.json({ message: "Fiche introuvable" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.salary.deleteMany({ where: { sheetId: id } }),
    prisma.charge.deleteMany({ where: { sheetId: id } }),
    prisma.budget.deleteMany({ where: { sheetId: id } }),
    prisma.sheet.update({
      where: { id },
      data: {
        year: parsed.data.year,
        month: parsed.data.month,
        salaries: { create: parsed.data.salaries },
        charges: {
          create: parsed.data.charges.map((charge) => ({
            ...charge,
            person: charge.person || null,
          })),
        },
        budgets: { create: parsed.data.budgets },
      },
    }),
  ]);

  return NextResponse.json({ id });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const sheet = await prisma.sheet.findFirst({
    where: { id, familyId: session.user.familyId },
  });
  if (!sheet) {
    return NextResponse.json({ message: "Fiche introuvable" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.salary.deleteMany({ where: { sheetId: id } }),
    prisma.charge.deleteMany({ where: { sheetId: id } }),
    prisma.budget.deleteMany({ where: { sheetId: id } }),
    prisma.sheet.delete({
      where: { id },
    }),
  ]);

  return NextResponse.json({ id });
}
