-- AlterTable
ALTER TABLE "Category" ADD COLUMN "ikonaUrl" TEXT;

-- CreateTable
CREATE TABLE "PartnerProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "bannerCode" TEXT NOT NULL,
    "bannerPlaced" BOOLEAN NOT NULL DEFAULT false,
    "lastVerificationDate" DATETIME,
    "lastVerificationStatus" BOOLEAN NOT NULL DEFAULT false,
    "verificationFailCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "monthlyPoints" INTEGER NOT NULL DEFAULT 100,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PartnerProgram_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PartnerPointsHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerProgramId" TEXT NOT NULL,
    "pointsAwarded" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "verificationUrl" TEXT,
    "verificationStatus" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PartnerPointsHistory_partnerProgramId_fkey" FOREIGN KEY ("partnerProgramId") REFERENCES "PartnerProgram" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerProgram_lawFirmId_key" ON "PartnerProgram"("lawFirmId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerProgram_bannerCode_key" ON "PartnerProgram"("bannerCode");

-- CreateIndex
CREATE INDEX "PartnerProgram_lawFirmId_idx" ON "PartnerProgram"("lawFirmId");

-- CreateIndex
CREATE INDEX "PartnerProgram_active_idx" ON "PartnerProgram"("active");

-- CreateIndex
CREATE INDEX "PartnerProgram_bannerCode_idx" ON "PartnerProgram"("bannerCode");

-- CreateIndex
CREATE INDEX "PartnerPointsHistory_partnerProgramId_idx" ON "PartnerPointsHistory"("partnerProgramId");

-- CreateIndex
CREATE INDEX "PartnerPointsHistory_year_month_idx" ON "PartnerPointsHistory"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerPointsHistory_partnerProgramId_year_month_key" ON "PartnerPointsHistory"("partnerProgramId", "year", "month");
