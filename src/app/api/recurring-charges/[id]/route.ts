import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveFamilySession } from "@/lib/api/sheets";
import { encryptValue, encryptNumber, decryptValue, decryptNumber } from "@/lib/crypto";
import { recurringChargePatchSchema } from "@/lib/validations/recurring-charges";

type Params = { params: Promise<{ id: string }> };

async function resolveCharge(id: string, familyId: string) {
  const charge = await prisma.recurringCharge.findUnique({ where: { id } });
  if (!charge) return null;
  if (charge.familyId !== familyId) return null;
  return charge;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const charge = await resolveCharge(id, auth.familyId);
  if (!charge) return NextResponse.json({ message: "Introuvable" }, { status: 404 });

  const body = await request.json();
  const parsed = recurringChargePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalide", errors: parsed.error.flatten() }, { status: 400 });
  }

  const { label, amount, category, memberId, isActive } = parsed.data;

  if (memberId !== undefined && memberId !== null) {
    const member = await prisma.familyMember.findUnique({ where: { id: memberId } });
    if (!member || member.familyId !== auth.familyId) {
      return NextResponse.json({ message: "Membre introuvable" }, { status: 404 });
    }
  }

  const updated = await prisma.recurringCharge.update({
    where: { id },
    data: {
      ...(category !== undefined && { category }),
      ...(memberId !== undefined && { memberId: memberId ?? null }),
      ...(label !== undefined && { encryptedLabel: encryptValue(label) }),
      ...(amount !== undefined && { encryptedAmount: encryptNumber(amount) }),
      ...(isActive !== undefined && { isActive }),
    },
    include: { member: { select: { id: true, displayName: true } } },
  });

  return NextResponse.json({
    id: updated.id,
    category: updated.category,
    memberId: updated.memberId,
    memberName: updated.member?.displayName ?? null,
    label: decryptValue(updated.encryptedLabel),
    amount: decryptNumber(updated.encryptedAmount),
    isActive: updated.isActive,
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const charge = await resolveCharge(id, auth.familyId);
  if (!charge) return NextResponse.json({ message: "Introuvable" }, { status: 404 });

  await prisma.recurringCharge.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
