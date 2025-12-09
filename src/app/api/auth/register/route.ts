import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { ensureMemberForUser } from "@/lib/members";
import { generateInviteCode, slugify } from "@/lib/utils";

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

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ message: "Email déjà utilisé" }, { status: 409 });
  }

  let family = null;
  if (mode === "join") {
    if (!inviteCode) {
      return NextResponse.json({ message: "Code famille requis" }, { status: 400 });
    }
    family = await prisma.family.findUnique({ where: { inviteCode } });
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
  }

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
