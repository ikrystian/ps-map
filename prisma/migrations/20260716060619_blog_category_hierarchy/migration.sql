-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BlogCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nazwa" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "opis" TEXT,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BlogCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BlogCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BlogCategory" ("aktywna", "createdAt", "id", "nazwa", "opis", "slug", "updatedAt") SELECT "aktywna", "createdAt", "id", "nazwa", "opis", "slug", "updatedAt" FROM "BlogCategory";
DROP TABLE "BlogCategory";
ALTER TABLE "new_BlogCategory" RENAME TO "BlogCategory";
CREATE UNIQUE INDEX "BlogCategory_nazwa_key" ON "BlogCategory"("nazwa");
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");
CREATE INDEX "BlogCategory_slug_idx" ON "BlogCategory"("slug");
CREATE INDEX "BlogCategory_aktywna_idx" ON "BlogCategory"("aktywna");
CREATE INDEX "BlogCategory_parentId_idx" ON "BlogCategory"("parentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
