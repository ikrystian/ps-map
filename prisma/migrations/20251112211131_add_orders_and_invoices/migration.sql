-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerNIP" TEXT,
    "buyerAddress" TEXT NOT NULL,
    "buyerPostalCode" TEXT NOT NULL,
    "buyerCity" TEXT NOT NULL,
    "buyerCountry" TEXT NOT NULL DEFAULT 'Polska',
    "netAmount" REAL NOT NULL,
    "vatRate" REAL NOT NULL DEFAULT 23.0,
    "vatAmount" REAL NOT NULL,
    "grossAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ISSUED',
    "issueDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saleDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentDate" DATETIME,
    "dueDate" DATETIME NOT NULL,
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invoice_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT,
    "lawFirmId" TEXT NOT NULL,
    "orderType" TEXT NOT NULL DEFAULT 'POINTS',
    "pakietPunktow" TEXT,
    "liczbaPunktow" INTEGER,
    "subscriptionPlanId" TEXT,
    "subscriptionPeriod" INTEGER,
    "packageStartDate" DATETIME,
    "packageEndDate" DATETIME,
    "kwota" REAL NOT NULL,
    "metodaPlatnosci" TEXT NOT NULL,
    "statusPlatnosci" TEXT NOT NULL DEFAULT 'OCZEKUJE',
    "daneFaktury" TEXT,
    "externalOrderId" TEXT,
    "transactionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "zaplaconoData" DATETIME,
    CONSTRAINT "Order_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Order_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "SubscriptionPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("createdAt", "daneFaktury", "externalOrderId", "id", "kwota", "lawFirmId", "liczbaPunktow", "metodaPlatnosci", "pakietPunktow", "statusPlatnosci", "transactionId", "updatedAt", "zaplaconoData") SELECT "createdAt", "daneFaktury", "externalOrderId", "id", "kwota", "lawFirmId", "liczbaPunktow", "metodaPlatnosci", "pakietPunktow", "statusPlatnosci", "transactionId", "updatedAt", "zaplaconoData" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE INDEX "Order_lawFirmId_idx" ON "Order"("lawFirmId");
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");
CREATE INDEX "Order_statusPlatnosci_idx" ON "Order"("statusPlatnosci");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_orderId_key" ON "Invoice"("orderId");

-- CreateIndex
CREATE INDEX "Invoice_lawFirmId_idx" ON "Invoice"("lawFirmId");

-- CreateIndex
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_issueDate_idx" ON "Invoice"("issueDate");
