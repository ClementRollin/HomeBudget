import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { encryptNumber, decryptNumber } from "@/lib/crypto";
import { fiscalConfigSchema } from "@/lib/validations/fiscalite";

export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const config = await prisma.fiscalConfig.findUnique({
    where: { familyId: session.user.familyId },
  });

  if (!config) {
    return NextResponse.json({ isCoupled: false, perContribYTD: 0 });
  }

  const perContribYTD = config.encryptedPerContribYTD
    ? decryptNumber(config.encryptedPerContribYTD)
    : 0;

  return NextResponse.json({ isCoupled: config.isCoupled, perContribYTD });
}

export async function PUT(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const parsed = fiscalConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const { isCoupled, perContribYTD } = parsed.data;

  await prisma.fiscalConfig.upsert({
    where: { familyId: session.user.familyId },
    create: {
      familyId: session.user.familyId,
      isCoupled,
      encryptedPerContribYTD: encryptNumber(perContribYTD),
    },
    update: {
      isCoupled,
      encryptedPerContribYTD: encryptNumber(perContribYTD),
    },
  });

  return NextResponse.json({ isCoupled, perContribYTD });
}
