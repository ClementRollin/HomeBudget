import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveFamilySession } from "@/lib/api/sheets";
import { encryptValue, encryptNumber } from "@/lib/crypto";
import { assetFormSchema } from "@/lib/validations/patrimoine";
import { decryptAsset } from "@/lib/patrimoine";
import { getFamilySubscription, getActivePlan, checkLimit } from "@/lib/subscription";

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

  const sub = await getFamilySubscription(auth.familyId);
  const plan = getActivePlan(sub.subscriptionStatus, sub.subscriptionEndsAt);
  const assetCount = await prisma.asset.count({ where: { familyId: auth.familyId } });
  const limitCheck = checkLimit(plan, "maxAssets", assetCount);
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: "LIMIT_REACHED", limit: limitCheck.limit, resource: "assets" },
      { status: 402 },
    );
  }

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
