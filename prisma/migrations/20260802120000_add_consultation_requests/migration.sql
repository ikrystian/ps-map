-- CreateTable
CREATE TABLE "ConsultationRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "categoryId" TEXT,
    "temat" TEXT NOT NULL,
    "opis" TEXT NOT NULL,
    "forma" TEXT NOT NULL DEFAULT 'DOWOLNA',
    "preferowanyCzas" INTEGER,
    "preferowanyTermin" TEXT,
    "terminOd" DATETIME,
    "terminDo" DATETIME,
    "budzetDo" REAL,
    "imieNazwisko" TEXT NOT NULL,
    "telefonKontakt" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOWE',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "bookingId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "zamknieto" DATETIME,
    CONSTRAINT "ConsultationRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConsultationRequest_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ConsultationRequest_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "ConsultationBooking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConsultationInterest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "proponowanyTermin" DATETIME NOT NULL,
    "alternatywnyTermin" DATETIME,
    "duration" INTEGER NOT NULL,
    "cena" REAL NOT NULL,
    "forma" TEXT NOT NULL,
    "wiadomosc" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ZLOZONE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "zaakceptowaneData" DATETIME,
    "odrzuconeData" DATETIME,
    CONSTRAINT "ConsultationInterest_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ConsultationRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConsultationInterest_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationRequest_bookingId_key" ON "ConsultationRequest"("bookingId");

-- CreateIndex
CREATE INDEX "ConsultationRequest_clientId_idx" ON "ConsultationRequest"("clientId");

-- CreateIndex
CREATE INDEX "ConsultationRequest_categoryId_idx" ON "ConsultationRequest"("categoryId");

-- CreateIndex
CREATE INDEX "ConsultationRequest_status_idx" ON "ConsultationRequest"("status");

-- CreateIndex
CREATE INDEX "ConsultationRequest_isArchived_idx" ON "ConsultationRequest"("isArchived");

-- CreateIndex
CREATE INDEX "ConsultationRequest_createdAt_idx" ON "ConsultationRequest"("createdAt");

-- CreateIndex
CREATE INDEX "ConsultationInterest_requestId_idx" ON "ConsultationInterest"("requestId");

-- CreateIndex
CREATE INDEX "ConsultationInterest_lawFirmId_idx" ON "ConsultationInterest"("lawFirmId");

-- CreateIndex
CREATE INDEX "ConsultationInterest_status_idx" ON "ConsultationInterest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationInterest_requestId_lawFirmId_key" ON "ConsultationInterest"("requestId", "lawFirmId");
