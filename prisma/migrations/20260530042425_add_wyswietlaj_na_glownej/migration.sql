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
    "ikonaUrl" TEXT,
    "backgroundImageUrl" TEXT,
    "typ" TEXT NOT NULL DEFAULT 'SPRAWY_PRYWATNE',
    "parentId" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "kolejnosc" INTEGER NOT NULL DEFAULT 0,
    "wyswietlajNaGlownejPrywatne" BOOLEAN NOT NULL DEFAULT false,
    "wyswietlajNaGlownejFirmowe" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("aktywna", "backgroundImageUrl", "createdAt", "id", "ikona", "ikonaUrl", "kolejnosc", "metaDescription", "metaTitle", "nazwa", "opis", "opisDodatkowy", "parentId", "slug", "typ", "updatedAt") SELECT "aktywna", "backgroundImageUrl", "createdAt", "id", "ikona", "ikonaUrl", "kolejnosc", "metaDescription", "metaTitle", "nazwa", "opis", "opisDodatkowy", "parentId", "slug", "typ", "updatedAt" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_slug_idx" ON "Category"("slug");
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
CREATE INDEX "Category_aktywna_idx" ON "Category"("aktywna");
CREATE INDEX "Category_typ_idx" ON "Category"("typ");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Order_externalOrderId_idx" ON "Order"("externalOrderId");
