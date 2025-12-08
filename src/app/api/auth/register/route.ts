import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { generateInviteCode, slugify } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  familyName: z.string().min(2),
  inviteCode: z.string().optional().transform((code) => code?.trim().toUpperCase()),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalide" }, { status: 400 });
  }

  const { name, email, password, familyName, inviteCode } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ message: "Email déjà utilisé" }, { status: 409 });
  }

  let family = null;
  if (inviteCode) {
    family = await prisma.family.findUnique({ where: { inviteCode } });
    if (!family) {
      return NextResponse.json({ message: "Code famille invalide" }, { status: 404 });
    }
  } else {
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

  await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      familyId: family.id,
    },
  });

  return NextResponse.json({
    success: true,
    familyInviteCode: family.inviteCode,
  });
}
