-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LawFirm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "typ" TEXT,
    "typInny" TEXT,
    "nazwa" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nip" TEXT,
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
    "bieglySadowy" BOOLEAN NOT NULL DEFAULT false,
    "bieglySadowyNazwaSadu" TEXT,
    "calaPolska" BOOLEAN NOT NULL DEFAULT false,
    "onlineOnly" BOOLEAN NOT NULL DEFAULT false,
    "typOferty" TEXT NOT NULL,
    "punktySaldo" INTEGER NOT NULL DEFAULT 0,
    "pakietSubskrypcji" TEXT,
    "dataPakietuOd" DATETIME,
    "dataPakietuDo" DATETIME,
    "autoRenewal" BOOLEAN NOT NULL DEFAULT false,
    "packageDurationDays" INTEGER,
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
INSERT INTO "new_LawFirm" ("accountManagerId", "aktywna", "autoRenewal", "bieglySadowy", "bieglySadowyNazwaSadu", "calaPolska", "createdAt", "dataPakietuDo", "dataPakietuOd", "edukacja", "expertiseCategoryId", "filmYouTube", "galeriaZdjec", "godzinyOtwarcia", "id", "kolejnoscMultimedia", "konwersja", "krs", "linkFacebook", "linkInstagram", "linkLinkedIn", "linkTikTok", "linkTwitter", "logo", "mainCategoryId", "nazwa", "nip", "oirpMiasto", "oirpStatus", "oirpWpis", "okladkaFilmu", "onlineOnly", "opis", "oraMiasto", "oraStatus", "oraWpis", "packageDurationDays", "pakietSubskrypcji", "pozycjaRanking", "punktySaldo", "regon", "slowaKluczowe", "slug", "statusGodzinyOtwarcia", "stronaWww", "typ", "typInny", "typOferty", "unikatowyOpisUslugi", "updatedAt", "userId", "wygraneOferty", "wyswietleniaProfilu", "zdjecieGlowne", "zgodaPrzetwarzanie", "zgodaRegulamin", "zlozoneOferty", "zweryfikowana") SELECT "accountManagerId", "aktywna", "autoRenewal", "bieglySadowy", "bieglySadowyNazwaSadu", "calaPolska", "createdAt", "dataPakietuDo", "dataPakietuOd", "edukacja", "expertiseCategoryId", "filmYouTube", "galeriaZdjec", "godzinyOtwarcia", "id", "kolejnoscMultimedia", "konwersja", "krs", "linkFacebook", "linkInstagram", "linkLinkedIn", "linkTikTok", "linkTwitter", "logo", "mainCategoryId", "nazwa", "nip", "oirpMiasto", "oirpStatus", "oirpWpis", "okladkaFilmu", "onlineOnly", "opis", "oraMiasto", "oraStatus", "oraWpis", "packageDurationDays", "pakietSubskrypcji", "pozycjaRanking", "punktySaldo", "regon", "slowaKluczowe", "slug", "statusGodzinyOtwarcia", "stronaWww", "typ", "typInny", "typOferty", "unikatowyOpisUslugi", "updatedAt", "userId", "wygraneOferty", "wyswietleniaProfilu", "zdjecieGlowne", "zgodaPrzetwarzanie", "zgodaRegulamin", "zlozoneOferty", "zweryfikowana" FROM "LawFirm";
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

-- Rozdzielenie znaczeń: `typInny` przestaje przechowywać ścieżkę specjalizacji
-- (np. "Prawnicy > Adwokat"), bo ta wynika z `expertiseCategoryId` i drzewa
-- ExpertiseCategory. Wracamy do dokumentowanego znaczenia: `typ` = forma prawna,
-- `typInny` = jej doprecyzowanie gdy typ = INNY.
--
-- Rekordy z redundantną ścieżką (ID specjalizacji już ustawione): czyścimy
-- ścieżkę i zerujemy podstawiony placeholder INNY na "nieokreślona".
UPDATE "LawFirm"
SET "typInny" = NULL,
    "typ" = CASE WHEN "typ" = 'INNY' THEN NULL ELSE "typ" END
WHERE "typInny" LIKE '%>%'
  AND "expertiseCategoryId" IS NOT NULL;

-- Rekordy ze ścieżką, ale bez `expertiseCategoryId`, wymagają dopasowania po
-- nazwach w drzewie kategorii — robi to skrypt
-- `prisma/scripts/backfill-expertise-category.ts` (uruchamiany jednorazowo).
