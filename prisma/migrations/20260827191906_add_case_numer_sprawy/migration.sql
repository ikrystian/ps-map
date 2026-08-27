-- AlterTable
ALTER TABLE "Case" ADD COLUMN "numerSprawy" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Case_numerSprawy_key" ON "Case"("numerSprawy");

