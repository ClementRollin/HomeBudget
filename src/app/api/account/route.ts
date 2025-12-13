import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { z } from "zod";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const accountSchema = z
  .object({
    name: z.string().min(2, "Nom trop court").max(80, "Nom trop long").optional(),
    email: z.string().email("Email invalide").optional(),
    currentPassword: z.string().min(6, "Mot de passe actuel invalide").optional(),
    newPassword: z.string().min(6, "Nouveau mot de passe trop court").optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword) {
        return Boolean(data.currentPassword);
      }
      return true;
    },
    { message: "Mot de passe actuel requis", path: ["currentPassword"] },
  );

export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = accountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Donnees invalides" }, { status: 400, errors: parsed.error.flatten() });
  }

  const { name, email, currentPassword, newPassword } = parsed.data;

  if (!name && !email && !newPassword) {
    return NextResponse.json({ message: "Aucune modification detectee" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
  }

  const data: { name?: string; email?: string; password?: string } = {};

  if (name && name !== user.name) {
    data.name = name;
  }
  if (email && email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ message: "Email deja utilise" }, { status: 409 });
    }
    data.email = email;
  }

  if (newPassword) {
    const passwordMatches = await compare(currentPassword ?? "", user.password);
    if (!passwordMatches) {
      return NextResponse.json({ message: "Mot de passe actuel incorrect" }, { status: 400 });
    }
    data.password = await hash(newPassword, 10);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ message: "Aucune modification detectee" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    include: { family: true },
  });

  return NextResponse.json({
    message: "Compte mis a jour",
    user: {
      name: updated.name,
      email: updated.email,
    },
    familyInviteCode: updated.family.inviteCode,
  });
}
