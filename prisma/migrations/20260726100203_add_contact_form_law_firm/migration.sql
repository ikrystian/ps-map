-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContactForm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imieNazwisko" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefon" TEXT,
    "temat" TEXT NOT NULL,
    "wiadomosc" TEXT NOT NULL,
    "zalacznik" TEXT,
    "zrodlo" TEXT DEFAULT 'KONTAKT',
    "odpowiedziano" BOOLEAN NOT NULL DEFAULT false,
    "lawFirmId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactForm_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ContactForm" ("createdAt", "email", "id", "imieNazwisko", "odpowiedziano", "telefon", "temat", "wiadomosc", "zalacznik", "zrodlo") SELECT "createdAt", "email", "id", "imieNazwisko", "odpowiedziano", "telefon", "temat", "wiadomosc", "zalacznik", "zrodlo" FROM "ContactForm";
DROP TABLE "ContactForm";
ALTER TABLE "new_ContactForm" RENAME TO "ContactForm";
CREATE INDEX "ContactForm_odpowiedziano_idx" ON "ContactForm"("odpowiedziano");
CREATE INDEX "ContactForm_createdAt_idx" ON "ContactForm"("createdAt");
CREATE INDEX "ContactForm_zrodlo_idx" ON "ContactForm"("zrodlo");
CREATE INDEX "ContactForm_lawFirmId_idx" ON "ContactForm"("lawFirmId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

