-- AlterTable
ALTER TABLE "LawFirm" ADD COLUMN "aplikacjaOd" DATETIME;
ALTER TABLE "LawFirm" ADD COLUMN "aplikantIzba" TEXT;
ALTER TABLE "LawFirm" ADD COLUMN "aplikantRodzaj" TEXT;

-- CreateTable
CREATE TABLE "Substitution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numer" TEXT,
    "zlecajacyId" TEXT NOT NULL,
    "zastepcaId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SZKIC',
    "tytul" TEXT NOT NULL DEFAULT '',
    "czynnosc" TEXT NOT NULL DEFAULT 'ROZPRAWA',
    "dziedzina" TEXT NOT NULL DEFAULT 'CYWILNA',
    "rolaZastepcy" TEXT NOT NULL DEFAULT 'PELNOMOCNIK_POWODA',
    "ktoryTermin" TEXT NOT NULL DEFAULT 'PIERWSZY',
    "opis" TEXT,
    "typMiejsca" TEXT NOT NULL DEFAULT 'SAD',
    "miejsce" TEXT,
    "wydzial" TEXT,
    "miasto" TEXT,
    "wojewodztwo" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "termin" DATETIME,
    "terminMaGodzine" BOOLEAN NOT NULL DEFAULT true,
    "terminDoUstalenia" BOOLEAN NOT NULL DEFAULT false,
    "ofertyDoTryb" TEXT NOT NULL DEFAULT 'DZIEN_PRZED',
    "ofertyDo" DATETIME,
    "dlaAdwokatow" BOOLEAN NOT NULL DEFAULT true,
    "dlaRadcow" BOOLEAN NOT NULL DEFAULT true,
    "dlaAplikantow" BOOLEAN NOT NULL DEFAULT false,
    "stawka" INTEGER,
    "fakturaVat" BOOLEAN NOT NULL DEFAULT true,
    "trybWyboru" TEXT NOT NULL DEFAULT 'WYBIERAM',
    "pilne" BOOLEAN NOT NULL DEFAULT false,
    "pilnePunkty" INTEGER,
    "zapytanieDoId" TEXT,
    "zapytanieWazneDo" DATETIME,
    "zapytanieOdpowiedz" TEXT,
    "opublikowanoAt" DATETIME,
    "wybranoAt" DATETIME,
    "potwierdzenieDo" DATETIME,
    "potwierdzonoAt" DATETIME,
    "naMiejscuAt" DATETIME,
    "wykonanoAt" DATETIME,
    "zamknietoAt" DATETIME,
    "zamknietoAutomatycznie" BOOLEAN NOT NULL DEFAULT false,
    "anulowanoAt" DATETIME,
    "powodAnulowania" TEXT,
    "problemZgloszonoAt" DATETIME,
    "problemOpis" TEXT,
    "przypomnienieWyslanoAt" DATETIME,
    "raportPrzebieg" TEXT,
    "raportKolejnyTermin" DATETIME,
    "raportNotatka" TEXT,
    "ocena" INTEGER,
    "ocenaKomentarz" TEXT,
    "stawkaUzgodniona" INTEGER,
    "fakturaStatus" TEXT NOT NULL DEFAULT 'DO_WYSTAWIENIA',
    "zarchiwizowane" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Substitution_zlecajacyId_fkey" FOREIGN KEY ("zlecajacyId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Substitution_zastepcaId_fkey" FOREIGN KEY ("zastepcaId") REFERENCES "LawFirm" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Substitution_zapytanieDoId_fkey" FOREIGN KEY ("zapytanieDoId") REFERENCES "LawFirm" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubstitutionConfidential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "substitutionId" TEXT NOT NULL,
    "dane" TEXT NOT NULL,
    "daneIv" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SubstitutionConfidential_substitutionId_fkey" FOREIGN KEY ("substitutionId") REFERENCES "Substitution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubstitutionFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "substitutionId" TEXT NOT NULL,
    "dodalId" TEXT NOT NULL,
    "rodzaj" TEXT NOT NULL DEFAULT 'DOKUMENT',
    "nazwa" TEXT NOT NULL,
    "sciezka" TEXT NOT NULL,
    "rozmiar" INTEGER NOT NULL,
    "mime" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubstitutionFile_substitutionId_fkey" FOREIGN KEY ("substitutionId") REFERENCES "Substitution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubstitutionOffer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "substitutionId" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "stawka" INTEGER NOT NULL,
    "notatka" TEXT,
    "fakturaVat" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'OCZEKUJE',
    "rezygnacjaAt" DATETIME,
    "rezygnacjaPozno" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SubstitutionOffer_substitutionId_fkey" FOREIGN KEY ("substitutionId") REFERENCES "Substitution" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubstitutionOffer_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubstitutionSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "przyjmuje" BOOLEAN NOT NULL DEFAULT true,
    "miasto" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "promienKm" INTEGER NOT NULL DEFAULT 30,
    "sady" TEXT,
    "zdalne" BOOLEAN NOT NULL DEFAULT true,
    "czynnosci" TEXT,
    "dziedziny" TEXT,
    "minStawka" INTEGER,
    "niedostepnosc" TEXT,
    "emailOdRazu" BOOLEAN NOT NULL DEFAULT true,
    "zestawienieDzienne" BOOLEAN NOT NULL DEFAULT false,
    "smsPilne" BOOLEAN NOT NULL DEFAULT false,
    "przypomnienie" BOOLEAN NOT NULL DEFAULT true,
    "ostatnieZestawienieAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SubstitutionSettings_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Substitution_numer_key" ON "Substitution"("numer");

-- CreateIndex
CREATE INDEX "Substitution_zlecajacyId_idx" ON "Substitution"("zlecajacyId");

-- CreateIndex
CREATE INDEX "Substitution_zastepcaId_idx" ON "Substitution"("zastepcaId");

-- CreateIndex
CREATE INDEX "Substitution_zapytanieDoId_idx" ON "Substitution"("zapytanieDoId");

-- CreateIndex
CREATE INDEX "Substitution_status_idx" ON "Substitution"("status");

-- CreateIndex
CREATE INDEX "Substitution_termin_idx" ON "Substitution"("termin");

-- CreateIndex
CREATE INDEX "Substitution_opublikowanoAt_idx" ON "Substitution"("opublikowanoAt");

-- CreateIndex
CREATE UNIQUE INDEX "SubstitutionConfidential_substitutionId_key" ON "SubstitutionConfidential"("substitutionId");

-- CreateIndex
CREATE INDEX "SubstitutionFile_substitutionId_idx" ON "SubstitutionFile"("substitutionId");

-- CreateIndex
CREATE INDEX "SubstitutionOffer_lawFirmId_idx" ON "SubstitutionOffer"("lawFirmId");

-- CreateIndex
CREATE INDEX "SubstitutionOffer_status_idx" ON "SubstitutionOffer"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SubstitutionOffer_substitutionId_lawFirmId_key" ON "SubstitutionOffer"("substitutionId", "lawFirmId");

-- CreateIndex
CREATE UNIQUE INDEX "SubstitutionSettings_lawFirmId_key" ON "SubstitutionSettings"("lawFirmId");

