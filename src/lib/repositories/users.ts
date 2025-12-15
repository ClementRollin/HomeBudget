import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

const memberSelect = {
  id: true,
  name: true,
} satisfies Prisma.UserSelect;

export const userRepository = {
  findByIdWithFamily: (userId: string) =>
    prisma.user.findUnique({
      where: { id: userId },
      include: { family: true },
    }),

  findByEmail: (email: string) =>
    prisma.user.findUnique({
      where: { email },
    }),

  createForFamily: (familyId: string, data: { name: string; email: string; password: string }) =>
    prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        familyId,
      },
    }),

  updateProfile: (userId: string, data: Prisma.UserUpdateInput) =>
    prisma.user.update({
      where: { id: userId },
      data,
      include: { family: true },
    }),

  listFamilyMembers: (familyId: string) =>
    prisma.user.findMany({
      where: { familyId },
      select: memberSelect,
      orderBy: { createdAt: "asc" },
    }),
};
