import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const family = await prisma.family.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      subscriptionStatus: true,
      subscriptionEndsAt: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      createdAt: true,
      onboardingCompletedAt: true,
      _count: {
        select: { sheets: true, assets: true, debts: true, goals: true },
      },
      users: {
        select: { id: true, name: true, email: true, familyRole: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
      members: {
        select: { id: true, displayName: true, fiscalRole: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!family) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(family);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const body = (await request.json()) as {
    subscriptionStatus?: string;
    subscriptionEndsAt?: string | null;
  };

  const allowed = ["FREE", "PRO", "PRO_CANCELED", "PRO_PAST_DUE"];
  if (body.subscriptionStatus && !allowed.includes(body.subscriptionStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.family.update({
    where: { id },
    data: {
      ...(body.subscriptionStatus
        ? { subscriptionStatus: body.subscriptionStatus as "FREE" | "PRO" | "PRO_CANCELED" | "PRO_PAST_DUE" }
        : {}),
      ...(body.subscriptionEndsAt !== undefined
        ? { subscriptionEndsAt: body.subscriptionEndsAt ? new Date(body.subscriptionEndsAt) : null }
        : {}),
    },
    select: { id: true, subscriptionStatus: true, subscriptionEndsAt: true },
  });

  return NextResponse.json(updated);
}
