-- CreateTable
CREATE TABLE "AdClient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Advertisement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "linkUrl" TEXT NOT NULL,
    "htmlContent" TEXT,
    "location" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "clientId" TEXT,
    CONSTRAINT "Advertisement_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "AdClient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Advertisement" ("active", "clicks", "createdAt", "endDate", "htmlContent", "id", "imageUrl", "impressions", "linkUrl", "location", "name", "startDate", "updatedAt") SELECT "active", "clicks", "createdAt", "endDate", "htmlContent", "id", "imageUrl", "impressions", "linkUrl", "location", "name", "startDate", "updatedAt" FROM "Advertisement";
DROP TABLE "Advertisement";
ALTER TABLE "new_Advertisement" RENAME TO "Advertisement";
CREATE INDEX "Advertisement_location_idx" ON "Advertisement"("location");
CREATE INDEX "Advertisement_active_idx" ON "Advertisement"("active");
CREATE INDEX "Advertisement_clientId_idx" ON "Advertisement"("clientId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "AdClient_active_idx" ON "AdClient"("active");
