-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dateRanges" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "proposedDateTime" DATETIME,
    "price" REAL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'OCZEKUJE',
    "googleMeetLink" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Consultation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Consultation_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Consultation_clientId_idx" ON "Consultation"("clientId");

-- CreateIndex
CREATE INDEX "Consultation_lawFirmId_idx" ON "Consultation"("lawFirmId");

-- CreateIndex
CREATE INDEX "Consultation_status_idx" ON "Consultation"("status");
