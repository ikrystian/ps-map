/*
  Warnings:

  - You are about to drop the column `kategoriaWpisu` on the `BlogPost` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nazwa" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "opis" TEXT,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "tytul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tresc" TEXT NOT NULL,
    "categoryId" TEXT,
    "tagi" TEXT,
    "obrazekWyrozniajacy" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "opublikowany" BOOLEAN NOT NULL DEFAULT false,
    "dataPublikacji" DATETIME,
    "wyswietlenia" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BlogPost_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BlogPost" ("createdAt", "dataPublikacji", "id", "lawFirmId", "metaDescription", "metaTitle", "obrazekWyrozniajacy", "opublikowany", "slug", "tagi", "tresc", "tytul", "updatedAt", "wyswietlenia") SELECT "createdAt", "dataPublikacji", "id", "lawFirmId", "metaDescription", "metaTitle", "obrazekWyrozniajacy", "opublikowany", "slug", "tagi", "tresc", "tytul", "updatedAt", "wyswietlenia" FROM "BlogPost";
DROP TABLE "BlogPost";
ALTER TABLE "new_BlogPost" RENAME TO "BlogPost";
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
CREATE INDEX "BlogPost_lawFirmId_idx" ON "BlogPost"("lawFirmId");
CREATE INDEX "BlogPost_categoryId_idx" ON "BlogPost"("categoryId");
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");
CREATE INDEX "BlogPost_opublikowany_idx" ON "BlogPost"("opublikowany");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_nazwa_key" ON "BlogCategory"("nazwa");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- CreateIndex
CREATE INDEX "BlogCategory_slug_idx" ON "BlogCategory"("slug");

-- CreateIndex
CREATE INDEX "BlogCategory_aktywna_idx" ON "BlogCategory"("aktywna");
