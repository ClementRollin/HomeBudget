import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveFamilySession } from "@/lib/api/sheets";

export async function GET() {
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const members = await prisma.familyMember.findMany({
    where: { familyId: auth.familyId },
    include: { user: { select: { familyRole: true } } },
    orderBy: { createdAt: "asc" },
  });

  const result = members.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    slug: m.slug,
    userId: m.userId,
    familyRole: m.user?.familyRole ?? null,
    birthDate: m.birthDate ? m.birthDate.toISOString().slice(0, 10) : null,
    fiscalRole: m.fiscalRole,
    isAlternateGuard: m.isAlternateGuard,
    isDisabled: m.isDisabled,
    createdAt: m.createdAt.toISOString(),
  }));

  return NextResponse.json(result);
}
