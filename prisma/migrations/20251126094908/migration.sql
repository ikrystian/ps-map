-- CreateTable
CREATE TABLE "ConsultationAvailability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "price15min" REAL NOT NULL,
    "price30min" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConsultationAvailability_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConsultationBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "consultationDate" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "topic" TEXT NOT NULL,
    "clientContact" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatus" TEXT NOT NULL DEFAULT 'OCZEKUJE',
    "googleMeetUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConsultationBooking_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConsultationBooking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ConsultationAvailability_lawFirmId_idx" ON "ConsultationAvailability"("lawFirmId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationAvailability_lawFirmId_dayOfWeek_key" ON "ConsultationAvailability"("lawFirmId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "ConsultationBooking_lawFirmId_idx" ON "ConsultationBooking"("lawFirmId");

-- CreateIndex
CREATE INDEX "ConsultationBooking_clientId_idx" ON "ConsultationBooking"("clientId");

-- CreateIndex
CREATE INDEX "ConsultationBooking_status_idx" ON "ConsultationBooking"("status");

-- CreateIndex
CREATE INDEX "ConsultationBooking_consultationDate_idx" ON "ConsultationBooking"("consultationDate");
