-- CreateTable
CREATE TABLE "BlogPostEdit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "editorId" TEXT,
    "editorRole" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlogPostEdit_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BlogPostEdit_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BlogPostEdit_postId_createdAt_idx" ON "BlogPostEdit"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "BlogPostEdit_editorId_idx" ON "BlogPostEdit"("editorId");

-- Backfill: dotychczasowa "ostatnia edycja" staje się pierwszym wpisem historii
INSERT INTO "BlogPostEdit" ("id", "postId", "editorId", "editorRole", "createdAt")
SELECT lower(hex(randomblob(16))), "id",
       (SELECT "User"."id" FROM "User" WHERE "User"."id" = "BlogPost"."lastEditedById"),
       "lastEditedByRole", "lastEditedAt"
FROM "BlogPost"
WHERE "lastEditedAt" IS NOT NULL AND "lastEditedByRole" IS NOT NULL;
