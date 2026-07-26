-- CreateTable
CREATE TABLE "RegistrationAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "zgodaRegulamin" BOOLEAN NOT NULL DEFAULT false,
    "zgodaNewsletter" BOOLEAN NOT NULL DEFAULT false,
    "zgodaMarketing" BOOLEAN NOT NULL DEFAULT false,
    "zgodaPrzetwarzanie" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "acceptLanguage" TEXT,
    "referer" TEXT,
    "secChUa" TEXT,
    "secChUaPlatform" TEXT,
    "secChUaMobile" TEXT,
    "browser" TEXT,
    "browserVersion" TEXT,
    "os" TEXT,
    "osVersion" TEXT,
    "deviceType" TEXT,
    "screenResolution" TEXT,
    "viewportSize" TEXT,
    "devicePixelRatio" REAL,
    "language" TEXT,
    "languages" TEXT,
    "timezone" TEXT,
    "timezoneOffset" INTEGER,
    "platform" TEXT,
    "hardwareConcurrency" INTEGER,
    "deviceMemory" REAL,
    "touchSupport" BOOLEAN NOT NULL DEFAULT false,
    "cookieEnabled" BOOLEAN NOT NULL DEFAULT true,
    "doNotTrack" TEXT,
    "onlineStatus" BOOLEAN NOT NULL DEFAULT true,
    "connectionType" TEXT,
    "registrationUrl" TEXT,
    "documentReferrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "rawMetadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegistrationAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationAuditLog_userId_key" ON "RegistrationAuditLog"("userId");

-- CreateIndex
CREATE INDEX "RegistrationAuditLog_userId_idx" ON "RegistrationAuditLog"("userId");

-- CreateIndex
CREATE INDEX "RegistrationAuditLog_ipAddress_idx" ON "RegistrationAuditLog"("ipAddress");

-- CreateIndex
CREATE INDEX "RegistrationAuditLog_createdAt_idx" ON "RegistrationAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "RegistrationAuditLog_role_idx" ON "RegistrationAuditLog"("role");

