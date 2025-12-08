-- Migration: add family multi-tenancy
CREATE TABLE "Family" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "inviteCode" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE "User"
ADD COLUMN "familyId" TEXT NOT NULL,
ADD CONSTRAINT "User_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE;

ALTER TABLE "Sheet"
ADD COLUMN "familyId" TEXT NOT NULL,
ADD COLUMN "ownerId" TEXT,
ADD CONSTRAINT "Sheet_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE,
ADD CONSTRAINT "Sheet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL;
