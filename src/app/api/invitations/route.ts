import { NextResponse } from "next/server";
import { z } from "zod";

import { requireFamilySession } from "@/lib/tenant";
import { invitationRepository } from "@/lib/repositories/invitations";
import { familyRepository } from "@/lib/repositories/families";
import { generateInviteCode } from "@/lib/utils";
import { getInvitationExpirationDate } from "@/lib/invitations";

const generationSchema = z
  .object({
    expiresInDays: z.number().int().positive().max(90).optional(),
  })
  .optional();

export async function POST(request: Request) {
  const session = await requireFamilySession().catch(() => null);
  if (!session) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = generationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Parametres invalides" }, { status: 400 });
  }

  await invitationRepository.revokeActiveForFamily(session.familyId);

  const rawCode = generateInviteCode();
  const expiresAt = getInvitationExpirationDate(parsed.data?.expiresInDays);

  await invitationRepository.createForFamily({
    familyId: session.familyId,
    rawCode,
    createdByUserId: session.userId,
    expiresAt,
  });

  await familyRepository.updateInviteCode(session.familyId, rawCode);

  return NextResponse.json({
    code: rawCode,
    expiresAt: expiresAt?.toISOString() ?? null,
  });
}

export async function DELETE() {
  const session = await requireFamilySession().catch(() => null);
  if (!session) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  await invitationRepository.revokeActiveForFamily(session.familyId);

  return NextResponse.json({ success: true });
}
