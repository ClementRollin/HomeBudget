import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveFamilySession } from "@/lib/api/sheets";
import { encryptValue, encryptNumber } from "@/lib/crypto";
import { assetFormSchema } from "@/lib/validations/patrimoine";
import { decryptAsset } from "@/lib/patrimoine";

export async function GET() {
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const assets = await prisma.asset.findMany({
    where: { familyId: auth.familyId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(assets.map(decryptAsset));
}

export async function POST(request: NextRequest) {
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const parsed = assetFormSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Payload invalide" }, { status: 400 });

  const { type, name, currentValue, totalInvested, annualFee } = parsed.data;

  const asset = await prisma.asset.create({
    data: {
      familyId: auth.familyId,
      type,
      encryptedName: encryptValue(name),
      encryptedCurrentValue: encryptNumber(currentValue),
      encryptedTotalInvested: encryptNumber(totalInvested),
      encryptedAnnualFee: annualFee !== undefined ? encryptNumber(annualFee) : "",
    },
  });

  return NextResponse.json(decryptAsset(asset), { status: 201 });
}
