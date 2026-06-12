-- CreateTable
CREATE TABLE "ReviewReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReviewReport_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReviewReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "typSprawy" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "wybranadziedzinaPrawa" TEXT,
    "wybranaSpecyfikacja" TEXT,
    "specjalizacja" TEXT,
    "nazwaSprawy" TEXT NOT NULL,
    "opisSprawy" TEXT NOT NULL,
    "zalaczniki" TEXT,
    "oczekiwanyTerminRealizacji" DATETIME,
    "trybPilny" BOOLEAN NOT NULL DEFAULT false,
    "budzetOd" REAL,
    "budzetDo" REAL,
    "doNegocjacji" BOOLEAN NOT NULL DEFAULT false,
    "imieNazwisko" TEXT NOT NULL,
    "telefonKontakt" TEXT NOT NULL,
    "preferowanyKontakt" TEXT NOT NULL,
    "voivodeshipId" TEXT NOT NULL,
    "cityId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOWA',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" DATETIME,
    "akceptujeKlauzule" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "zamknieto" DATETIME,
    CONSTRAINT "Case_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Case_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Case_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Case_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Case" ("akceptujeKlauzule", "archivedAt", "budzetDo", "budzetOd", "categoryId", "clientId", "createdAt", "doNegocjacji", "id", "imieNazwisko", "isArchived", "nazwaSprawy", "oczekiwanyTerminRealizacji", "opisSprawy", "preferowanyKontakt", "specjalizacja", "status", "telefonKontakt", "trybPilny", "typSprawy", "updatedAt", "voivodeshipId", "wybranaSpecyfikacja", "wybranadziedzinaPrawa", "zalaczniki", "zamknieto") SELECT "akceptujeKlauzule", "archivedAt", "budzetDo", "budzetOd", "categoryId", "clientId", "createdAt", "doNegocjacji", "id", "imieNazwisko", "isArchived", "nazwaSprawy", "oczekiwanyTerminRealizacji", "opisSprawy", "preferowanyKontakt", "specjalizacja", "status", "telefonKontakt", "trybPilny", "typSprawy", "updatedAt", "voivodeshipId", "wybranaSpecyfikacja", "wybranadziedzinaPrawa", "zalaczniki", "zamknieto" FROM "Case";
DROP TABLE "Case";
ALTER TABLE "new_Case" RENAME TO "Case";
CREATE INDEX "Case_clientId_idx" ON "Case"("clientId");
CREATE INDEX "Case_categoryId_idx" ON "Case"("categoryId");
CREATE INDEX "Case_voivodeshipId_idx" ON "Case"("voivodeshipId");
CREATE INDEX "Case_cityId_idx" ON "Case"("cityId");
CREATE INDEX "Case_status_idx" ON "Case"("status");
CREATE INDEX "Case_isArchived_idx" ON "Case"("isArchived");
CREATE INDEX "Case_createdAt_idx" ON "Case"("createdAt");
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "clientType" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "imie" TEXT NOT NULL,
    "nazwisko" TEXT NOT NULL,
    "telefon" TEXT,
    "nazwaFirmy" TEXT,
    "nip" TEXT,
    "regon" TEXT,
    "krs" TEXT,
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
INSERT INTO "new_Client" ("adres", "createdAt", "id", "imie", "kodPocztowy", "miasto", "nazwisko", "punktySaldo", "telefon", "updatedAt", "userId", "voivodeshipId", "zgodaMarketing", "zgodaNewsletter", "zgodaRegulamin") SELECT "adres", "createdAt", "id", "imie", "kodPocztowy", "miasto", "nazwisko", "punktySaldo", "telefon", "updatedAt", "userId", "voivodeshipId", "zgodaMarketing", "zgodaNewsletter", "zgodaRegulamin" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");
CREATE INDEX "Client_userId_idx" ON "Client"("userId");
CREATE INDEX "Client_voivodeshipId_idx" ON "Client"("voivodeshipId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ReviewReport_reviewId_idx" ON "ReviewReport"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewReport_userId_idx" ON "ReviewReport"("userId");
