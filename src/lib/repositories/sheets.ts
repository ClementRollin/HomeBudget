import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { SheetFormValues } from "@/lib/validations/sheet";
import type { SheetWithRelations } from "@/lib/sheets";

const defaultSheetInclude = {
  salaries: true,
  charges: true,
  budgets: true,
} satisfies Prisma.SheetInclude;

const buildNestedEntries = (payload: SheetFormValues) => ({
  year: payload.year,
  month: payload.month,
  salaries: { create: payload.salaries },
  charges: {
    create: payload.charges.map((charge) => ({
      ...charge,
      person: charge.person || null,
    })),
  },
  budgets: { create: payload.budgets },
});

export const sheetRepository = {
  findForMonth: (familyId: string, { month, year }: { month: number; year: number }) =>
    prisma.sheet.findFirst({
      where: { familyId, month, year },
      include: defaultSheetInclude,
      orderBy: { createdAt: "desc" },
    }) as Promise<SheetWithRelations | null>,

  listRecent: (familyId: string, limit = 5) =>
    prisma.sheet.findMany({
      where: { familyId },
      include: defaultSheetInclude,
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: limit,
    }) as Promise<SheetWithRelations[]>,

  listForYear: (familyId: string, year: number) =>
    prisma.sheet.findMany({
      where: { familyId, year },
      include: defaultSheetInclude,
    }) as Promise<SheetWithRelations[]>,

  listAllWithDetails: (familyId: string) =>
    prisma.sheet.findMany({
      where: { familyId },
      include: defaultSheetInclude,
      orderBy: [{ year: "desc" }, { month: "desc" }],
    }) as Promise<SheetWithRelations[]>,

  getById: (familyId: string, sheetId: string) =>
    prisma.sheet.findFirst({
      where: { id: sheetId, familyId },
      include: defaultSheetInclude,
    }) as Promise<SheetWithRelations | null>,

  createForFamily: (familyId: string, ownerId: string, payload: SheetFormValues) =>
    prisma.sheet.create({
      data: {
        ...buildNestedEntries(payload),
        familyId,
        ownerId,
      },
      include: defaultSheetInclude,
    }) as Promise<SheetWithRelations>,

  updateForFamily: async (familyId: string, sheetId: string, payload: SheetFormValues) => {
    const sheet = await prisma.sheet.findFirst({
      where: { id: sheetId, familyId },
      select: { id: true },
    });
    if (!sheet) {
      return null;
    }

    await prisma.$transaction([
      prisma.salary.deleteMany({ where: { sheetId } }),
      prisma.charge.deleteMany({ where: { sheetId } }),
      prisma.budget.deleteMany({ where: { sheetId } }),
      prisma.sheet.update({
        where: { id: sheetId },
        data: buildNestedEntries(payload),
      }),
    ]);

    return prisma.sheet.findFirst({
      where: { id: sheetId, familyId },
      include: defaultSheetInclude,
    }) as Promise<SheetWithRelations | null>;
  },

  deleteForFamily: async (familyId: string, sheetId: string) => {
    const sheet = await prisma.sheet.findFirst({
      where: { id: sheetId, familyId },
      select: { id: true },
    });
    if (!sheet) {
      return false;
    }

    await prisma.$transaction([
      prisma.salary.deleteMany({ where: { sheetId } }),
      prisma.charge.deleteMany({ where: { sheetId } }),
      prisma.budget.deleteMany({ where: { sheetId } }),
      prisma.sheet.delete({ where: { id: sheetId } }),
    ]);

    return true;
  },
};
