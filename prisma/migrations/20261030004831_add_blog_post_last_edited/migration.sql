-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN "lastEditedAt" DATETIME;
ALTER TABLE "BlogPost" ADD COLUMN "lastEditedById" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "lastEditedByRole" TEXT;
