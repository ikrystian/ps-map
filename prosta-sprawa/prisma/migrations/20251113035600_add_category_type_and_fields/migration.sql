-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('SPRAWY_FIRMOWE', 'SPRAWY_PRYWATNE');

-- AlterTable: Add new columns to Category
ALTER TABLE "Category" ADD COLUMN "opisDodatkowy" TEXT;
ALTER TABLE "Category" ADD COLUMN "ikona" TEXT;
ALTER TABLE "Category" ADD COLUMN "typ" "CategoryType" NOT NULL DEFAULT 'SPRAWY_PRYWATNE';

-- CreateIndex
CREATE INDEX "Category_typ_idx" ON "Category"("typ");

-- AlterTable: Add kolejnosc to LawFirmCategory
ALTER TABLE "LawFirmCategory" ADD COLUMN "kolejnosc" INTEGER NOT NULL DEFAULT 0;
