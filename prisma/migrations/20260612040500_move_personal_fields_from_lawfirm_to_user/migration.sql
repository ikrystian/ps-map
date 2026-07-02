-- Przeniesienie pól osobowych/kontaktowych/adresowych z LawFirm do User.
-- Kolejność: najpierw przebudowa User (z kopiowaniem danych ze starej tabeli LawFirm),
-- dopiero potem przebudowa LawFirm (usunięcie przeniesionych kolumn).

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLogin" DATETIME,
    "deletedAt" DATETIME,
    "imie" TEXT,
    "nazwisko" TEXT,
    "numerTelefonu" TEXT,
    "numerTelefonu2" TEXT,
    "adres" TEXT,
    "kodPocztowy" TEXT,
    "miasto" TEXT,
    "voivodeshipId" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    CONSTRAINT "User_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Kopiowanie danych użytkownika + przeniesienie danych kontaktowych/adresowych z LawFirm
INSERT INTO "new_User" ("id", "name", "email", "emailVerified", "image", "password", "role", "status", "resetToken", "resetTokenExpiry", "createdAt", "updatedAt", "lastLogin", "deletedAt", "imie", "nazwisko", "numerTelefonu", "numerTelefonu2", "adres", "kodPocztowy", "miasto", "voivodeshipId", "latitude", "longitude")
SELECT u."id", u."name", u."email", u."emailVerified", u."image", u."password", u."role", u."status", u."resetToken", u."resetTokenExpiry", u."createdAt", u."updatedAt", u."lastLogin", u."deletedAt",
       lf."imieKontakt", lf."nazwiskoKontakt", lf."numerTelefonu", lf."numerTelefonu2", lf."adres", lf."kodPocztowy", lf."miasto", lf."voivodeshipId", lf."latitude", lf."longitude"
FROM "User" u
LEFT JOIN "LawFirm" lf ON lf."userId" = u."id";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_status_idx" ON "User"("status");
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX "User_voivodeshipId_idx" ON "User"("voivodeshipId");

CREATE TABLE "new_LawFirm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "typInny" TEXT,
    "nazwa" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "regon" TEXT,
    "krs" TEXT,
    "opis" TEXT DEFAULT '',
    "logo" TEXT,
    "zdjecieGlowne" TEXT,
    "galeriaZdjec" TEXT,
    "filmYouTube" TEXT,
    "okladkaFilmu" TEXT,
    "kolejnoscMultimedia" TEXT DEFAULT 'zdjecia',
    "statusGodzinyOtwarcia" BOOLEAN NOT NULL DEFAULT false,
    "godzinyOtwarcia" TEXT,
    "linkLinkedIn" TEXT,
    "linkFacebook" TEXT,
    "linkInstagram" TEXT,
    "linkTwitter" TEXT,
    "linkTikTok" TEXT,
    "stronaWww" TEXT,
    "edukacja" TEXT,
    "oirpMiasto" TEXT,
    "oirpWpis" TEXT,
    "oirpStatus" BOOLEAN NOT NULL DEFAULT false,
    "oraMiasto" TEXT,
    "oraWpis" TEXT,
    "oraStatus" BOOLEAN NOT NULL DEFAULT false,
    "unikatowyOpisUslugi" TEXT,
    "slowaKluczowe" TEXT,
    "mainCategoryId" TEXT,
    "expertiseCategoryId" TEXT,
    "callaPolska" BOOLEAN NOT NULL DEFAULT false,
    "onlineOnly" BOOLEAN NOT NULL DEFAULT false,
    "typOferty" TEXT NOT NULL,
    "punktySaldo" INTEGER NOT NULL DEFAULT 0,
    "pakietSubskrypcji" TEXT,
    "dataPakietuOd" DATETIME,
    "dataPakietuDo" DATETIME,
    "autoRenewal" BOOLEAN NOT NULL DEFAULT false,
    "wyswietleniaProfilu" INTEGER NOT NULL DEFAULT 0,
    "zlozoneOferty" INTEGER NOT NULL DEFAULT 0,
    "wygraneOferty" INTEGER NOT NULL DEFAULT 0,
    "konwersja" REAL NOT NULL DEFAULT 0,
    "pozycjaRanking" INTEGER,
    "zgodaRegulamin" BOOLEAN NOT NULL DEFAULT false,
    "zgodaPrzetwarzanie" BOOLEAN NOT NULL DEFAULT false,
    "zweryfikowana" BOOLEAN NOT NULL DEFAULT false,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "accountManagerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LawFirm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LawFirm_mainCategoryId_fkey" FOREIGN KEY ("mainCategoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LawFirm_expertiseCategoryId_fkey" FOREIGN KEY ("expertiseCategoryId") REFERENCES "ExpertiseCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LawFirm_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "AccountManager" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LawFirm" ("accountManagerId", "aktywna", "autoRenewal", "callaPolska", "createdAt", "dataPakietuDo", "dataPakietuOd", "edukacja", "expertiseCategoryId", "filmYouTube", "galeriaZdjec", "godzinyOtwarcia", "id", "kolejnoscMultimedia", "konwersja", "krs", "linkFacebook", "linkInstagram", "linkLinkedIn", "linkTikTok", "linkTwitter", "logo", "mainCategoryId", "nazwa", "nazwa", "nip", "oirpMiasto", "oirpStatus", "oirpWpis", "okladkaFilmu", "onlineOnly", "opis", "oraMiasto", "oraStatus", "oraWpis", "pakietSubskrypcji", "pozycjaRanking", "punktySaldo", "regon", "slowaKluczowe", "slug", "statusGodzinyOtwarcia", "stronaWww", "typ", "typInny", "typOferty", "unikatowyOpisUslugi", "updatedAt", "userId", "wygraneOferty", "wyswietleniaProfilu", "zdjecieGlowne", "zgodaPrzetwarzanie", "zgodaRegulamin", "zlozoneOferty", "zweryfikowana") SELECT "accountManagerId", "aktywna", "autoRenewal", "callaPolska", "createdAt", "dataPakietuDo", "dataPakietuOd", "edukacja", "expertiseCategoryId", "filmYouTube", "galeriaZdjec", "godzinyOtwarcia", "id", "kolejnoscMultimedia", "konwersja", "krs", "linkFacebook", "linkInstagram", "linkLinkedIn", "linkTikTok", "linkTwitter", "logo", "mainCategoryId", "nazwa", "nazwa", "nip", "oirpMiasto", "oirpStatus", "oirpWpis", "okladkaFilmu", "onlineOnly", "opis", "oraMiasto", "oraStatus", "oraWpis", "pakietSubskrypcji", "pozycjaRanking", "punktySaldo", "regon", "slowaKluczowe", "slug", "statusGodzinyOtwarcia", "stronaWww", "typ", "typInny", "typOferty", "unikatowyOpisUslugi", "updatedAt", "userId", "wygraneOferty", "wyswietleniaProfilu", "zdjecieGlowne", "zgodaPrzetwarzanie", "zgodaRegulamin", "zlozoneOferty", "zweryfikowana" FROM "LawFirm";
DROP TABLE "LawFirm";
ALTER TABLE "new_LawFirm" RENAME TO "LawFirm";
CREATE UNIQUE INDEX "LawFirm_userId_key" ON "LawFirm"("userId");
CREATE UNIQUE INDEX "LawFirm_slug_key" ON "LawFirm"("slug");
CREATE UNIQUE INDEX "LawFirm_nip_key" ON "LawFirm"("nip");
CREATE INDEX "LawFirm_userId_idx" ON "LawFirm"("userId");
CREATE INDEX "LawFirm_nip_idx" ON "LawFirm"("nip");
CREATE INDEX "LawFirm_zweryfikowana_idx" ON "LawFirm"("zweryfikowana");
CREATE INDEX "LawFirm_aktywna_idx" ON "LawFirm"("aktywna");
CREATE INDEX "LawFirm_accountManagerId_idx" ON "LawFirm"("accountManagerId");
CREATE INDEX "LawFirm_mainCategoryId_idx" ON "LawFirm"("mainCategoryId");
CREATE INDEX "LawFirm_expertiseCategoryId_idx" ON "LawFirm"("expertiseCategoryId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
