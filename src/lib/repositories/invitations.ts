import type { Prisma, Invitation } from "@prisma/client";

import { prisma } from "@/lib/db";
import { hashInvitationCode } from "@/lib/invitations";

const baseSelect = {
  id: true,
  familyId: true,
  codeHash: true,
  createdAt: true,
  expiresAt: true,
  usedAt: true,
  usedByUserId: true,
  createdByUserId: true,
  family: true,
} satisfies Prisma.InvitationSelect;

const isActiveInvitation = () => ({
  usedAt: null,
  OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
});

export const invitationRepository = {
  async createForFamily({
    familyId,
    rawCode,
    createdByUserId,
    expiresAt,
  }: {
    familyId: string;
    rawCode: string;
    createdByUserId?: string;
    expiresAt?: Date | null;
  }): Promise<Invitation> {
    return prisma.invitation.create({
      data: {
        familyId,
        codeHash: hashInvitationCode(rawCode),
        createdByUserId,
        expiresAt: expiresAt ?? null,
      },
    });
  },

  async revokeActiveForFamily(familyId: string) {
    const now = new Date();
    await prisma.invitation.updateMany({
      where: {
        familyId,
        ...isActiveInvitation(),
      },
      data: {
        expiresAt: now,
      },
    });
  },

  findValidByCode(code: string) {
    return prisma.invitation.findFirst({
      where: {
        codeHash: hashInvitationCode(code),
        ...isActiveInvitation(),
      },
      select: baseSelect,
    });
  },

  markUsed(invitationId: string, userId: string) {
    return prisma.invitation.update({
      where: { id: invitationId },
      data: { usedAt: new Date(), usedByUserId: userId },
    });
  },

  async fulfillInvitation(invitationId: string, userData: Prisma.UserCreateInput) {
    return prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: userData,
      });
      await tx.invitation.update({
        where: { id: invitationId },
        data: { usedAt: new Date(), usedByUserId: createdUser.id },
      });
      return createdUser;
    });
  },

  listActiveForFamily(familyId: string) {
    return prisma.invitation.findMany({
      where: { familyId, ...isActiveInvitation() },
      orderBy: { createdAt: "desc" },
      select: baseSelect,
    });
  },
};
