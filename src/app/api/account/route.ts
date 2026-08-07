import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { decryptNumber, decryptValue } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function DELETE() {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const familyId = session.user.familyId;
  const familyRole = session.user.familyRole;

  if (familyRole === "OWNER") {
    const otherUsersCount = await prisma.user.count({
      where: { familyId, id: { not: userId } },
    });
    if (otherUsersCount > 0) {
      return NextResponse.json(
        { error: "Retirez tous les membres du foyer avant de supprimer votre compte." },
        { status: 409 },
      );
    }

    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { stripeSubscriptionId: true },
    });
    if (family?.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(family.stripeSubscriptionId);
      } catch {
        // Stripe not configured or already cancelled — proceed anyway
      }
    }

    await prisma.$transaction([
      prisma.assetSnapshot.deleteMany({ where: { asset: { familyId } } }),
      prisma.charge.deleteMany({ where: { sheet: { familyId } } }),
      prisma.salary.deleteMany({ where: { sheet: { familyId } } }),
      prisma.budget.deleteMany({ where: { sheet: { familyId } } }),
      prisma.sheet.deleteMany({ where: { familyId } }),
      prisma.asset.deleteMany({ where: { familyId } }),
      prisma.debt.deleteMany({ where: { familyId } }),
      prisma.patrimonialGoal.deleteMany({ where: { familyId } }),
      prisma.fiscalConfig.deleteMany({ where: { familyId } }),
      prisma.taxDocument.deleteMany({ where: { familyId } }),
      prisma.invitation.deleteMany({ where: { familyId } }),
      prisma.familyMember.deleteMany({ where: { familyId } }),
      prisma.user.delete({ where: { id: userId } }),
      prisma.family.delete({ where: { id: familyId } }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.familyMember.updateMany({ where: { userId }, data: { userId: null } }),
      prisma.sheet.updateMany({ where: { ownerId: userId }, data: { ownerId: null } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const familyId = session.user.familyId;

  const [family, members, sheets, assets, debts, goals, fiscalConfig, taxDocuments] =
    await Promise.all([
      prisma.family.findUnique({
        where: { id: familyId },
        select: { name: true, createdAt: true, subscriptionStatus: true },
      }),
      prisma.familyMember.findMany({
        where: { familyId },
        select: { displayName: true, birthDate: true, fiscalRole: true },
      }),
      prisma.sheet.findMany({
        where: { familyId },
        include: { salaries: true, charges: true, budgets: true },
        orderBy: [{ year: "asc" }, { month: "asc" }],
      }),
      prisma.asset.findMany({ where: { familyId } }),
      prisma.debt.findMany({ where: { familyId } }),
      prisma.patrimonialGoal.findMany({ where: { familyId } }),
      prisma.fiscalConfig.findUnique({ where: { familyId } }),
      prisma.taxDocument.findMany({
        where: { familyId },
        select: { taxYear: true, documentType: true, extractionStatus: true, createdAt: true },
      }),
    ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    family: {
      name: family?.name,
      createdAt: family?.createdAt,
      subscriptionStatus: family?.subscriptionStatus,
    },
    members,
    sheets: sheets.map((s) => ({
      year: s.year,
      month: s.month,
      createdAt: s.createdAt,
      salaries: s.salaries.map((sal) => ({
        label: decryptValue(sal.encryptedLabel),
        amount: decryptNumber(sal.encryptedAmount),
      })),
      charges: s.charges.map((c) => ({
        label: decryptValue(c.encryptedLabel),
        amount: decryptNumber(c.encryptedAmount),
        category: c.category,
      })),
      budgets: s.budgets.map((b) => ({
        label: decryptValue(b.encryptedLabel),
        amount: decryptNumber(b.encryptedAmount),
      })),
    })),
    assets: assets.map((a) => ({
      type: a.type,
      name: decryptValue(a.encryptedName),
      currentValue: decryptNumber(a.encryptedCurrentValue),
      totalInvested: decryptNumber(a.encryptedTotalInvested),
      annualFee: decryptNumber(a.encryptedAnnualFee),
      createdAt: a.createdAt,
    })),
    debts: debts.map((d) => ({
      label: decryptValue(d.encryptedLabel),
      balance: decryptNumber(d.encryptedBalance),
      rate: decryptNumber(d.encryptedRate),
      monthlyPayment: decryptNumber(d.encryptedMonthlyPayment),
      endDate: d.endDate,
    })),
    goals: goals.map((g) => ({
      label: decryptValue(g.encryptedLabel),
      target: decryptNumber(g.encryptedTarget),
      horizon: g.horizon,
    })),
    fiscalConfig: fiscalConfig
      ? {
          isCoupled: fiscalConfig.isCoupled,
          taxYear: fiscalConfig.taxYear,
          perContribYTD: decryptNumber(fiscalConfig.encryptedPerContribYTD),
          dividends: decryptNumber(fiscalConfig.encryptedDividends),
          capitalGains: decryptNumber(fiscalConfig.encryptedCapitalGains),
          rentalIncome: decryptNumber(fiscalConfig.encryptedRentalIncome),
        }
      : null,
    taxDocuments,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="homebudget-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
