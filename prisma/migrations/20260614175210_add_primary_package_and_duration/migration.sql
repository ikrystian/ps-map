-- AlterTable
ALTER TABLE "LawFirm" ADD COLUMN "packageDurationDays" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SubscriptionPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "typ" TEXT NOT NULL,
    "nazwa" TEXT NOT NULL,
    "cena1Miesiac" REAL,
    "cena6Miesiecy" REAL,
    "cena12Miesiecy" REAL NOT NULL,
    "aktywny" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_SubscriptionPlan" ("aktywny", "artykutySponsoro", "cena12Miesiecy", "cena1Miesiac", "cena6Miesiecy", "coverBaner", "createdAt", "dostepDoSpraw", "id", "kategorieSpraw", "liczbaTakow", "miasta", "mozliwoscBloga", "nazwa", "obrazek", "osobistyOpiekun", "powiadomieniaSprawy", "powiaty", "priorytetWyszukiwanie", "promowanieProfilu", "punktyGratis", "skillLawFocus", "specjalneOznaczenie", "statystykiAnalizy", "typ", "updatedAt", "wojewodztwa", "wsparcieMarketingowe", "wyswietlanieReklam", "zalaczniki") SELECT "aktywny", "artykutySponsoro", "cena12Miesiecy", "cena1Miesiac", "cena6Miesiecy", "coverBaner", "createdAt", "dostepDoSpraw", "id", "kategorieSpraw", "liczbaTakow", "miasta", "mozliwoscBloga", "nazwa", "obrazek", "osobistyOpiekun", "powiadomieniaSprawy", "powiaty", "priorytetWyszukiwanie", "promowanieProfilu", "punktyGratis", "skillLawFocus", "specjalneOznaczenie", "statystykiAnalizy", "typ", "updatedAt", "wojewodztwa", "wsparcieMarketingowe", "wyswietlanieReklam", "zalaczniki" FROM "SubscriptionPlan";
DROP TABLE "SubscriptionPlan";
ALTER TABLE "new_SubscriptionPlan" RENAME TO "SubscriptionPlan";
CREATE UNIQUE INDEX "SubscriptionPlan_typ_key" ON "SubscriptionPlan"("typ");
CREATE INDEX "SubscriptionPlan_typ_idx" ON "SubscriptionPlan"("typ");
CREATE INDEX "SubscriptionPlan_aktywny_idx" ON "SubscriptionPlan"("aktywny");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
