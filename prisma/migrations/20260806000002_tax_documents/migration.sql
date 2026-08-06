-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('DECLARATION_2042', 'AVIS_IMPOSITION');

-- CreateEnum
CREATE TYPE "ExtractionStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');

-- AlterTable FiscalConfig — revenus hors fiches
ALTER TABLE "FiscalConfig"
  ADD COLUMN "encryptedDividends"    TEXT NOT NULL DEFAULT '',
  ADD COLUMN "encryptedCapitalGains" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "encryptedRentalIncome" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "taxYear"               INTEGER NOT NULL DEFAULT 2024;

-- CreateTable TaxDocument
CREATE TABLE "TaxDocument" (
  "id"                      TEXT NOT NULL,
  "familyId"                TEXT NOT NULL,
  "taxYear"                 INTEGER NOT NULL,
  "documentType"            "DocumentType" NOT NULL DEFAULT 'DECLARATION_2042',
  "blobUrl"                 TEXT NOT NULL,
  "blobKey"                 TEXT NOT NULL,
  "extractionStatus"        "ExtractionStatus" NOT NULL DEFAULT 'PENDING',
  "encryptedExtractedCases" TEXT NOT NULL DEFAULT '',
  "extractionConfidence"    DOUBLE PRECISION,
  "validatedAt"             TIMESTAMP(3),
  "createdAt"               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TaxDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaxDocument_familyId_taxYear_idx" ON "TaxDocument"("familyId", "taxYear");

-- AddForeignKey
ALTER TABLE "TaxDocument" ADD CONSTRAINT "TaxDocument_familyId_fkey"
  FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
