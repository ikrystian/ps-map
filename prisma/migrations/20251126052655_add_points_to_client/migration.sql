-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "imie" TEXT NOT NULL,
    "nazwisko" TEXT NOT NULL,
    "telefon" TEXT,
    "adres" TEXT,
    "kodPocztowy" TEXT,
    "miasto" TEXT,
    "voivodeshipId" TEXT,
    "zgodaRegulamin" BOOLEAN NOT NULL DEFAULT false,
    "zgodaNewsletter" BOOLEAN NOT NULL DEFAULT false,
    "zgodaMarketing" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "punktySaldo" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Client_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Client" ("adres", "createdAt", "id", "imie", "kodPocztowy", "miasto", "nazwisko", "telefon", "updatedAt", "userId", "voivodeshipId", "zgodaMarketing", "zgodaNewsletter", "zgodaRegulamin") SELECT "adres", "createdAt", "id", "imie", "kodPocztowy", "miasto", "nazwisko", "telefon", "updatedAt", "userId", "voivodeshipId", "zgodaMarketing", "zgodaNewsletter", "zgodaRegulamin" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");
CREATE INDEX "Client_userId_idx" ON "Client"("userId");
CREATE INDEX "Client_voivodeshipId_idx" ON "Client"("voivodeshipId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
