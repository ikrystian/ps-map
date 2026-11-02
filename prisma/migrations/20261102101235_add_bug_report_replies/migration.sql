-- CreateTable
CREATE TABLE "BugReportReply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bugReportId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "adminName" TEXT NOT NULL,
    "tresc" TEXT NOT NULL,
    "wyslanoNa" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BugReportReply_bugReportId_fkey" FOREIGN KEY ("bugReportId") REFERENCES "BugReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BugReportReply_bugReportId_idx" ON "BugReportReply"("bugReportId");

