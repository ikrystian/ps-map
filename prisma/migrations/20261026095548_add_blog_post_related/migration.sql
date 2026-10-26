-- CreateTable
CREATE TABLE "BlogPostRelated" (
    "postId" TEXT NOT NULL,
    "relatedPostId" TEXT NOT NULL,
    "kolejnosc" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("postId", "relatedPostId"),
    CONSTRAINT "BlogPostRelated_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BlogPostRelated_relatedPostId_fkey" FOREIGN KEY ("relatedPostId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BlogPostRelated_relatedPostId_idx" ON "BlogPostRelated"("relatedPostId");

