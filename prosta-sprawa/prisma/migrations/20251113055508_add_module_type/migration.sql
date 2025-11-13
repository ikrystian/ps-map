-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Module" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "preview" TEXT,
    "type" TEXT NOT NULL DEFAULT 'TEMPLATE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Module" ("active", "code", "createdAt", "description", "id", "name", "preview", "updatedAt") SELECT "active", "code", "createdAt", "description", "id", "name", "preview", "updatedAt" FROM "Module";
DROP TABLE "Module";
ALTER TABLE "new_Module" RENAME TO "Module";
CREATE INDEX "Module_active_idx" ON "Module"("active");
CREATE INDEX "Module_createdAt_idx" ON "Module"("createdAt");
CREATE INDEX "Module_type_idx" ON "Module"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
