import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveFamilySession } from "@/lib/api/sheets";
import { encryptValue, encryptNumber } from "@/lib/crypto";
import { goalFormSchema } from "@/lib/validations/patrimoine";
import { decryptGoal } from "@/lib/patrimoine";
import { getFamilySubscription, getActivePlan, checkLimit } from "@/lib/subscription";

export async function GET() {
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const goals = await prisma.patrimonialGoal.findMany({
    where: { familyId: auth.familyId },
    orderBy: { horizon: "asc" },
  });

  return NextResponse.json(goals.map(decryptGoal));
}

export async function POST(request: NextRequest) {
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const sub = await getFamilySubscription(auth.familyId);
  const plan = getActivePlan(sub.subscriptionStatus, sub.subscriptionEndsAt);
  const goalCount = await prisma.patrimonialGoal.count({ where: { familyId: auth.familyId } });
  const limitCheck = checkLimit(plan, "maxGoals", goalCount);
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: "LIMIT_REACHED", limit: limitCheck.limit, resource: "goals" },
      { status: 402 },
    );
  }

  const body = await request.json();
  const parsed = goalFormSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Payload invalide" }, { status: 400 });

  const { label, target, horizon } = parsed.data;

  const goal = await prisma.patrimonialGoal.create({
    data: {
      familyId: auth.familyId,
      encryptedLabel: encryptValue(label),
      encryptedTarget: encryptNumber(target),
      horizon,
    },
  });

  return NextResponse.json(decryptGoal(goal), { status: 201 });
}
