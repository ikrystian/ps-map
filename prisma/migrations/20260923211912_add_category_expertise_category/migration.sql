-- CreateTable
CREATE TABLE "CategoryExpertiseCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "expertiseCategoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CategoryExpertiseCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CategoryExpertiseCategory_expertiseCategoryId_fkey" FOREIGN KEY ("expertiseCategoryId") REFERENCES "ExpertiseCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CategoryExpertiseCategory_categoryId_idx" ON "CategoryExpertiseCategory"("categoryId");

-- CreateIndex
CREATE INDEX "CategoryExpertiseCategory_expertiseCategoryId_idx" ON "CategoryExpertiseCategory"("expertiseCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryExpertiseCategory_categoryId_expertiseCategoryId_key" ON "CategoryExpertiseCategory"("categoryId", "expertiseCategoryId");

