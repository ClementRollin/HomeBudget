-- Create Invitation table for hashed invitation codes
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" TIMESTAMP,
    "usedAt" TIMESTAMP,
    "usedByUserId" TEXT,
    "createdByUserId" TEXT,
    "attempts" INTEGER DEFAULT 0 NOT NULL,
    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Invitation"
ADD CONSTRAINT "Invitation_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Invitation_familyId_codeHash_key" ON "Invitation"("familyId", "codeHash");
CREATE INDEX "Invitation_familyId_idx" ON "Invitation"("familyId");
