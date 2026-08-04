-- AlterTable
ALTER TABLE "Charge" ADD COLUMN "debtId" TEXT;

-- CreateIndex
CREATE INDEX "Charge_debtId_idx" ON "Charge"("debtId");

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
