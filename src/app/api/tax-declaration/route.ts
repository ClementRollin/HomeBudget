import { NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { decryptNumber, decryptValue } from "@/lib/crypto";
import {
  buildDeclaration2042,
  computeIncomeByDeclarant,
  computeQuotientFamilial,
  type FamilyMemberFiscal,
  type FamilyMemberFiscalWithId,
  type SheetWithSalaries,
} from "@/lib/fiscalite";
import { prisma } from "@/lib/prisma";

// GET : construit le résultat de la déclaration 2042 pour une année donnée
export const GET = async (req: NextRequest) => {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const taxYearParam = searchParams.get("taxYear");
  const taxYear = taxYearParam ? Number(taxYearParam) : new Date().getFullYear();

  if (!Number.isInteger(taxYear) || taxYear < 2020 || taxYear > 2100) {
    return NextResponse.json({ error: "taxYear invalide" }, { status: 400 });
  }

  const familyId = session.user.familyId;

  // Récupérer les fiches de l'année, les membres, la config fiscale et les documents validés N-1
  const [rawSheets, rawMembers, fiscalConfig, previousDocs] = await Promise.all([
    prisma.sheet.findMany({
      where: { familyId, year: taxYear },
      include: {
        salaries: { include: { member: true } },
      },
    }),
    prisma.familyMember.findMany({
      where: { familyId },
      select: {
        id: true,
        displayName: true,
        fiscalRole: true,
        isAlternateGuard: true,
        isDisabled: true,
      },
    }),
    prisma.fiscalConfig.findUnique({ where: { familyId } }),
    // Documents de l'année N-1 déjà validés
    prisma.taxDocument.findMany({
      where: {
        familyId,
        taxYear: taxYear - 1,
        validatedAt: { not: null },
      },
      orderBy: { validatedAt: "desc" },
    }),
  ]);

  // Construire les fiches avec les salaires décryptés
  const sheets: SheetWithSalaries[] = rawSheets.map((sheet) => ({
    year: sheet.year,
    month: sheet.month,
    salaries: sheet.salaries.map((s) => ({
      memberId: s.memberId,
      amount: decryptNumber(s.encryptedAmount),
    })),
  }));

  // Membres avec leur rôle fiscal
  const members: FamilyMemberFiscalWithId[] = rawMembers.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    fiscalRole: m.fiscalRole as FamilyMemberFiscal["fiscalRole"],
    isAlternateGuard: m.isAlternateGuard,
    isDisabled: m.isDisabled,
  }));

  // Calcul des cases 1AJ / 1BJ
  const { case1AJ, case1BJ } = computeIncomeByDeclarant(sheets, members);

  // Récupérer les données depuis la config fiscale
  const perContribYTD = fiscalConfig?.encryptedPerContribYTD
    ? decryptNumber(fiscalConfig.encryptedPerContribYTD)
    : 0;
  const dividends = fiscalConfig?.encryptedDividends
    ? decryptNumber(fiscalConfig.encryptedDividends)
    : 0;
  const capitalGains = fiscalConfig?.encryptedCapitalGains
    ? decryptNumber(fiscalConfig.encryptedCapitalGains)
    : 0;
  const rentalIncome = fiscalConfig?.encryptedRentalIncome
    ? decryptNumber(fiscalConfig.encryptedRentalIncome)
    : 0;

  // Récupérer les cases de l'année N-1 depuis le premier document validé
  let previousYearCases: Record<string, number> | undefined;
  if (previousDocs.length > 0 && previousDocs[0].encryptedExtractedCases) {
    try {
      previousYearCases = JSON.parse(
        decryptValue(previousDocs[0].encryptedExtractedCases)
      ) as Record<string, number>;
    } catch {
      previousYearCases = undefined;
    }
  }

  // Construire la déclaration 2042
  const declaration = buildDeclaration2042({
    case1AJ,
    case1BJ,
    perContribYTD,
    dividends,
    capitalGains,
    rentalIncome,
    previousYearCases,
  });

  // Quotient familial
  const fiscalMembers: FamilyMemberFiscal[] = members.map((m) => ({
    fiscalRole: m.fiscalRole,
    isAlternateGuard: m.isAlternateGuard,
    isDisabled: m.isDisabled,
  }));
  const quotientFamilial = computeQuotientFamilial(fiscalMembers);

  return NextResponse.json({
    taxYear,
    declaration,
    quotientFamilial,
  });
};
