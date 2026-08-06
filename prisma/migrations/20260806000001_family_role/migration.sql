-- CreateEnum
CREATE TYPE "FamilyRole" AS ENUM ('OWNER', 'MEMBER');

-- AlterTable User — rôle dans la famille
ALTER TABLE "User"
  ADD COLUMN "familyRole" "FamilyRole" NOT NULL DEFAULT 'MEMBER';

-- Mettre OWNER pour le premier user créé dans chaque famille
UPDATE "User" u
SET "familyRole" = 'OWNER'
WHERE u.id = (
  SELECT u2.id FROM "User" u2
  WHERE u2."familyId" = u."familyId"
  ORDER BY u2."createdAt" ASC
  LIMIT 1
);
