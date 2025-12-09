import { NextResponse, type NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptSheet, encryptSheetPayload, type SecureSheet } from "@/lib/sheets";
import { sheetFormSchema } from "@/lib/validations/sheet";

const serializeSheet = (sheet: SecureSheet) => {
  const decrypted = decryptSheet(sheet);
  return {
    ...decrypted,
    createdAt: decrypted.createdAt.toISOString(),
  };
};

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const sheets = await prisma.sheet.findMany({
    where: { familyId: session.user.familyId },
    include: {
      salaries: { include: { member: true } },
      charges: { include: { member: true } },
      budgets: true,
    },
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

  const securePayload = await encryptSheetPayload(session.user.familyId, parsed.data);

  const sheet = await prisma.sheet.create({
    data: {
      year: parsed.data.year,
      month: parsed.data.month,
      familyId: session.user.familyId,
      ownerId: session.user.id,
      salaries: { create: securePayload.salaries },
      charges: { create: securePayload.charges },
      budgets: { create: securePayload.budgets },
    },
    include: {
      salaries: { include: { member: true } },
      charges: { include: { member: true } },
      budgets: true,
    },
  });

  return NextResponse.json({ id: sheet.id, sheet: serializeSheet(sheet) });
}
