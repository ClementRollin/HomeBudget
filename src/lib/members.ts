import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const getFamilyMembers = async (familyId: string) => {
  return prisma.familyMember.findMany({
    where: { familyId },
    orderBy: { createdAt: "asc" },
  });
};

export const ensureMemberForUser = async (
  userId: string,
  familyId: string,
  displayName: string,
) => {
  const existing = await prisma.familyMember.findFirst({
    where: { userId },
  });
  if (existing) {
    return existing;
  }
  return prisma.familyMember.create({
    data: {
      userId,
      familyId,
      displayName,
      slug: await generateUniqueMemberSlug(familyId, displayName),
    },
  });
};

export const findOrCreateMember = async (familyId: string, displayName: string) => {
  const slug = slugify(displayName);
  let member = await prisma.familyMember.findFirst({
    where: { familyId, slug },
  });
  if (member) {
    return member;
  }
  member = await prisma.familyMember.create({
    data: {
      familyId,
      displayName,
      slug: await generateUniqueMemberSlug(familyId, displayName),
    },
  });
  return member;
};

const generateUniqueMemberSlug = async (familyId: string, displayName: string) => {
  const baseSlug = slugify(displayName);
  let slug = baseSlug;
  let suffix = 1;
  while (
    await prisma.familyMember.findFirst({
      where: { familyId, slug },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${suffix++}`;
  }
  return slug;
};
