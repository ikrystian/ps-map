-- AlterTable
ALTER TABLE "User" ADD COLUMN "telefonZweryfikowany" DATETIME;

-- CreateTable
CREATE TABLE "PhoneVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "token" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "verifiedAt" DATETIME,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "PhoneVerification_token_key" ON "PhoneVerification"("token");

-- CreateIndex
CREATE INDEX "PhoneVerification_phone_idx" ON "PhoneVerification"("phone");
