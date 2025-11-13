-- CreateEnum
CREATE TYPE "ModuleType" AS ENUM ('TEMPLATE', 'EDITABLE_HTML');

-- AlterTable
ALTER TABLE "Module" ADD COLUMN "type" "ModuleType" NOT NULL DEFAULT 'TEMPLATE';

-- CreateIndex
CREATE INDEX "Module_type_idx" ON "Module"("type");
