-- CreateTable
CREATE TABLE "PromotionConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pointsPerDay" INTEGER,
    "pointsPerWeek" INTEGER,
    "features" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "kolejnosc" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HelpCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nazwa" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "opis" TEXT,
    "ikona" TEXT,
    "kolejnosc" INTEGER NOT NULL DEFAULT 0,
    "aktywna" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "HelpQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "pytanie" TEXT NOT NULL,
    "odpowiedz" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kolejnosc" INTEGER NOT NULL DEFAULT 0,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "wyswietlenia" INTEGER NOT NULL DEFAULT 0,
    "pomocne" INTEGER NOT NULL DEFAULT 0,
    "niepomocne" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HelpQuestion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "HelpCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "nazwa" TEXT NOT NULL,
    "typDokumentu" TEXT NOT NULL,
    "rozmiar" INTEGER NOT NULL,
    "sciezka" TEXT NOT NULL,
    "rozszerzenie" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Document_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NotificationSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "emailNoweOferty" BOOLEAN NOT NULL DEFAULT true,
    "emailWiadomosci" BOOLEAN NOT NULL DEFAULT true,
    "emailStatusy" BOOLEAN NOT NULL DEFAULT true,
    "smsPilne" BOOLEAN NOT NULL DEFAULT false,
    "kontaktKlienci" BOOLEAN NOT NULL DEFAULT true,
    "kluczowe" BOOLEAN NOT NULL DEFAULT true,
    "wskazowkiPorady" BOOLEAN NOT NULL DEFAULT true,
    "ofertPromocje" BOOLEAN NOT NULL DEFAULT true,
    "przypomnienieWiadomosci" BOOLEAN NOT NULL DEFAULT true,
    "noweFunkcje" BOOLEAN NOT NULL DEFAULT true,
    "zmianyCenniki" BOOLEAN NOT NULL DEFAULT true,
    "zmianyRegulamin" BOOLEAN NOT NULL DEFAULT true,
    "kontaktDoradca" BOOLEAN NOT NULL DEFAULT false,
    "wyswietlanieAwatara" BOOLEAN NOT NULL DEFAULT true,
    "autoProsbOpinie" BOOLEAN NOT NULL DEFAULT false,
    "powiadomienieDzwiekowe" BOOLEAN NOT NULL DEFAULT false,
    "ustawieniaOgloszenia" BOOLEAN NOT NULL DEFAULT true,
    "powiadomieniaSmNowa" BOOLEAN NOT NULL DEFAULT false,
    "wiadomosciZbiorcze" BOOLEAN NOT NULL DEFAULT true,
    "urlop" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_NotificationSettings" ("autoProsbOpinie", "emailNoweOferty", "emailStatusy", "emailWiadomosci", "id", "kluczowe", "kontaktDoradca", "kontaktKlienci", "noweFunkcje", "ofertPromocje", "powiadomienieDzwiekowe", "przypomnienieWiadomosci", "smsPilne", "updatedAt", "userId", "ustawieniaOgloszenia", "wskazowkiPorady", "wyswietlanieAwatara", "zmianyCenniki", "zmianyRegulamin") SELECT "autoProsbOpinie", "emailNoweOferty", "emailStatusy", "emailWiadomosci", "id", "kluczowe", "kontaktDoradca", "kontaktKlienci", "noweFunkcje", "ofertPromocje", "powiadomienieDzwiekowe", "przypomnienieWiadomosci", "smsPilne", "updatedAt", "userId", "ustawieniaOgloszenia", "wskazowkiPorady", "wyswietlanieAwatara", "zmianyCenniki", "zmianyRegulamin" FROM "NotificationSettings";
DROP TABLE "NotificationSettings";
ALTER TABLE "new_NotificationSettings" RENAME TO "NotificationSettings";
CREATE UNIQUE INDEX "NotificationSettings_userId_key" ON "NotificationSettings"("userId");
CREATE INDEX "NotificationSettings_userId_idx" ON "NotificationSettings"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PromotionConfig_type_key" ON "PromotionConfig"("type");

-- CreateIndex
CREATE INDEX "PromotionConfig_type_idx" ON "PromotionConfig"("type");

-- CreateIndex
CREATE INDEX "PromotionConfig_aktywna_idx" ON "PromotionConfig"("aktywna");

-- CreateIndex
CREATE INDEX "PromotionConfig_kolejnosc_idx" ON "PromotionConfig"("kolejnosc");

-- CreateIndex
CREATE UNIQUE INDEX "HelpCategory_slug_key" ON "HelpCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "HelpQuestion_slug_key" ON "HelpQuestion"("slug");

-- CreateIndex
CREATE INDEX "HelpQuestion_categoryId_idx" ON "HelpQuestion"("categoryId");

-- CreateIndex
CREATE INDEX "HelpQuestion_slug_idx" ON "HelpQuestion"("slug");

-- CreateIndex
CREATE INDEX "HelpQuestion_aktywna_idx" ON "HelpQuestion"("aktywna");

-- CreateIndex
CREATE INDEX "HelpQuestion_kolejnosc_idx" ON "HelpQuestion"("kolejnosc");

-- CreateIndex
CREATE INDEX "Document_lawFirmId_idx" ON "Document"("lawFirmId");

-- CreateIndex
CREATE INDEX "Document_createdAt_idx" ON "Document"("createdAt");

-- CreateIndex
CREATE INDEX "Document_typDokumentu_idx" ON "Document"("typDokumentu");
