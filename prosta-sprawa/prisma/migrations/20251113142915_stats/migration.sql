-- CreateTable
CREATE TABLE "LawFirmStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "offersSubmitted" INTEGER NOT NULL DEFAULT 0,
    "offersAccepted" INTEGER NOT NULL DEFAULT 0,
    "offersRejected" INTEGER NOT NULL DEFAULT 0,
    "casesViewed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LawFirmStats_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LawFirmCategoryStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "offersSubmitted" INTEGER NOT NULL DEFAULT 0,
    "offersAccepted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LawFirmCategoryStats_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LawFirmCategoryStats_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoginHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "LawFirmStats_lawFirmId_idx" ON "LawFirmStats"("lawFirmId");

-- CreateIndex
CREATE INDEX "LawFirmStats_year_month_idx" ON "LawFirmStats"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "LawFirmStats_lawFirmId_year_month_key" ON "LawFirmStats"("lawFirmId", "year", "month");

-- CreateIndex
CREATE INDEX "LawFirmCategoryStats_lawFirmId_idx" ON "LawFirmCategoryStats"("lawFirmId");

-- CreateIndex
CREATE INDEX "LawFirmCategoryStats_categoryId_idx" ON "LawFirmCategoryStats"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "LawFirmCategoryStats_lawFirmId_categoryId_key" ON "LawFirmCategoryStats"("lawFirmId", "categoryId");

-- CreateIndex
CREATE INDEX "LoginHistory_userId_idx" ON "LoginHistory"("userId");

-- CreateIndex
CREATE INDEX "LoginHistory_createdAt_idx" ON "LoginHistory"("createdAt");

-- CreateIndex
CREATE INDEX "LoginHistory_success_idx" ON "LoginHistory"("success");
