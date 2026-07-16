-- CreateTable
CREATE TABLE "PartnerLogo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "PartnerLogo_active_idx" ON "PartnerLogo"("active");

-- CreateIndex
CREATE INDEX "PartnerLogo_order_idx" ON "PartnerLogo"("order");
