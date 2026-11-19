-- AlterTable (ADD COLUMN — zmiana czysto addytywna, domyślnie wszyscy eksperci widoczni publicznie)
ALTER TABLE "LawFirm" ADD COLUMN "uzytkownikTekstowy" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "LawFirm_uzytkownikTekstowy_idx" ON "LawFirm"("uzytkownikTekstowy");
