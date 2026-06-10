-- AlterTable NotificationSettings - Add new fields
ALTER TABLE "NotificationSettings" ADD COLUMN "kontaktKlienci" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "NotificationSettings" ADD COLUMN "kluczowe" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "NotificationSettings" ADD COLUMN "wskazowkiPorady" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "NotificationSettings" ADD COLUMN "ofertPromocje" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "NotificationSettings" ADD COLUMN "przypomnienieWiadomosci" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "NotificationSettings" ADD COLUMN "noweFunkcje" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "NotificationSettings" ADD COLUMN "zmianyCenniki" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "NotificationSettings" ADD COLUMN "zmianyRegulamin" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "NotificationSettings" ADD COLUMN "kontaktDoradca" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "NotificationSettings" ADD COLUMN "wyswietlanieAwatara" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "NotificationSettings" ADD COLUMN "autoProsbOpinie" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "NotificationSettings" ADD COLUMN "powiadomienieDzwiekowe" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "NotificationSettings" ADD COLUMN "ustawieniaOgloszenia" BOOLEAN NOT NULL DEFAULT true;
