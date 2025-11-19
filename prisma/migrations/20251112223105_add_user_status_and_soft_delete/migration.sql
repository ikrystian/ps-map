-- AlterTable: Add status and deletedAt columns to User table
ALTER TABLE "User" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN "deletedAt" DATETIME;

-- CreateIndex: Add indexes for status and deletedAt columns
CREATE INDEX "User_status_idx" ON "User"("status");
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
