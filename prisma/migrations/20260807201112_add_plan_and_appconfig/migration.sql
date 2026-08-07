-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "maxSheets" INTEGER NOT NULL,
    "maxAssets" INTEGER NOT NULL,
    "maxDebts" INTEGER NOT NULL,
    "maxGoals" INTEGER NOT NULL,
    "priceMonthly" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stripePriceIdMonthly" TEXT,
    "stripePriceIdAnnual" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppConfig" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripePriceIdMonthly_key" ON "Plan"("stripePriceIdMonthly");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripePriceIdAnnual_key" ON "Plan"("stripePriceIdAnnual");
