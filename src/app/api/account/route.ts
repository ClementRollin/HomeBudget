import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

import { requireFamilySession } from "@/lib/tenant";
import { userRepository } from "@/lib/repositories/users";

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

const resolveSession = async () => {
  try {
    return await requireFamilySession();
  } catch {
    return null;
  }
};

export async function PATCH(request: Request) {
  const session = await resolveSession();
  if (!session) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = accountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Donnees invalides", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, email, currentPassword, newPassword } = parsed.data;
  if (!name && !email && !newPassword) {
    return NextResponse.json({ message: "Aucune modification detectee" }, { status: 400 });
  }

  const user = await userRepository.findByIdWithFamily(session.userId);
  if (!user) {
    return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
  }

  const updates: Prisma.UserUpdateInput = {};

  if (name && name !== user.name) {
    updates.name = name;
  }

  if (email && email !== user.email) {
    const existing = await userRepository.findByEmail(email);
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ message: "Email deja utilise" }, { status: 409 });
    }
    updates.email = email;
  }

  if (newPassword) {
    const passwordMatches = await compare(currentPassword ?? "", user.password);
    if (!passwordMatches) {
      return NextResponse.json({ message: "Mot de passe actuel incorrect" }, { status: 400 });
    }
    updates.password = await hash(newPassword, 10);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ message: "Aucune modification detectee" }, { status: 400 });
  }

  const updated = await userRepository.updateProfile(user.id, updates);

  return NextResponse.json({
    message: "Compte mis a jour",
    user: {
      name: updated.name,
      email: updated.email,
    },
    familyInviteCode: updated.family.inviteCode,
  });
}
