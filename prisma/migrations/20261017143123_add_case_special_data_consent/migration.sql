-- AlterTable
ALTER TABLE "Case" ADD COLUMN "zgodaDaneSzczegolne" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Case" ADD COLUMN "zgodaDaneSzczegolneAt" DATETIME;
