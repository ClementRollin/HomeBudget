-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('FREE', 'PRO', 'PRO_CANCELED', 'PRO_PAST_DUE');

-- AlterTable Family — champs Stripe
ALTER TABLE "Family"
  ADD COLUMN "stripeCustomerId"     TEXT,
  ADD COLUMN "stripeSubscriptionId" TEXT,
  ADD COLUMN "stripePriceId"        TEXT,
  ADD COLUMN "subscriptionStatus"   "SubscriptionStatus" NOT NULL DEFAULT 'FREE',
  ADD COLUMN "subscriptionEndsAt"   TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Family_stripeCustomerId_key" ON "Family"("stripeCustomerId");
CREATE UNIQUE INDEX "Family_stripeSubscriptionId_key" ON "Family"("stripeSubscriptionId");
