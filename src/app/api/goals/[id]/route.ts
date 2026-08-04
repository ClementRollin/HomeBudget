import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveFamilySession } from "@/lib/api/sheets";
import { encryptValue, encryptNumber } from "@/lib/crypto";
import { goalFormSchema } from "@/lib/validations/patrimoine";
import { decryptGoal } from "@/lib/patrimoine";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const parsed = goalFormSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Payload invalide" }, { status: 400 });

  const exists = await prisma.patrimonialGoal.count({ where: { id, familyId: auth.familyId } });
  if (!exists) return NextResponse.json({ message: "Objectif introuvable" }, { status: 404 });

  const { label, target, horizon } = parsed.data;
  const goal = await prisma.patrimonialGoal.update({
    where: { id },
    data: {
      encryptedLabel: encryptValue(label),
      encryptedTarget: encryptNumber(target),
      horizon,
    },
  });

  return NextResponse.json(decryptGoal(goal));
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const exists = await prisma.patrimonialGoal.count({ where: { id, familyId: auth.familyId } });
  if (!exists) return NextResponse.json({ message: "Objectif introuvable" }, { status: 404 });

  await prisma.patrimonialGoal.delete({ where: { id } });
  return NextResponse.json({ id });
}
