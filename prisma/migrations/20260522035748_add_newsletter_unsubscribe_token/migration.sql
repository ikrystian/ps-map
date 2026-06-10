/*
  Warnings:

  - A unique constraint covering the columns `[unsubscribeToken]` on the table `Newsletter` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Newsletter" ADD COLUMN "unsubscribeToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Newsletter_unsubscribeToken_key" ON "Newsletter"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "Newsletter_unsubscribeToken_idx" ON "Newsletter"("unsubscribeToken");
