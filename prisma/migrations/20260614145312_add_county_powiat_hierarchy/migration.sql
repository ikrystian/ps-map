-- CreateTable
CREATE TABLE "LawFirmCounty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "countyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LawFirmCounty_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LawFirmCounty_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "County" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nazwa" TEXT NOT NULL,
    "slug" TEXT,
    "voivodeshipId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "County_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_City" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nazwa" TEXT NOT NULL,
    "voivodeshipId" TEXT NOT NULL,
    "countyId" TEXT,
    CONSTRAINT "City_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "City_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_City" ("id", "nazwa", "voivodeshipId") SELECT "id", "nazwa", "voivodeshipId" FROM "City";
DROP TABLE "City";
ALTER TABLE "new_City" RENAME TO "City";
CREATE INDEX "City_voivodeshipId_idx" ON "City"("voivodeshipId");
CREATE INDEX "City_countyId_idx" ON "City"("countyId");
CREATE INDEX "City_nazwa_idx" ON "City"("nazwa");
CREATE TABLE "new_SubscriptionPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "typ" TEXT NOT NULL,
    "nazwa" TEXT NOT NULL,
    "cena1Miesiac" REAL,
    "cena6Miesiecy" REAL,
    "cena12Miesiecy" REAL NOT NULL,
    "aktywny" BOOLEAN NOT NULL DEFAULT true,
    "dostepDoSpraw" INTEGER,
    "kategorieSpraw" INTEGER,
    "wojewodztwa" INTEGER NOT NULL,
    "powiaty" INTEGER NOT NULL DEFAULT 1,
    "miasta" INTEGER NOT NULL,
    "priorytetWyszukiwanie" BOOLEAN NOT NULL DEFAULT false,
    "osobistyOpiekun" INTEGER NOT NULL DEFAULT 0,
    "artykutySponsoro" BOOLEAN NOT NULL DEFAULT false,
    "specjalneOznaczenie" TEXT,
    "statystykiAnalizy" BOOLEAN NOT NULL DEFAULT false,
    "mozliwoscBloga" BOOLEAN NOT NULL DEFAULT false,
    "wsparcieMarketingowe" BOOLEAN NOT NULL DEFAULT false,
    "promowanieProfilu" BOOLEAN NOT NULL DEFAULT false,
    "powiadomieniaSprawy" INTEGER NOT NULL DEFAULT 0,
    "liczbaTakow" INTEGER NOT NULL DEFAULT 0,
    "zalaczniki" BOOLEAN NOT NULL DEFAULT false,
    "coverBaner" BOOLEAN NOT NULL DEFAULT false,
    "wyswietlanieReklam" BOOLEAN NOT NULL DEFAULT true,
    "punktyGratis" INTEGER NOT NULL DEFAULT 0,
    "skillLawFocus" BOOLEAN NOT NULL DEFAULT false,
    "obrazek" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SubscriptionPlan" ("aktywny", "artykutySponsoro", "cena12Miesiecy", "cena1Miesiac", "cena6Miesiecy", "coverBaner", "createdAt", "dostepDoSpraw", "id", "kategorieSpraw", "liczbaTakow", "miasta", "mozliwoscBloga", "nazwa", "obrazek", "osobistyOpiekun", "powiadomieniaSprawy", "priorytetWyszukiwanie", "promowanieProfilu", "punktyGratis", "skillLawFocus", "specjalneOznaczenie", "statystykiAnalizy", "typ", "updatedAt", "wojewodztwa", "wsparcieMarketingowe", "wyswietlanieReklam", "zalaczniki") SELECT "aktywny", "artykutySponsoro", "cena12Miesiecy", "cena1Miesiac", "cena6Miesiecy", "coverBaner", "createdAt", "dostepDoSpraw", "id", "kategorieSpraw", "liczbaTakow", "miasta", "mozliwoscBloga", "nazwa", "obrazek", "osobistyOpiekun", "powiadomieniaSprawy", "priorytetWyszukiwanie", "promowanieProfilu", "punktyGratis", "skillLawFocus", "specjalneOznaczenie", "statystykiAnalizy", "typ", "updatedAt", "wojewodztwa", "wsparcieMarketingowe", "wyswietlanieReklam", "zalaczniki" FROM "SubscriptionPlan";
DROP TABLE "SubscriptionPlan";
ALTER TABLE "new_SubscriptionPlan" RENAME TO "SubscriptionPlan";
CREATE UNIQUE INDEX "SubscriptionPlan_typ_key" ON "SubscriptionPlan"("typ");
CREATE INDEX "SubscriptionPlan_typ_idx" ON "SubscriptionPlan"("typ");
CREATE INDEX "SubscriptionPlan_aktywny_idx" ON "SubscriptionPlan"("aktywny");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "LawFirmCounty_lawFirmId_idx" ON "LawFirmCounty"("lawFirmId");

-- CreateIndex
CREATE INDEX "LawFirmCounty_countyId_idx" ON "LawFirmCounty"("countyId");

-- CreateIndex
CREATE UNIQUE INDEX "LawFirmCounty_lawFirmId_countyId_key" ON "LawFirmCounty"("lawFirmId", "countyId");

-- CreateIndex
CREATE INDEX "County_voivodeshipId_idx" ON "County"("voivodeshipId");

-- CreateIndex
CREATE INDEX "County_nazwa_idx" ON "County"("nazwa");

-- CreateIndex
CREATE UNIQUE INDEX "County_nazwa_voivodeshipId_key" ON "County"("nazwa", "voivodeshipId");
