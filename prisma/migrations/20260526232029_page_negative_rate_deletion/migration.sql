/*
  Warnings:

  - You are about to drop the `BlogComment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BlogComment";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "OrderOverride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "context" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrderOverride_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "OrderOverride_context_idx" ON "OrderOverride"("context");

-- CreateIndex
CREATE UNIQUE INDEX "OrderOverride_context_lawFirmId_key" ON "OrderOverride"("context", "lawFirmId");
