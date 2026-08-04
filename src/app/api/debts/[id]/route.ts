import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveFamilySession } from "@/lib/api/sheets";
import { encryptValue, encryptNumber } from "@/lib/crypto";
import { debtFormSchema } from "@/lib/validations/patrimoine";
import { decryptDebt } from "@/lib/patrimoine";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const parsed = debtFormSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Payload invalide" }, { status: 400 });

  const exists = await prisma.debt.count({ where: { id, familyId: auth.familyId } });
  if (!exists) return NextResponse.json({ message: "Dette introuvable" }, { status: 404 });

  const { label, balance, rate, monthlyPayment, endDate } = parsed.data;
  const debt = await prisma.debt.update({
    where: { id },
    data: {
      encryptedLabel: encryptValue(label),
      encryptedBalance: encryptNumber(balance),
      encryptedRate: encryptNumber(rate),
      encryptedMonthlyPayment: encryptNumber(monthlyPayment),
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return NextResponse.json(decryptDebt(debt));
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const exists = await prisma.debt.count({ where: { id, familyId: auth.familyId } });
  if (!exists) return NextResponse.json({ message: "Dette introuvable" }, { status: 404 });

  await prisma.debt.delete({ where: { id } });
  return NextResponse.json({ id });
}
