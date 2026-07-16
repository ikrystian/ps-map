-- CreateTable
CREATE TABLE "CaseCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseCategory_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CaseCategory_caseId_idx" ON "CaseCategory"("caseId");

-- CreateIndex
CREATE INDEX "CaseCategory_categoryId_idx" ON "CaseCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseCategory_caseId_categoryId_key" ON "CaseCategory"("caseId", "categoryId");

-- Backfill: każda istniejąca sprawa dostaje wpis z jej dotychczasową kategorią główną
INSERT INTO "CaseCategory" ("id", "caseId", "categoryId")
SELECT
    lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-a' || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
    "id",
    "categoryId"
FROM "Case";
