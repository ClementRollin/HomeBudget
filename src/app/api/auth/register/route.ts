import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";

import { familyRepository } from "@/lib/repositories/families";
import { userRepository } from "@/lib/repositories/users";
import { invitationRepository } from "@/lib/repositories/invitations";
import { generateInviteCode, slugify } from "@/lib/utils";
import { getInvitationExpirationDate } from "@/lib/invitations";

const baseFields = {
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
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
    inviteCode: z.string().min(4).transform((code) => code.trim().toUpperCase()),
  }),
]);

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalide" }, { status: 400 });
  }

  const { mode, name, email, password, familyName, inviteCode } = parsed.data;

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    return NextResponse.json({ message: "Email deja utilise" }, { status: 409 });
  }

  let family = null;
  let invitationRecord: Awaited<
    ReturnType<typeof invitationRepository.findValidByCode>
  > | null = null;
  if (mode === "join") {
    if (!inviteCode) {
      return NextResponse.json({ message: "Code famille requis" }, { status: 400 });
    }
    invitationRecord = await invitationRepository.findValidByCode(inviteCode);
    if (invitationRecord?.family) {
      family = invitationRecord.family;
    } else {
      family = await familyRepository.findByInviteCode(inviteCode);
    }
    if (!family) {
      return NextResponse.json({ message: "Code famille invalide" }, { status: 404 });
    }
  } else {
    if (!familyName) {
      return NextResponse.json({ message: "Nom de famille requis" }, { status: 400 });
    }
    const baseSlug = slugify(familyName);
    let slug = baseSlug;
    let suffix = 1;
    while (await familyRepository.findBySlug(slug)) {
      slug = `${baseSlug}-${suffix++}`;
    }
    let invite = generateInviteCode();
    while (await familyRepository.findByInviteCode(invite)) {
      invite = generateInviteCode();
    }

    family = await familyRepository.createFamily({
      name: familyName,
      slug,
      inviteCode: invite,
    });

    await invitationRepository.createForFamily({
      familyId: family.id,
      rawCode: invite,
      expiresAt: getInvitationExpirationDate(),
    });
  }

  const passwordHash = await hash(password, 10);

  if (invitationRecord) {
    await invitationRepository.fulfillInvitation(invitationRecord.id, {
      name,
      email,
      password: passwordHash,
      family: { connect: { id: family.id } },
    });
  } else {
    await userRepository.createForFamily(family.id, {
      name,
      email,
      password: passwordHash,
    });
  }

  return NextResponse.json({
    success: true,
    familyInviteCode: family.inviteCode,
  });
}
