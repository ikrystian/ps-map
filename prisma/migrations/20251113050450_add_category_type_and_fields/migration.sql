-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nazwa" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "opis" TEXT,
    "opisDodatkowy" TEXT,
    "ikona" TEXT,
    "typ" TEXT NOT NULL DEFAULT 'SPRAWY_PRYWATNE',
    "parentId" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "kolejnosc" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("aktywna", "createdAt", "id", "kolejnosc", "metaDescription", "metaTitle", "nazwa", "opis", "parentId", "slug", "updatedAt") SELECT "aktywna", "createdAt", "id", "kolejnosc", "metaDescription", "metaTitle", "nazwa", "opis", "parentId", "slug", "updatedAt" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_slug_idx" ON "Category"("slug");
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
CREATE INDEX "Category_aktywna_idx" ON "Category"("aktywna");
CREATE INDEX "Category_typ_idx" ON "Category"("typ");
CREATE TABLE "new_LawFirmCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "kolejnosc" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LawFirmCategory_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LawFirmCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LawFirmCategory" ("categoryId", "createdAt", "id", "lawFirmId") SELECT "categoryId", "createdAt", "id", "lawFirmId" FROM "LawFirmCategory";
DROP TABLE "LawFirmCategory";
ALTER TABLE "new_LawFirmCategory" RENAME TO "LawFirmCategory";
CREATE INDEX "LawFirmCategory_lawFirmId_idx" ON "LawFirmCategory"("lawFirmId");
CREATE INDEX "LawFirmCategory_categoryId_idx" ON "LawFirmCategory"("categoryId");
CREATE UNIQUE INDEX "LawFirmCategory_lawFirmId_categoryId_key" ON "LawFirmCategory"("lawFirmId", "categoryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
