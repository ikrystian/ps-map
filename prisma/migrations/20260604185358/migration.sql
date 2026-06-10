-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN "ksefDiagnostics" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "ksefNumber" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "ksefReferenceNumber" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "ksefStatus" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "upoContent" TEXT;

-- CreateTable
CREATE TABLE "PostalCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    CONSTRAINT "PostalCode_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PostalCode_code_idx" ON "PostalCode"("code");

-- CreateIndex
CREATE INDEX "PostalCode_cityId_idx" ON "PostalCode"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "PostalCode_code_cityId_key" ON "PostalCode"("code", "cityId");
