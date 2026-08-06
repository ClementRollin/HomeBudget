import { NextResponse, type NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ invitationId: string }> };

// DELETE — révoque une invitation spécifique (OWNER uniquement)
export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getCurrentSession();
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (session.user.familyRole !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { invitationId } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });
  }

  // Vérifier que l'invitation appartient bien à la famille de la session
  if (invitation.familyId !== session.user.familyId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Révoquer en marquant expiresAt = maintenant
  await prisma.invitation.update({
    where: { id: invitationId },
    data: { expiresAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
