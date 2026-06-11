-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LawFirm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "typInny" TEXT,
    "nazwa" TEXT NOT NULL,
    "nazwaFirmy" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "regon" TEXT,
    "krs" TEXT,
    "imieKontakt" TEXT NOT NULL,
    "nazwiskoKontakt" TEXT NOT NULL,
    "numerTelefonu" TEXT NOT NULL,
    "numerTelefonu2" TEXT,
    "emailKontakt" TEXT NOT NULL,
    "adres" TEXT NOT NULL,
    "kodPocztowy" TEXT NOT NULL,
    "miasto" TEXT NOT NULL,
    "voivodeshipId" TEXT NOT NULL,
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
    "callaPolska" BOOLEAN NOT NULL DEFAULT false,
    "onlineOnly" BOOLEAN NOT NULL DEFAULT false,
    "typOferty" TEXT NOT NULL,
    "punktySaldo" INTEGER NOT NULL DEFAULT 0,
    "pakietSubskrypcji" TEXT NOT NULL DEFAULT 'PODSTAWOWY',
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LawFirm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LawFirm_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LawFirm" ("adres", "aktywna", "callaPolska", "createdAt", "dataPakietuDo", "dataPakietuOd", "edukacja", "emailKontakt", "filmYouTube", "galeriaZdjec", "godzinyOtwarcia", "id", "imieKontakt", "kodPocztowy", "kolejnoscMultimedia", "konwersja", "krs", "linkFacebook", "linkInstagram", "linkLinkedIn", "linkTikTok", "linkTwitter", "logo", "miasto", "nazwa", "nazwaFirmy", "nazwiskoKontakt", "nip", "numerTelefonu", "numerTelefonu2", "oirpMiasto", "oirpStatus", "oirpWpis", "okladkaFilmu", "onlineOnly", "opis", "oraMiasto", "oraStatus", "oraWpis", "pakietSubskrypcji", "pozycjaRanking", "punktySaldo", "regon", "slowaKluczowe", "slug", "statusGodzinyOtwarcia", "stronaWww", "typ", "typInny", "typOferty", "unikatowyOpisUslugi", "updatedAt", "userId", "voivodeshipId", "wygraneOferty", "wyswietleniaProfilu", "zdjecieGlowne", "zgodaPrzetwarzanie", "zgodaRegulamin", "zlozoneOferty", "zweryfikowana") SELECT "adres", "aktywna", "callaPolska", "createdAt", "dataPakietuDo", "dataPakietuOd", "edukacja", "emailKontakt", "filmYouTube", "galeriaZdjec", "godzinyOtwarcia", "id", "imieKontakt", "kodPocztowy", "kolejnoscMultimedia", "konwersja", "krs", "linkFacebook", "linkInstagram", "linkLinkedIn", "linkTikTok", "linkTwitter", "logo", "miasto", "nazwa", "nazwaFirmy", "nazwiskoKontakt", "nip", "numerTelefonu", "numerTelefonu2", "oirpMiasto", "oirpStatus", "oirpWpis", "okladkaFilmu", "onlineOnly", "opis", "oraMiasto", "oraStatus", "oraWpis", "pakietSubskrypcji", "pozycjaRanking", "punktySaldo", "regon", "slowaKluczowe", "slug", "statusGodzinyOtwarcia", "stronaWww", "typ", "typInny", "typOferty", "unikatowyOpisUslugi", "updatedAt", "userId", "voivodeshipId", "wygraneOferty", "wyswietleniaProfilu", "zdjecieGlowne", "zgodaPrzetwarzanie", "zgodaRegulamin", "zlozoneOferty", "zweryfikowana" FROM "LawFirm";
DROP TABLE "LawFirm";
ALTER TABLE "new_LawFirm" RENAME TO "LawFirm";
CREATE UNIQUE INDEX "LawFirm_userId_key" ON "LawFirm"("userId");
CREATE UNIQUE INDEX "LawFirm_slug_key" ON "LawFirm"("slug");
CREATE UNIQUE INDEX "LawFirm_nip_key" ON "LawFirm"("nip");
CREATE INDEX "LawFirm_userId_idx" ON "LawFirm"("userId");
CREATE INDEX "LawFirm_voivodeshipId_idx" ON "LawFirm"("voivodeshipId");
CREATE INDEX "LawFirm_nip_idx" ON "LawFirm"("nip");
CREATE INDEX "LawFirm_zweryfikowana_idx" ON "LawFirm"("zweryfikowana");
CREATE INDEX "LawFirm_aktywna_idx" ON "LawFirm"("aktywna");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
