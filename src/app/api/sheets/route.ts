import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveFamilySession, serializeSheet } from "@/lib/api/sheets";
import { encryptSheetPayload } from "@/lib/sheets";
import { sheetFormSchema } from "@/lib/validations/sheet";

export async function GET() {
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  const { familyId } = auth;

  const sheets = await prisma.sheet.findMany({
    where: { familyId },
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
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  const { familyId, userId } = auth;

  const body = await request.json();
  const parsed = sheetFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalide" }, { status: 400 });
  }

  const securePayload = await encryptSheetPayload(familyId, parsed.data);

  const sheet = await prisma.sheet.create({
    data: {
      year: parsed.data.year,
      month: parsed.data.month,
      familyId,
      ownerId: userId,
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
