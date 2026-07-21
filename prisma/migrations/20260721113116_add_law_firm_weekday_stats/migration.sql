-- CreateTable
CREATE TABLE "LawFirmWeekdayStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LawFirmWeekdayStats_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "LawFirmWeekdayStats_lawFirmId_idx" ON "LawFirmWeekdayStats"("lawFirmId");

-- CreateIndex
CREATE UNIQUE INDEX "LawFirmWeekdayStats_lawFirmId_dayOfWeek_key" ON "LawFirmWeekdayStats"("lawFirmId", "dayOfWeek");
