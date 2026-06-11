-- CreateTable
CREATE TABLE "UserBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserOnlineStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TypingIndicator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isTyping" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TypingIndicator_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PromotionStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "promotionId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "profileClicks" INTEGER NOT NULL DEFAULT 0,
    "contactClicks" INTEGER NOT NULL DEFAULT 0,
    "offersSent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PromotionStats_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccountManager" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imie" TEXT NOT NULL,
    "nazwisko" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefon" TEXT,
    "avatar" TEXT,
    "aktywny" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nazwa" TEXT NOT NULL,
    "temat" TEXT NOT NULL,
    "tresc" TEXT NOT NULL,
    "trescHtml" TEXT,
    "typ" TEXT NOT NULL,
    "aktywny" BOOLEAN NOT NULL DEFAULT true,
    "triggery" TEXT,
    "zmienne" TEXT,
    "opisZmiennych" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentIv" TEXT,
    "attachments" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "deliveredAt" DATETIME,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChatMessage" ("attachments", "content", "conversationId", "createdAt", "id", "isRead", "readAt", "senderId", "updatedAt") SELECT "attachments", "content", "conversationId", "createdAt", "id", "isRead", "readAt", "senderId", "updatedAt" FROM "ChatMessage";
DROP TABLE "ChatMessage";
ALTER TABLE "new_ChatMessage" RENAME TO "ChatMessage";
CREATE INDEX "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId");
CREATE INDEX "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");
CREATE INDEX "ChatMessage_isRead_idx" ON "ChatMessage"("isRead");
CREATE INDEX "ChatMessage_status_idx" ON "ChatMessage"("status");
CREATE TABLE "new_Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientUserId" TEXT NOT NULL,
    "lawFirmUserId" TEXT NOT NULL,
    "lastMessageText" TEXT,
    "lastMessageAt" DATETIME,
    "lastMessageSenderId" TEXT,
    "isArchivedByClient" BOOLEAN NOT NULL DEFAULT false,
    "archivedByClientAt" DATETIME,
    "isArchivedByLawFirm" BOOLEAN NOT NULL DEFAULT false,
    "archivedByLawFirmAt" DATETIME,
    "isDeletedByClient" BOOLEAN NOT NULL DEFAULT false,
    "deletedByClientAt" DATETIME,
    "isDeletedByLawFirm" BOOLEAN NOT NULL DEFAULT false,
    "deletedByLawFirmAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Conversation_lawFirmUserId_fkey" FOREIGN KEY ("lawFirmUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Conversation" ("clientUserId", "createdAt", "id", "lastMessageAt", "lastMessageSenderId", "lastMessageText", "lawFirmUserId", "updatedAt") SELECT "clientUserId", "createdAt", "id", "lastMessageAt", "lastMessageSenderId", "lastMessageText", "lawFirmUserId", "updatedAt" FROM "Conversation";
DROP TABLE "Conversation";
ALTER TABLE "new_Conversation" RENAME TO "Conversation";
CREATE INDEX "Conversation_clientUserId_idx" ON "Conversation"("clientUserId");
CREATE INDEX "Conversation_lawFirmUserId_idx" ON "Conversation"("lawFirmUserId");
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");
CREATE INDEX "Conversation_isArchivedByClient_idx" ON "Conversation"("isArchivedByClient");
CREATE INDEX "Conversation_isArchivedByLawFirm_idx" ON "Conversation"("isArchivedByLawFirm");
CREATE INDEX "Conversation_isDeletedByClient_idx" ON "Conversation"("isDeletedByClient");
CREATE INDEX "Conversation_isDeletedByLawFirm_idx" ON "Conversation"("isDeletedByLawFirm");
CREATE UNIQUE INDEX "Conversation_clientUserId_lawFirmUserId_key" ON "Conversation"("clientUserId", "lawFirmUserId");
CREATE TABLE "new_Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "nazwa" TEXT NOT NULL,
    "typDokumentu" TEXT NOT NULL,
    "rozmiar" INTEGER NOT NULL,
    "sciezka" TEXT NOT NULL,
    "rozszerzenie" TEXT NOT NULL,
    "zrodlo" TEXT NOT NULL DEFAULT 'KANCELARIA',
    "clientUserId" TEXT,
    "conversationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Document_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("createdAt", "id", "lawFirmId", "nazwa", "rozmiar", "rozszerzenie", "sciezka", "typDokumentu", "updatedAt") SELECT "createdAt", "id", "lawFirmId", "nazwa", "rozmiar", "rozszerzenie", "sciezka", "typDokumentu", "updatedAt" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE INDEX "Document_lawFirmId_idx" ON "Document"("lawFirmId");
CREATE INDEX "Document_createdAt_idx" ON "Document"("createdAt");
CREATE INDEX "Document_typDokumentu_idx" ON "Document"("typDokumentu");
CREATE INDEX "Document_zrodlo_idx" ON "Document"("zrodlo");
CREATE INDEX "Document_clientUserId_idx" ON "Document"("clientUserId");
CREATE INDEX "Document_conversationId_idx" ON "Document"("conversationId");
CREATE TABLE "new_LawFirm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "typInny" TEXT,
    "nazwa" TEXT NOT NULL,
    "nazwaFirmy" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "regon" TEXT,
    "krs" TEXT,
    "imieKontakt" TEXT NOT NULL,
    "nazwiskoKontakt" TEXT NOT NULL,
    "numerTelefonu" TEXT NOT NULL,
    "numerTelefonu2" TEXT,
    "emailKontakt" TEXT NOT NULL,
    "adres" TEXT NOT NULL,
    "kodPocztowy" TEXT NOT NULL,
    "miasto" TEXT NOT NULL,
    "voivodeshipId" TEXT NOT NULL,
    "opis" TEXT DEFAULT '',
    "logo" TEXT,
    "zdjecieGlowne" TEXT,
    "galeriaZdjec" TEXT,
    "filmYouTube" TEXT,
    "okladkaFilmu" TEXT,
    "kolejnoscMultimedia" TEXT DEFAULT 'zdjecia',
    "statusGodzinyOtwarcia" BOOLEAN NOT NULL DEFAULT false,
    "godzinyOtwarcia" TEXT,
    "linkLinkedIn" TEXT,
    "linkFacebook" TEXT,
    "linkInstagram" TEXT,
    "linkTwitter" TEXT,
    "linkTikTok" TEXT,
    "stronaWww" TEXT,
    "edukacja" TEXT,
    "oirpMiasto" TEXT,
    "oirpWpis" TEXT,
    "oirpStatus" BOOLEAN NOT NULL DEFAULT false,
    "oraMiasto" TEXT,
    "oraWpis" TEXT,
    "oraStatus" BOOLEAN NOT NULL DEFAULT false,
    "unikatowyOpisUslugi" TEXT,
    "slowaKluczowe" TEXT,
    "callaPolska" BOOLEAN NOT NULL DEFAULT false,
    "onlineOnly" BOOLEAN NOT NULL DEFAULT false,
    "typOferty" TEXT NOT NULL,
    "punktySaldo" INTEGER NOT NULL DEFAULT 0,
    "pakietSubskrypcji" TEXT NOT NULL DEFAULT 'PODSTAWOWY',
    "dataPakietuOd" DATETIME,
    "dataPakietuDo" DATETIME,
    "autoRenewal" BOOLEAN NOT NULL DEFAULT false,
    "wyswietleniaProfilu" INTEGER NOT NULL DEFAULT 0,
    "zlozoneOferty" INTEGER NOT NULL DEFAULT 0,
    "wygraneOferty" INTEGER NOT NULL DEFAULT 0,
    "konwersja" REAL NOT NULL DEFAULT 0,
    "pozycjaRanking" INTEGER,
    "zgodaRegulamin" BOOLEAN NOT NULL DEFAULT false,
    "zgodaPrzetwarzanie" BOOLEAN NOT NULL DEFAULT false,
    "zweryfikowana" BOOLEAN NOT NULL DEFAULT false,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "accountManagerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LawFirm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LawFirm_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LawFirm_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "AccountManager" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LawFirm" ("adres", "aktywna", "autoRenewal", "callaPolska", "createdAt", "dataPakietuDo", "dataPakietuOd", "edukacja", "emailKontakt", "filmYouTube", "galeriaZdjec", "godzinyOtwarcia", "id", "imieKontakt", "kodPocztowy", "kolejnoscMultimedia", "konwersja", "krs", "linkFacebook", "linkInstagram", "linkLinkedIn", "linkTikTok", "linkTwitter", "logo", "miasto", "nazwa", "nazwaFirmy", "nazwiskoKontakt", "nip", "numerTelefonu", "numerTelefonu2", "oirpMiasto", "oirpStatus", "oirpWpis", "okladkaFilmu", "onlineOnly", "opis", "oraMiasto", "oraStatus", "oraWpis", "pakietSubskrypcji", "pozycjaRanking", "punktySaldo", "regon", "slowaKluczowe", "slug", "statusGodzinyOtwarcia", "stronaWww", "typ", "typInny", "typOferty", "unikatowyOpisUslugi", "updatedAt", "userId", "voivodeshipId", "wygraneOferty", "wyswietleniaProfilu", "zdjecieGlowne", "zgodaPrzetwarzanie", "zgodaRegulamin", "zlozoneOferty", "zweryfikowana") SELECT "adres", "aktywna", "autoRenewal", "callaPolska", "createdAt", "dataPakietuDo", "dataPakietuOd", "edukacja", "emailKontakt", "filmYouTube", "galeriaZdjec", "godzinyOtwarcia", "id", "imieKontakt", "kodPocztowy", "kolejnoscMultimedia", "konwersja", "krs", "linkFacebook", "linkInstagram", "linkLinkedIn", "linkTikTok", "linkTwitter", "logo", "miasto", "nazwa", "nazwaFirmy", "nazwiskoKontakt", "nip", "numerTelefonu", "numerTelefonu2", "oirpMiasto", "oirpStatus", "oirpWpis", "okladkaFilmu", "onlineOnly", "opis", "oraMiasto", "oraStatus", "oraWpis", "pakietSubskrypcji", "pozycjaRanking", "punktySaldo", "regon", "slowaKluczowe", "slug", "statusGodzinyOtwarcia", "stronaWww", "typ", "typInny", "typOferty", "unikatowyOpisUslugi", "updatedAt", "userId", "voivodeshipId", "wygraneOferty", "wyswietleniaProfilu", "zdjecieGlowne", "zgodaPrzetwarzanie", "zgodaRegulamin", "zlozoneOferty", "zweryfikowana" FROM "LawFirm";
DROP TABLE "LawFirm";
ALTER TABLE "new_LawFirm" RENAME TO "LawFirm";
CREATE UNIQUE INDEX "LawFirm_userId_key" ON "LawFirm"("userId");
CREATE UNIQUE INDEX "LawFirm_slug_key" ON "LawFirm"("slug");
CREATE UNIQUE INDEX "LawFirm_nip_key" ON "LawFirm"("nip");
CREATE INDEX "LawFirm_userId_idx" ON "LawFirm"("userId");
CREATE INDEX "LawFirm_voivodeshipId_idx" ON "LawFirm"("voivodeshipId");
CREATE INDEX "LawFirm_nip_idx" ON "LawFirm"("nip");
CREATE INDEX "LawFirm_zweryfikowana_idx" ON "LawFirm"("zweryfikowana");
CREATE INDEX "LawFirm_aktywna_idx" ON "LawFirm"("aktywna");
CREATE INDEX "LawFirm_accountManagerId_idx" ON "LawFirm"("accountManagerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "UserBlock_blockerId_idx" ON "UserBlock"("blockerId");

-- CreateIndex
CREATE INDEX "UserBlock_blockedId_idx" ON "UserBlock"("blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBlock_blockerId_blockedId_key" ON "UserBlock"("blockerId", "blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "UserOnlineStatus_userId_key" ON "UserOnlineStatus"("userId");

-- CreateIndex
CREATE INDEX "UserOnlineStatus_userId_idx" ON "UserOnlineStatus"("userId");

-- CreateIndex
CREATE INDEX "UserOnlineStatus_isOnline_idx" ON "UserOnlineStatus"("isOnline");

-- CreateIndex
CREATE INDEX "UserOnlineStatus_lastSeen_idx" ON "UserOnlineStatus"("lastSeen");

-- CreateIndex
CREATE INDEX "TypingIndicator_conversationId_idx" ON "TypingIndicator"("conversationId");

-- CreateIndex
CREATE INDEX "TypingIndicator_userId_idx" ON "TypingIndicator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TypingIndicator_conversationId_userId_key" ON "TypingIndicator"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "PromotionStats_promotionId_idx" ON "PromotionStats"("promotionId");

-- CreateIndex
CREATE INDEX "PromotionStats_date_idx" ON "PromotionStats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionStats_promotionId_date_key" ON "PromotionStats"("promotionId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AccountManager_email_key" ON "AccountManager"("email");

-- CreateIndex
CREATE INDEX "AccountManager_email_idx" ON "AccountManager"("email");

-- CreateIndex
CREATE INDEX "AccountManager_aktywny_idx" ON "AccountManager"("aktywny");

-- CreateIndex
CREATE INDEX "EmailTemplate_typ_idx" ON "EmailTemplate"("typ");

-- CreateIndex
CREATE INDEX "EmailTemplate_aktywny_idx" ON "EmailTemplate"("aktywny");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_typ_key" ON "EmailTemplate"("typ");
