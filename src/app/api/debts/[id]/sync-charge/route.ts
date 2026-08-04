import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveFamilySession } from "@/lib/api/sheets";
import { encryptValue, encryptNumber, decryptValue, decryptNumber } from "@/lib/crypto";
import { getCurrentPeriod } from "@/lib/sheets";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: debtId } = await context.params;

  const auth = await resolveFamilySession();
  if (!auth) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const debt = await prisma.debt.findFirst({
    where: { id: debtId, familyId: auth.familyId },
  });
  if (!debt) return NextResponse.json({ message: "Dette introuvable" }, { status: 404 });

  const period = getCurrentPeriod();

  // Trouver la fiche du mois courant
  const sheet = await prisma.sheet.findFirst({
    where: { familyId: auth.familyId, year: period.year, month: period.month },
    select: { id: true },
  });
  if (!sheet) {
    return NextResponse.json(
      { message: `Aucune fiche pour ${period.month}/${period.year}. Créez-en une d'abord.` },
      { status: 422 },
    );
  }

  // Vérifier si une charge liée à cette dette existe déjà dans la fiche
  const existingCharge = await prisma.charge.findFirst({
    where: { sheetId: sheet.id, debtId },
  });
  if (existingCharge) {
    return NextResponse.json(
      { message: "Une charge liée à cette dette existe déjà dans la fiche courante." },
      { status: 409 },
    );
  }

  // Déchiffrer le label et la mensualité depuis la dette
  const debtLabel = decryptValue(debt.encryptedLabel);
  const monthlyPayment = decryptNumber(debt.encryptedMonthlyPayment);

  const charge = await prisma.charge.create({
    data: {
      sheetId: sheet.id,
      debtId,
      category: "FIXE_COMMUN",
      encryptedLabel: encryptValue(debtLabel),
      encryptedAmount: encryptNumber(monthlyPayment),
    },
  });

  return NextResponse.json({ chargeId: charge.id }, { status: 201 });
}
