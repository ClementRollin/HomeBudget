import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActivePlan } from "@/lib/subscription";

export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const family = await prisma.family.findUnique({
    where: { id: session.user.familyId },
    select: { subscriptionStatus: true, subscriptionEndsAt: true },
  });

  if (!family) return NextResponse.json({ error: "Famille introuvable" }, { status: 404 });

  const plan = getActivePlan(family.subscriptionStatus, family.subscriptionEndsAt);

  return NextResponse.json({
    plan,
    status: family.subscriptionStatus,
    endsAt: family.subscriptionEndsAt?.toISOString() ?? null,
  });
}
