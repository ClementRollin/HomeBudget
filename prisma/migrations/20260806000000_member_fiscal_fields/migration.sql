-- CreateEnum
CREATE TYPE "FiscalRole" AS ENUM ('DECLARANT_1', 'DECLARANT_2', 'DEPENDENT_CHILD', 'DEPENDENT_ADULT', 'ASCENDANT');

-- AlterTable FamilyMember — champs fiscaux
ALTER TABLE "FamilyMember"
  ADD COLUMN "birthDate"        DATE,
  ADD COLUMN "fiscalRole"       "FiscalRole" NOT NULL DEFAULT 'DECLARANT_1',
  ADD COLUMN "isAlternateGuard" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN "isDisabled"       BOOLEAN NOT NULL DEFAULT FALSE;
