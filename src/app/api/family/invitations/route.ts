import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";

import { getCurrentSession } from "@/lib/auth";
import { invitationRepository } from "@/lib/repositories/invitations";
import { getInvitationExpirationDate } from "@/lib/invitations";

const generateRawCode = (): string =>
  crypto.randomBytes(8).toString("hex").toUpperCase();

const postBodySchema = z.object({
  expirationDays: z.number().int().min(1).max(365).optional(),
});

// Guard OWNER : retourne la session ou une Response d'erreur
async function requireOwnerSession() {
  const session = await getCurrentSession();
  if (!session?.user?.familyId) {
    return { error: NextResponse.json({ error: "Non autorisé" }, { status: 401 }) };
  }
  if (session.user.familyRole !== "OWNER") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

// GET — liste les invitations actives de la famille (OWNER uniquement)
export async function GET() {
  const result = await requireOwnerSession();
  if (result.error) return result.error;
  const { session } = result;

  const invitations = await invitationRepository.listActiveForFamily(session.user!.familyId);

  const serialized = invitations.map((inv) => ({
    id: inv.id,
    familyId: inv.familyId,
    createdAt: inv.createdAt.toISOString(),
    expiresAt: inv.expiresAt ? inv.expiresAt.toISOString() : null,
    usedAt: inv.usedAt ? inv.usedAt.toISOString() : null,
  }));

  return NextResponse.json(serialized);
}

// POST — génère un nouveau code d'invitation (OWNER uniquement)
// Le rawCode est retourné UNE SEULE FOIS dans la réponse, jamais stocké en clair.
export async function POST(request: NextRequest) {
  const result = await requireOwnerSession();
  if (result.error) return result.error;
  const { session } = result;

  const body = await request.json().catch(() => ({}));
  const parsed = postBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const { expirationDays } = parsed.data;
  const familyId = session.user!.familyId;

  // Révoquer les invitations actives existantes avant d'en créer une nouvelle
  await invitationRepository.revokeActiveForFamily(familyId);

  const rawCode = generateRawCode();
  const expiresAt = getInvitationExpirationDate(expirationDays);

  const invitation = await invitationRepository.createForFamily({
    familyId,
    rawCode,
    createdByUserId: session.user!.id,
    expiresAt,
  });

  // rawCode exposé une seule fois — non stocké en clair côté serveur
  return NextResponse.json(
    {
      id: invitation.id,
      rawCode,
      expiresAt: invitation.expiresAt ? invitation.expiresAt.toISOString() : null,
    },
    { status: 201 },
  );
}
