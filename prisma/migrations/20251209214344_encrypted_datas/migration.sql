/*
  Warnings:

  - You are about to drop the column `amount` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `Charge` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `Charge` table. All the data in the column will be lost.
  - You are about to drop the column `person` on the `Charge` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Charge` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `Salary` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `Salary` table. All the data in the column will be lost.
  - You are about to drop the column `person` on the `Salary` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ChargeCategory" AS ENUM ('FIXE_COMMUN', 'FIXE_INDIVIDUEL', 'EXCEPTIONNEL_COMMUN', 'EXCEPTIONNEL_INDIVIDUEL');

-- DropForeignKey
ALTER TABLE "Sheet" DROP CONSTRAINT "Sheet_familyId_fkey";

-- DropForeignKey
ALTER TABLE "Sheet" DROP CONSTRAINT "Sheet_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_familyId_fkey";

-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "amount",
DROP COLUMN "label",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "encryptedAmount" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "encryptedLabel" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Charge" DROP COLUMN "amount",
DROP COLUMN "label",
DROP COLUMN "person",
DROP COLUMN "type",
ADD COLUMN     "category" "ChargeCategory" NOT NULL DEFAULT 'FIXE_COMMUN',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "encryptedAmount" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "encryptedLabel" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "memberId" TEXT;

-- AlterTable
ALTER TABLE "Family" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Salary" DROP COLUMN "amount",
DROP COLUMN "label",
DROP COLUMN "person",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "encryptedAmount" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "encryptedLabel" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "memberId" TEXT;

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "userId" TEXT,
    "displayName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMember_userId_key" ON "FamilyMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMember_familyId_slug_key" ON "FamilyMember"("familyId", "slug");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sheet" ADD CONSTRAINT "Sheet_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sheet" ADD CONSTRAINT "Sheet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salary" ADD CONSTRAINT "Salary_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "FamilyMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "FamilyMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
