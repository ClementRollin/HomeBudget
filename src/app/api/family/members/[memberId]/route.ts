import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { resolveFamilySession } from "@/lib/api/sheets";
import { memberUpdateSchema } from "@/lib/validations/member";

type Params = { params: Promise<{ memberId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const { memberId } = await params;

  const member = await prisma.familyMember.findUnique({
    where: { id: memberId },
    include: { user: { select: { familyRole: true } } },
  });

  if (!member) return NextResponse.json({ message: "Membre introuvable" }, { status: 404 });
  if (member.familyId !== auth.familyId) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
  }

  const isOwner = member.user?.familyRole === "OWNER";
  const isOwnMember = member.userId === auth.userId;
  if (!isOwner && !isOwnMember) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = memberUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalide", errors: parsed.error.flatten() }, { status: 400 });
  }

  const { birthDate, ...rest } = parsed.data;

  const updated = await prisma.familyMember.update({
    where: { id: memberId },
    data: {
      ...rest,
      ...(birthDate !== undefined
        ? { birthDate: birthDate === null ? null : new Date(birthDate) }
        : {}),
    },
  });

  return NextResponse.json({
    id: updated.id,
    displayName: updated.displayName,
    slug: updated.slug,
    birthDate: updated.birthDate ? updated.birthDate.toISOString().slice(0, 10) : null,
    fiscalRole: updated.fiscalRole,
    isAlternateGuard: updated.isAlternateGuard,
    isDisabled: updated.isDisabled,
  });
}

// DELETE — supprime un membre fantôme (sans compte utilisateur), OWNER uniquement
export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getCurrentSession();
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (session.user.familyRole !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { memberId } = await params;

  const member = await prisma.familyMember.findUnique({
    where: { id: memberId },
  });

  if (!member) {
    return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });
  }
  if (member.familyId !== session.user.familyId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Refuser la suppression d'un membre lié à un vrai compte utilisateur
  if (member.userId !== null) {
    return NextResponse.json(
      { error: "Impossible de supprimer un membre avec un compte utilisateur actif" },
      { status: 422 },
    );
  }

  await prisma.familyMember.delete({ where: { id: memberId } });

  return NextResponse.json({ success: true });
}
