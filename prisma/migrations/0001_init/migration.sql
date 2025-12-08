-- Migration: init schema for HomeBudget
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "Sheet" (
    "id" TEXT PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "Salary" (
    "id" TEXT PRIMARY KEY,
    "sheetId" TEXT NOT NULL REFERENCES "Sheet"("id") ON DELETE CASCADE,
    "person" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL
);

CREATE TABLE "Charge" (
    "id" TEXT PRIMARY KEY,
    "sheetId" TEXT NOT NULL REFERENCES "Sheet"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "person" TEXT,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL
);

CREATE TABLE "Budget" (
    "id" TEXT PRIMARY KEY,
    "sheetId" TEXT NOT NULL REFERENCES "Sheet"("id") ON DELETE CASCADE,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL
);

CREATE INDEX "Salary_sheetId_idx" ON "Salary"("sheetId");
CREATE INDEX "Charge_sheetId_idx" ON "Charge"("sheetId");
CREATE INDEX "Budget_sheetId_idx" ON "Budget"("sheetId");
