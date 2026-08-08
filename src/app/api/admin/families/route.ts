import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { users: { some: { email: { contains: q, mode: "insensitive" as const } } } },
        ],
      }
    : {};

  const [families, total] = await Promise.all([
    prisma.family.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        createdAt: true,
        _count: { select: { users: true } },
        users: {
          where: { familyRole: "OWNER" },
          select: { email: true },
          take: 1,
        },
      },
    }),
    prisma.family.count({ where }),
  ]);

  return NextResponse.json({ families, total, page, pages: Math.ceil(total / limit) });
}
