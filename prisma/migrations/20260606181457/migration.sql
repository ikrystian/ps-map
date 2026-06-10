-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT,
    "isSponsored" BOOLEAN NOT NULL DEFAULT false,
    "sponsoredLawFirmId" TEXT,
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
    CONSTRAINT "BlogPost_sponsoredLawFirmId_fkey" FOREIGN KEY ("sponsoredLawFirmId") REFERENCES "LawFirm" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BlogPost" ("categoryId", "createdAt", "dataPublikacji", "id", "lawFirmId", "metaDescription", "metaTitle", "obrazekWyrozniajacy", "opublikowany", "slug", "tagi", "tresc", "tytul", "updatedAt", "wyswietlenia") SELECT "categoryId", "createdAt", "dataPublikacji", "id", "lawFirmId", "metaDescription", "metaTitle", "obrazekWyrozniajacy", "opublikowany", "slug", "tagi", "tresc", "tytul", "updatedAt", "wyswietlenia" FROM "BlogPost";
DROP TABLE "BlogPost";
ALTER TABLE "new_BlogPost" RENAME TO "BlogPost";
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
CREATE INDEX "BlogPost_lawFirmId_idx" ON "BlogPost"("lawFirmId");
CREATE INDEX "BlogPost_sponsoredLawFirmId_idx" ON "BlogPost"("sponsoredLawFirmId");
CREATE INDEX "BlogPost_categoryId_idx" ON "BlogPost"("categoryId");
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");
CREATE INDEX "BlogPost_opublikowany_idx" ON "BlogPost"("opublikowany");
CREATE TABLE "new_ConsultationBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "consultationDate" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "topic" TEXT NOT NULL,
    "clientContact" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatus" TEXT NOT NULL DEFAULT 'OCZEKUJE',
    "googleMeetUrl" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConsultationBooking_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConsultationBooking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ConsultationBooking" ("clientContact", "clientId", "consultationDate", "createdAt", "duration", "googleMeetUrl", "id", "lawFirmId", "paymentStatus", "price", "status", "topic", "updatedAt") SELECT "clientContact", "clientId", "consultationDate", "createdAt", "duration", "googleMeetUrl", "id", "lawFirmId", "paymentStatus", "price", "status", "topic", "updatedAt" FROM "ConsultationBooking";
DROP TABLE "ConsultationBooking";
ALTER TABLE "new_ConsultationBooking" RENAME TO "ConsultationBooking";
CREATE INDEX "ConsultationBooking_lawFirmId_idx" ON "ConsultationBooking"("lawFirmId");
CREATE INDEX "ConsultationBooking_clientId_idx" ON "ConsultationBooking"("clientId");
CREATE INDEX "ConsultationBooking_status_idx" ON "ConsultationBooking"("status");
CREATE INDEX "ConsultationBooking_consultationDate_idx" ON "ConsultationBooking"("consultationDate");
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
    "welcomePackageSeen" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_NotificationSettings" ("autoProsbOpinie", "emailNoweOferty", "emailStatusy", "emailWiadomosci", "id", "isConfigured", "kluczowe", "kontaktDoradca", "kontaktKlienci", "noweFunkcje", "ofertPromocje", "powiadomieniaSmNowa", "powiadomienieDzwiekowe", "przypomnienieWiadomosci", "smsPilne", "updatedAt", "urlop", "userId", "ustawieniaOgloszenia", "wiadomosciZbiorcze", "wskazowkiPorady", "wyswietlanieAwatara", "zmianyCenniki", "zmianyRegulamin") SELECT "autoProsbOpinie", "emailNoweOferty", "emailStatusy", "emailWiadomosci", "id", "isConfigured", "kluczowe", "kontaktDoradca", "kontaktKlienci", "noweFunkcje", "ofertPromocje", "powiadomieniaSmNowa", "powiadomienieDzwiekowe", "przypomnienieWiadomosci", "smsPilne", "updatedAt", "urlop", "userId", "ustawieniaOgloszenia", "wiadomosciZbiorcze", "wskazowkiPorady", "wyswietlanieAwatara", "zmianyCenniki", "zmianyRegulamin" FROM "NotificationSettings";
DROP TABLE "NotificationSettings";
ALTER TABLE "new_NotificationSettings" RENAME TO "NotificationSettings";
CREATE UNIQUE INDEX "NotificationSettings_userId_key" ON "NotificationSettings"("userId");
CREATE INDEX "NotificationSettings_userId_idx" ON "NotificationSettings"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
