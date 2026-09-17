import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveFamilySession } from "@/lib/api/sheets";
import { encryptValue, encryptNumber, decryptValue, decryptNumber } from "@/lib/crypto";
import { recurringChargeSchema } from "@/lib/validations/recurring-charges";

export async function GET() {
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const charges = await prisma.recurringCharge.findMany({
    where: { familyId: auth.familyId },
    include: { member: { select: { id: true, displayName: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    charges.map((c) => ({
      id: c.id,
      category: c.category,
      memberId: c.memberId,
      memberName: c.member?.displayName ?? null,
      label: decryptValue(c.encryptedLabel),
      amount: decryptNumber(c.encryptedAmount),
      isActive: c.isActive,
    })),
  );
}

export async function POST(request: NextRequest) {
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const parsed = recurringChargeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalide", errors: parsed.error.flatten() }, { status: 400 });
  }

  const { category, memberId, label, amount } = parsed.data;

  if (memberId) {
    const member = await prisma.familyMember.findUnique({ where: { id: memberId } });
    if (!member || member.familyId !== auth.familyId) {
      return NextResponse.json({ message: "Membre introuvable" }, { status: 404 });
    }
  }

  const charge = await prisma.recurringCharge.create({
    data: {
      familyId: auth.familyId,
      category,
      memberId: memberId ?? null,
      encryptedLabel: encryptValue(label),
      encryptedAmount: encryptNumber(amount),
    },
    include: { member: { select: { id: true, displayName: true } } },
  });

  return NextResponse.json({
    id: charge.id,
    category: charge.category,
    memberId: charge.memberId,
    memberName: charge.member?.displayName ?? null,
    label,
    amount,
    isActive: charge.isActive,
  }, { status: 201 });
}
