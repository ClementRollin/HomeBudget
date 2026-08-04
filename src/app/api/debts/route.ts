import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveFamilySession } from "@/lib/api/sheets";
import { encryptValue, encryptNumber } from "@/lib/crypto";
import { debtFormSchema } from "@/lib/validations/patrimoine";
import { decryptDebt } from "@/lib/patrimoine";

export async function GET() {
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const debts = await prisma.debt.findMany({
    where: { familyId: auth.familyId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(debts.map(decryptDebt));
}

export async function POST(request: NextRequest) {
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const parsed = debtFormSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Payload invalide" }, { status: 400 });

  const { label, balance, rate, monthlyPayment, endDate } = parsed.data;

  const debt = await prisma.debt.create({
    data: {
      familyId: auth.familyId,
      encryptedLabel: encryptValue(label),
      encryptedBalance: encryptNumber(balance),
      encryptedRate: encryptNumber(rate),
      encryptedMonthlyPayment: encryptNumber(monthlyPayment),
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return NextResponse.json(decryptDebt(debt), { status: 201 });
}
