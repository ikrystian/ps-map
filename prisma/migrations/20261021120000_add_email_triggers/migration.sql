-- AlterTable
ALTER TABLE "Case" ADD COLUMN "przypomnienieBezOfertAt" DATETIME;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN "odrzuconoAt" DATETIME;
ALTER TABLE "Review" ADD COLUMN "powodOdrzucenia" TEXT;

-- AlterTable (ADD COLUMN zamiast RedefineTables — zmiana czysto addytywna)
ALTER TABLE "LawFirm" ADD COLUMN "pakietProbny" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "LawFirm" ADD COLUMN "przypomnienieKoniecProbnegoAt" DATETIME;
ALTER TABLE "LawFirm" ADD COLUMN "weryfikacjaOdrzuconaPowod" TEXT;
ALTER TABLE "LawFirm" ADD COLUMN "weryfikacjaOdrzuconaAt" DATETIME;

-- CreateTable
CREATE TABLE "EmailChangeRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "newEmail" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailChangeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailChangeRequest_token_key" ON "EmailChangeRequest"("token");

-- CreateIndex
CREATE INDEX "EmailChangeRequest_userId_idx" ON "EmailChangeRequest"("userId");

-- Migracja danych: trwające pakiety Biznes bez opłaconego zamówienia subskrypcji
-- to pakiety bezpłatne przyznane przy rejestracji (autoGrantBusinessPackage)
UPDATE "LawFirm" SET "pakietProbny" = true
WHERE "pakietSubskrypcji" = 'BIZNES'
  AND "dataPakietuDo" IS NOT NULL
  AND (
    (typeof("dataPakietuDo") = 'integer' AND "dataPakietuDo" > CAST(strftime('%s', 'now') AS INTEGER) * 1000)
    OR (typeof("dataPakietuDo") = 'text' AND "dataPakietuDo" > strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )
  AND NOT EXISTS (
    SELECT 1 FROM "Order" o
    WHERE o."lawFirmId" = "LawFirm"."id"
      AND o."orderType" = 'SUBSCRIPTION'
      AND o."statusPlatnosci" = 'ZAPLACONE'
  );
