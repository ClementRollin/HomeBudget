-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_sheetId_fkey";

-- DropForeignKey
ALTER TABLE "Charge" DROP CONSTRAINT "Charge_sheetId_fkey";

-- DropForeignKey
ALTER TABLE "Salary" DROP CONSTRAINT "Salary_sheetId_fkey";

-- DropIndex
DROP INDEX "Budget_sheetId_idx";

-- DropIndex
DROP INDEX "Charge_sheetId_idx";

-- DropIndex
DROP INDEX "Salary_sheetId_idx";

-- AlterTable
ALTER TABLE "Sheet" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Salary" ADD CONSTRAINT "Salary_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "Sheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "Sheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "Sheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
