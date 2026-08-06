import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveFamilySession } from "@/lib/api/sheets";
import { encryptValue, encryptNumber } from "@/lib/crypto";
import { assetFormSchema } from "@/lib/validations/patrimoine";
import { decryptAsset } from "@/lib/patrimoine";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const parsed = assetFormSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Payload invalide" }, { status: 400 });

  const exists = await prisma.asset.count({ where: { id, familyId: auth.familyId } });
  if (!exists) return NextResponse.json({ message: "Actif introuvable" }, { status: 404 });

  const { type, name, currentValue, totalInvested, annualFee } = parsed.data;
  const asset = await prisma.asset.update({
    where: { id },
    data: {
      type,
      encryptedName: encryptValue(name),
      encryptedCurrentValue: encryptNumber(currentValue),
      encryptedTotalInvested: encryptNumber(totalInvested),
      encryptedAnnualFee: annualFee !== undefined ? encryptNumber(annualFee) : "",
    },
  });

  const now = new Date();
  await prisma.assetSnapshot.upsert({
    where: { assetId_year_month: { assetId: id, year: now.getFullYear(), month: now.getMonth() + 1 } },
    create: { assetId: id, year: now.getFullYear(), month: now.getMonth() + 1, encryptedValue: encryptNumber(currentValue) },
    update: { encryptedValue: encryptNumber(currentValue) },
  });

  return NextResponse.json(decryptAsset(asset));
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const exists = await prisma.asset.count({ where: { id, familyId: auth.familyId } });
  if (!exists) return NextResponse.json({ message: "Actif introuvable" }, { status: 404 });

  await prisma.asset.delete({ where: { id } });
  return NextResponse.json({ id });
}
