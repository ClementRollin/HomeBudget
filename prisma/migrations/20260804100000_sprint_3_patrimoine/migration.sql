-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('PEA', 'ASSURANCE_VIE', 'PER', 'LIVRET', 'SCPI', 'IMMOBILIER', 'CRYPTO', 'AUTRE');

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "encryptedName" TEXT NOT NULL,
    "encryptedCurrentValue" TEXT NOT NULL,
    "encryptedTotalInvested" TEXT NOT NULL,
    "encryptedAnnualFee" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetSnapshot" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "encryptedValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Debt" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "encryptedLabel" TEXT NOT NULL,
    "encryptedBalance" TEXT NOT NULL,
    "encryptedRate" TEXT NOT NULL,
    "encryptedMonthlyPayment" TEXT NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatrimonialGoal" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "encryptedLabel" TEXT NOT NULL,
    "encryptedTarget" TEXT NOT NULL,
    "horizon" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatrimonialGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Asset_familyId_idx" ON "Asset"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "AssetSnapshot_assetId_year_month_key" ON "AssetSnapshot"("assetId", "year", "month");

-- CreateIndex
CREATE INDEX "AssetSnapshot_assetId_idx" ON "AssetSnapshot"("assetId");

-- CreateIndex
CREATE INDEX "Debt_familyId_idx" ON "Debt"("familyId");

-- CreateIndex
CREATE INDEX "PatrimonialGoal_familyId_idx" ON "PatrimonialGoal"("familyId");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetSnapshot" ADD CONSTRAINT "AssetSnapshot_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatrimonialGoal" ADD CONSTRAINT "PatrimonialGoal_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
