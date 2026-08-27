
-- CreateTable
CREATE TABLE "CaseCreationTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseCreationTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CaseCreationTicket_token_key" ON "CaseCreationTicket"("token");

-- CreateIndex
CREATE INDEX "CaseCreationTicket_userId_idx" ON "CaseCreationTicket"("userId");

