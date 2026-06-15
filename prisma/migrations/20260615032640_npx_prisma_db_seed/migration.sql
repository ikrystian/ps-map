-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LawFirmCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "kolejnosc" INTEGER NOT NULL DEFAULT 0,
    "percentage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LawFirmCategory_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LawFirmCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LawFirmCategory" ("categoryId", "createdAt", "id", "kolejnosc", "lawFirmId") SELECT "categoryId", "createdAt", "id", "kolejnosc", "lawFirmId" FROM "LawFirmCategory";
DROP TABLE "LawFirmCategory";
ALTER TABLE "new_LawFirmCategory" RENAME TO "LawFirmCategory";
CREATE INDEX "LawFirmCategory_lawFirmId_idx" ON "LawFirmCategory"("lawFirmId");
CREATE INDEX "LawFirmCategory_categoryId_idx" ON "LawFirmCategory"("categoryId");
CREATE UNIQUE INDEX "LawFirmCategory_lawFirmId_categoryId_key" ON "LawFirmCategory"("lawFirmId", "categoryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
