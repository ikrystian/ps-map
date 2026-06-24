-- Przeniesienie telefonu i adresu z Client do User
-- (telefon -> numerTelefonu, adres, kodPocztowy, miasto, voivodeshipId).
-- Najpierw kopiujemy dane na konta użytkowników, potem przebudowujemy tabelę Client.

UPDATE "User" SET
  "numerTelefonu" = COALESCE("User"."numerTelefonu", (SELECT c."telefon"       FROM "Client" c WHERE c."userId" = "User"."id")),
  "adres"         = COALESCE("User"."adres",         (SELECT c."adres"         FROM "Client" c WHERE c."userId" = "User"."id")),
  "kodPocztowy"   = COALESCE("User"."kodPocztowy",   (SELECT c."kodPocztowy"   FROM "Client" c WHERE c."userId" = "User"."id")),
  "miasto"        = COALESCE("User"."miasto",        (SELECT c."miasto"        FROM "Client" c WHERE c."userId" = "User"."id")),
  "voivodeshipId" = COALESCE("User"."voivodeshipId", (SELECT c."voivodeshipId" FROM "Client" c WHERE c."userId" = "User"."id"))
WHERE EXISTS (SELECT 1 FROM "Client" c WHERE c."userId" = "User"."id");

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "clientType" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "imie" TEXT NOT NULL,
    "nazwisko" TEXT NOT NULL,
    "nazwa" TEXT,
    "nip" TEXT,
    "regon" TEXT,
    "krs" TEXT,
    "zgodaRegulamin" BOOLEAN NOT NULL DEFAULT false,
    "zgodaNewsletter" BOOLEAN NOT NULL DEFAULT false,
    "zgodaMarketing" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "punktySaldo" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Client" ("clientType", "createdAt", "id", "imie", "krs", "nazwa", "nazwisko", "nip", "punktySaldo", "regon", "updatedAt", "userId", "zgodaMarketing", "zgodaNewsletter", "zgodaRegulamin") SELECT "clientType", "createdAt", "id", "imie", "krs", "nazwa", "nazwisko", "nip", "punktySaldo", "regon", "updatedAt", "userId", "zgodaMarketing", "zgodaNewsletter", "zgodaRegulamin" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");
CREATE INDEX "Client_userId_idx" ON "Client"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
