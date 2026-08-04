import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { ensureMemberForUser } from "@/lib/members";
import { invitationRepository } from "@/lib/repositories/invitations";
import { generateInviteCode, slugify } from "@/lib/utils";
import { getInvitationExpirationDate } from "@/lib/invitations";
import { registerRateLimiter } from "@/lib/rate-limit";

const baseFields = {
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
};

const registerSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("create"),
    ...baseFields,
    familyName: z.string().min(2),
    inviteCode: z.string().optional(),
  }),
  z.object({
    mode: z.literal("join"),
    ...baseFields,
    familyName: z.string().optional(),
    // [Important 3] .refine après transform pour rejeter les codes vides après trim
    inviteCode: z
      .string()
      .min(4)
      .transform((code) => code.trim().toUpperCase())
      .refine((code) => code.length >= 4, "Code invalide"),
  }),
]);

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? null;

  // Skip rate-limiting when IP cannot be determined (local dev, misconfigured proxy).
  // Sharing a single bucket for all unidentified clients would block legitimate users.
  if (ip !== null) {
    const rateLimitResult = registerRateLimiter.check(ip);
    if (!rateLimitResult.ok) {
      const retryAfterSec = Math.ceil(rateLimitResult.retryAfterMs / 1000);
      return NextResponse.json(
        { message: `Trop de tentatives. Réessayez dans ${Math.ceil(retryAfterSec / 60)} minutes.` },
        { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
      );
    }
  }

  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalide" }, { status: 400 });
  }

  const { mode, name, email, password, familyName, inviteCode } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ message: "Email déjà utilisé" }, { status: 409 });
  }

  let family = null;
  if (mode === "join") {
    if (!inviteCode) {
      return NextResponse.json({ message: "Code famille requis" }, { status: 400 });
    }

    // Seule une Invitation valide (non expirée, non utilisée) permet de rejoindre.
    // Le fallback sur Family.inviteCode brut est volontairement supprimé :
    // il court-circuitait la révocation via revokeActiveForFamily.
    const invitationRecord = await invitationRepository.findValidByCode(inviteCode);
    if (!invitationRecord?.family) {
      return NextResponse.json({ message: "Code famille invalide" }, { status: 404 });
    }

    family = invitationRecord.family;

    const passwordHash = await hash(password, 10);

    // [Critical 1] Utiliser fulfillInvitation pour créer l'utilisateur ET marquer
    // l'invitation comme utilisée dans une seule transaction atomique.
    // Évite la race condition : si un crash survient entre user.create et invitation.update,
    // l'invitation reste inutilisée et la transaction est annulée.
    const newUser = await invitationRepository.fulfillInvitation(invitationRecord.id, {
      name,
      email,
      password: passwordHash,
      familyId: family.id,
    });

    await ensureMemberForUser(newUser.id, family.id, name);

    return NextResponse.json({
      success: true,
      familyInviteCode: family.inviteCode,
    });
  }

  // Mode "create" : créer une nouvelle famille
  if (!familyName) {
    return NextResponse.json({ message: "Nom de famille requis" }, { status: 400 });
  }
  const baseSlug = slugify(familyName);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.family.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }
  let invite = generateInviteCode();
  while (await prisma.family.findUnique({ where: { inviteCode: invite } })) {
    invite = generateInviteCode();
  }

  family = await prisma.family.create({
    data: {
      name: familyName,
      slug,
      inviteCode: invite,
    },
  });

  // Créer l'invitation initiale liée à la famille
  await invitationRepository.createForFamily({
    familyId: family.id,
    rawCode: invite,
    expiresAt: getInvitationExpirationDate(),
  });

  const passwordHash = await hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      familyId: family.id,
    },
  });

  await ensureMemberForUser(newUser.id, family.id, name);

  return NextResponse.json({
    success: true,
    familyInviteCode: family.inviteCode,
  });
}
