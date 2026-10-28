-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Voivodeship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nazwa" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "accountManagerId" TEXT,
    CONSTRAINT "Voivodeship_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "AccountManager" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Voivodeship" ("id", "nazwa", "slug") SELECT "id", "nazwa", "slug" FROM "Voivodeship";
DROP TABLE "Voivodeship";
ALTER TABLE "new_Voivodeship" RENAME TO "Voivodeship";
CREATE UNIQUE INDEX "Voivodeship_nazwa_key" ON "Voivodeship"("nazwa");
CREATE UNIQUE INDEX "Voivodeship_slug_key" ON "Voivodeship"("slug");
CREATE INDEX "Voivodeship_slug_idx" ON "Voivodeship"("slug");
CREATE INDEX "Voivodeship_accountManagerId_idx" ON "Voivodeship"("accountManagerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
