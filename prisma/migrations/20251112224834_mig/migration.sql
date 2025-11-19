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
    "emailKontakt" TEXT NOT NULL,
    "telefonKontakt" TEXT NOT NULL,
    "preferowanyKontakt" TEXT NOT NULL,
    "voivodeshipId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOWA',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" DATETIME,
    "akceptujeKlauzule" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "zamknieto" DATETIME,
    CONSTRAINT "Case_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Case_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Case_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Case" ("akceptujeKlauzule", "budzetDo", "budzetOd", "categoryId", "clientId", "createdAt", "doNegocjacji", "emailKontakt", "id", "imieNazwisko", "nazwaSprawy", "oczekiwanyTerminRealizacji", "opisSprawy", "preferowanyKontakt", "specjalizacja", "status", "telefonKontakt", "trybPilny", "typSprawy", "updatedAt", "voivodeshipId", "wybranaSpecyfikacja", "wybranadziedzinaPrawa", "zalaczniki", "zamknieto") SELECT "akceptujeKlauzule", "budzetDo", "budzetOd", "categoryId", "clientId", "createdAt", "doNegocjacji", "emailKontakt", "id", "imieNazwisko", "nazwaSprawy", "oczekiwanyTerminRealizacji", "opisSprawy", "preferowanyKontakt", "specjalizacja", "status", "telefonKontakt", "trybPilny", "typSprawy", "updatedAt", "voivodeshipId", "wybranaSpecyfikacja", "wybranadziedzinaPrawa", "zalaczniki", "zamknieto" FROM "Case";
DROP TABLE "Case";
ALTER TABLE "new_Case" RENAME TO "Case";
CREATE INDEX "Case_clientId_idx" ON "Case"("clientId");
CREATE INDEX "Case_categoryId_idx" ON "Case"("categoryId");
CREATE INDEX "Case_voivodeshipId_idx" ON "Case"("voivodeshipId");
CREATE INDEX "Case_status_idx" ON "Case"("status");
CREATE INDEX "Case_isArchived_idx" ON "Case"("isArchived");
CREATE INDEX "Case_createdAt_idx" ON "Case"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
