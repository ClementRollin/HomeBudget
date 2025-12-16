import { prisma } from "@/lib/db";

export const familyRepository = {
  findByInviteCode: (inviteCode: string) =>
    prisma.family.findUnique({
      where: { inviteCode },
    }),

  findBySlug: (slug: string) =>
    prisma.family.findUnique({
      where: { slug },
    }),

  createFamily: (params: { name: string; slug: string; inviteCode: string }) =>
    prisma.family.create({
      data: {
        name: params.name,
        slug: params.slug,
        inviteCode: params.inviteCode,
      },
    }),

  updateInviteCode: (familyId: string, inviteCode: string) =>
    prisma.family.update({
      where: { id: familyId },
      data: { inviteCode },
    }),
};
