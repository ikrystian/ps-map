-- CreateTable
CREATE TABLE "CaseReferral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "typSprawy" TEXT NOT NULL,
    "nazwaSprawy" TEXT,
    "wiadomosc" TEXT,
    "voivodeshipId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WYSLANE',
    "expiresAt" DATETIME NOT NULL,
    "otwarteAt" DATETIME,
    "zarejestrowanoAt" DATETIME,
    "wykorzystanoAt" DATETIME,
    "clientId" TEXT,
    "caseId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CaseReferral_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseReferral_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CaseReferral_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CaseReferral_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CaseReferral_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseReferralCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referralId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseReferralCategory_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "CaseReferral" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseReferralCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CaseReferral_token_key" ON "CaseReferral"("token");

-- CreateIndex
CREATE UNIQUE INDEX "CaseReferral_caseId_key" ON "CaseReferral"("caseId");

-- CreateIndex
CREATE INDEX "CaseReferral_lawFirmId_idx" ON "CaseReferral"("lawFirmId");

-- CreateIndex
CREATE INDEX "CaseReferral_email_idx" ON "CaseReferral"("email");

-- CreateIndex
CREATE INDEX "CaseReferral_status_idx" ON "CaseReferral"("status");

-- CreateIndex
CREATE INDEX "CaseReferral_createdAt_idx" ON "CaseReferral"("createdAt");

-- CreateIndex
CREATE INDEX "CaseReferralCategory_referralId_idx" ON "CaseReferralCategory"("referralId");

-- CreateIndex
CREATE INDEX "CaseReferralCategory_categoryId_idx" ON "CaseReferralCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseReferralCategory_referralId_categoryId_key" ON "CaseReferralCategory"("referralId", "categoryId");

