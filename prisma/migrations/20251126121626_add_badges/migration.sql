-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "conditionType" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LawFirmBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LawFirmBadge_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LawFirmBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Badge_conditionType_idx" ON "Badge"("conditionType");

-- CreateIndex
CREATE INDEX "LawFirmBadge_lawFirmId_idx" ON "LawFirmBadge"("lawFirmId");

-- CreateIndex
CREATE INDEX "LawFirmBadge_badgeId_idx" ON "LawFirmBadge"("badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "LawFirmBadge_lawFirmId_badgeId_key" ON "LawFirmBadge"("lawFirmId", "badgeId");
