-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN "kolor" TEXT;

-- Domyślne kolory pakietów (spójne z dotychczasową kolorystyką w panelach)
UPDATE "SubscriptionPlan" SET "kolor" = '#64748b' WHERE "typ" = 'PODSTAWOWY' AND "kolor" IS NULL;
UPDATE "SubscriptionPlan" SET "kolor" = '#3b82f6' WHERE "typ" = 'STANDARD' AND "kolor" IS NULL;
UPDATE "SubscriptionPlan" SET "kolor" = '#a855f7' WHERE "typ" = 'PREMIUM' AND "kolor" IS NULL;
UPDATE "SubscriptionPlan" SET "kolor" = '#eab308' WHERE "typ" = 'BIZNES' AND "kolor" IS NULL;
