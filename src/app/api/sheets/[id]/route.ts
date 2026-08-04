import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveFamilySession, serializeSheet } from "@/lib/api/sheets";
import { encryptSheetPayload } from "@/lib/sheets";
import { sheetFormSchema } from "@/lib/validations/sheet";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  const { familyId } = auth;

  const sheet = await prisma.sheet.findFirst({
    where: { id, familyId },
    include: {
      salaries: { include: { member: true } },
      charges: { include: { member: true } },
      budgets: true,
    },
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
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  const { familyId } = auth;

  const body = await request.json();
  const parsed = sheetFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalide" }, { status: 400 });
  }

  const sheetExists = await prisma.sheet.count({ where: { id, familyId } });
  if (!sheetExists) {
    return NextResponse.json({ message: "Fiche introuvable" }, { status: 404 });
  }

  const securePayload = await encryptSheetPayload(familyId, parsed.data);

  await prisma.$transaction([
    prisma.salary.deleteMany({ where: { sheetId: id } }),
    prisma.charge.deleteMany({ where: { sheetId: id } }),
    prisma.budget.deleteMany({ where: { sheetId: id } }),
    prisma.sheet.update({
      where: { id },
      data: {
        year: parsed.data.year,
        month: parsed.data.month,
        salaries: { create: securePayload.salaries },
        charges: { create: securePayload.charges },
        budgets: { create: securePayload.budgets },
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
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  const { familyId } = auth;

  const sheetExists = await prisma.sheet.count({ where: { id, familyId } });
  if (!sheetExists) {
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
