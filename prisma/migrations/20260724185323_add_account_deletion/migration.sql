-- CreateTable
CREATE TABLE "AccountDeletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "requestedByUserId" TEXT,
    "reason" TEXT,
    "retentionUntil" DATETIME NOT NULL,
    "legalBasis" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "anonymizedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purgedAt" DATETIME,
    "purgeReport" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccountDeletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountDeletion_userId_key" ON "AccountDeletion"("userId");

-- CreateIndex
CREATE INDEX "AccountDeletion_retentionUntil_idx" ON "AccountDeletion"("retentionUntil");

-- CreateIndex
CREATE INDEX "AccountDeletion_purgedAt_idx" ON "AccountDeletion"("purgedAt");

-- CreateIndex
CREATE INDEX "AccountDeletion_emailHash_idx" ON "AccountDeletion"("emailHash");

-- CreateIndex
CREATE INDEX "AccountDeletion_anonymizedAt_idx" ON "AccountDeletion"("anonymizedAt");
