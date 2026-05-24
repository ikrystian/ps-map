-- CreateTable
CREATE TABLE "HomepageTestimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "HomepageTestimonial_active_idx" ON "HomepageTestimonial"("active");

-- CreateIndex
CREATE INDEX "HomepageTestimonial_order_idx" ON "HomepageTestimonial"("order");
