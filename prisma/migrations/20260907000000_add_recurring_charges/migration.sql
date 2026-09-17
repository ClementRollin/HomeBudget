-- CreateTable RecurringCharge
CREATE TABLE "RecurringCharge" (
    "id"              TEXT NOT NULL,
    "familyId"        TEXT NOT NULL,
    "category"        "ChargeCategory" NOT NULL DEFAULT 'FIXE_COMMUN',
    "memberId"        TEXT,
    "encryptedLabel"  TEXT NOT NULL,
    "encryptedAmount" TEXT NOT NULL,
    "isActive"        BOOLEAN NOT NULL DEFAULT true,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringCharge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RecurringCharge" ADD CONSTRAINT "RecurringCharge_familyId_fkey"
    FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringCharge" ADD CONSTRAINT "RecurringCharge_memberId_fkey"
    FOREIGN KEY ("memberId") REFERENCES "FamilyMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "RecurringCharge_familyId_idx" ON "RecurringCharge"("familyId");
