-- Add category fields for salaries and charges
ALTER TABLE "Salary" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'Salaire';
ALTER TABLE "Charge" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'Autres';

-- Backfill existing charges into initial categories
UPDATE "Charge"
SET "category" = CASE
  WHEN "type" IN ('FIXE_COMMUN', 'FIXE_INDIVIDUEL') THEN 'Fixes'
  WHEN "type" IN ('EXCEPTIONNEL_COMMUN', 'EXCEPTIONNEL_INDIVIDUEL') THEN 'Exceptionnelles'
  ELSE 'Autres'
END;
