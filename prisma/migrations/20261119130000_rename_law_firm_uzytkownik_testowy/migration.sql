-- Zmiana nazwy flagi: „użytkownik tekstowy” → „użytkownik testowy” (konto testowe, ukryte publicznie).
-- RenameColumn zachowuje wartości istniejących wierszy.
ALTER TABLE "LawFirm" RENAME COLUMN "uzytkownikTekstowy" TO "uzytkownikTestowy";

-- DropIndex / CreateIndex (nazwa indeksu zgodna z nową nazwą kolumny)
DROP INDEX "LawFirm_uzytkownikTekstowy_idx";
CREATE INDEX "LawFirm_uzytkownikTestowy_idx" ON "LawFirm"("uzytkownikTestowy");
