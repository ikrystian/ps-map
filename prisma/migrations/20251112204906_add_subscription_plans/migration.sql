-- CreateTable
CREATE TABLE "SubscriptionPlan" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_typ_key" ON "SubscriptionPlan"("typ");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_typ_idx" ON "SubscriptionPlan"("typ");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_aktywny_idx" ON "SubscriptionPlan"("aktywny");
