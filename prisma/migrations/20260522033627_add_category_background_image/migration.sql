-- AlterTable
ALTER TABLE "Category" ADD COLUMN "backgroundImageUrl" TEXT;

-- CreateTable
CREATE TABLE "LawFirmCity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LawFirmCity_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LawFirmCity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HelpCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nazwa" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "opis" TEXT,
    "ikona" TEXT,
    "kolejnosc" INTEGER NOT NULL DEFAULT 0,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "odbiorca" TEXT NOT NULL DEFAULT 'ALL'
);
INSERT INTO "new_HelpCategory" ("aktywna", "id", "ikona", "kolejnosc", "nazwa", "opis", "slug") SELECT "aktywna", "id", "ikona", "kolejnosc", "nazwa", "opis", "slug" FROM "HelpCategory";
DROP TABLE "HelpCategory";
ALTER TABLE "new_HelpCategory" RENAME TO "HelpCategory";
CREATE UNIQUE INDEX "HelpCategory_slug_key" ON "HelpCategory"("slug");
CREATE TABLE "new_Newsletter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "imie" TEXT,
    "zgoda" BOOLEAN NOT NULL DEFAULT true,
    "aktywny" BOOLEAN NOT NULL DEFAULT true,
    "potwierdzony" BOOLEAN NOT NULL DEFAULT false,
    "tokenPotwierdzajacy" TEXT,
    "dataPotwierdzenia" DATETIME,
    "dataZapisu" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataRezygnacji" DATETIME
);
INSERT INTO "new_Newsletter" ("aktywny", "dataRezygnacji", "dataZapisu", "email", "id", "imie", "zgoda") SELECT "aktywny", "dataRezygnacji", "dataZapisu", "email", "id", "imie", "zgoda" FROM "Newsletter";
DROP TABLE "Newsletter";
ALTER TABLE "new_Newsletter" RENAME TO "Newsletter";
CREATE UNIQUE INDEX "Newsletter_email_key" ON "Newsletter"("email");
CREATE UNIQUE INDEX "Newsletter_tokenPotwierdzajacy_key" ON "Newsletter"("tokenPotwierdzajacy");
CREATE INDEX "Newsletter_email_idx" ON "Newsletter"("email");
CREATE INDEX "Newsletter_aktywny_idx" ON "Newsletter"("aktywny");
CREATE TABLE "new_NotificationSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "isConfigured" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_NotificationSettings" ("autoProsbOpinie", "emailNoweOferty", "emailStatusy", "emailWiadomosci", "id", "kluczowe", "kontaktDoradca", "kontaktKlienci", "noweFunkcje", "ofertPromocje", "powiadomieniaSmNowa", "powiadomienieDzwiekowe", "przypomnienieWiadomosci", "smsPilne", "updatedAt", "urlop", "userId", "ustawieniaOgloszenia", "wiadomosciZbiorcze", "wskazowkiPorady", "wyswietlanieAwatara", "zmianyCenniki", "zmianyRegulamin") SELECT "autoProsbOpinie", "emailNoweOferty", "emailStatusy", "emailWiadomosci", "id", "kluczowe", "kontaktDoradca", "kontaktKlienci", "noweFunkcje", "ofertPromocje", "powiadomieniaSmNowa", "powiadomienieDzwiekowe", "przypomnienieWiadomosci", "smsPilne", "updatedAt", "urlop", "userId", "ustawieniaOgloszenia", "wiadomosciZbiorcze", "wskazowkiPorady", "wyswietlanieAwatara", "zmianyCenniki", "zmianyRegulamin" FROM "NotificationSettings";
DROP TABLE "NotificationSettings";
ALTER TABLE "new_NotificationSettings" RENAME TO "NotificationSettings";
CREATE UNIQUE INDEX "NotificationSettings_userId_key" ON "NotificationSettings"("userId");
CREATE INDEX "NotificationSettings_userId_idx" ON "NotificationSettings"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "LawFirmCity_lawFirmId_idx" ON "LawFirmCity"("lawFirmId");

-- CreateIndex
CREATE INDEX "LawFirmCity_cityId_idx" ON "LawFirmCity"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "LawFirmCity_lawFirmId_cityId_key" ON "LawFirmCity"("lawFirmId", "cityId");
