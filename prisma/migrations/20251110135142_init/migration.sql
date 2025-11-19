-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLogin" DATETIME
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "imie" TEXT NOT NULL,
    "nazwisko" TEXT NOT NULL,
    "telefon" TEXT,
    "adres" TEXT,
    "kodPocztowy" TEXT,
    "miasto" TEXT,
    "voivodeshipId" TEXT,
    "zgodaRegulamin" BOOLEAN NOT NULL DEFAULT false,
    "zgodaNewsletter" BOOLEAN NOT NULL DEFAULT false,
    "zgodaMarketing" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Client_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LawFirm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "typInny" TEXT,
    "nazwa" TEXT NOT NULL,
    "nazwaFirmy" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "regon" TEXT,
    "krs" TEXT,
    "imieKontakt" TEXT NOT NULL,
    "nazwiskoKontakt" TEXT NOT NULL,
    "stanowisko" TEXT,
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
    "wyswietleniaProfilu" INTEGER NOT NULL DEFAULT 0,
    "zlozoneOferty" INTEGER NOT NULL DEFAULT 0,
    "wygraneOferty" INTEGER NOT NULL DEFAULT 0,
    "konwersja" REAL NOT NULL DEFAULT 0,
    "pozycjaRanking" INTEGER,
    "zgodaRegulamin" BOOLEAN NOT NULL DEFAULT false,
    "zgodaPrzetwarzanie" BOOLEAN NOT NULL DEFAULT false,
    "zweryfikowana" BOOLEAN NOT NULL DEFAULT false,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LawFirm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LawFirm_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LawFirmVoivodeship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "voivodeshipId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LawFirmVoivodeship_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LawFirmVoivodeship_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FavoriteLawFirm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FavoriteLawFirm_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FavoriteLawFirm_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nazwa" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "opis" TEXT,
    "parentId" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "kolejnosc" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LawFirmCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LawFirmCategory_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LawFirmCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "typSprawy" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "wybranadziedzinaPrawa" TEXT,
    "wybranaSpecyfikacja" TEXT,
    "specjalizacja" TEXT,
    "nazwaSprawy" TEXT NOT NULL,
    "opisSprawy" TEXT NOT NULL,
    "zalaczniki" TEXT,
    "oczekiwanyTerminRealizacji" DATETIME,
    "trybPilny" BOOLEAN NOT NULL DEFAULT false,
    "budzetOd" REAL,
    "budzetDo" REAL,
    "doNegocjacji" BOOLEAN NOT NULL DEFAULT false,
    "imieNazwisko" TEXT NOT NULL,
    "emailKontakt" TEXT NOT NULL,
    "telefonKontakt" TEXT NOT NULL,
    "preferowanyKontakt" TEXT NOT NULL,
    "voivodeshipId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOWA',
    "akceptujeKlauzule" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "zamknieto" DATETIME,
    CONSTRAINT "Case_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Case_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Case_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "kwotaNetto" REAL NOT NULL,
    "vat" INTEGER NOT NULL,
    "kwotaBrutto" REAL NOT NULL,
    "terminRealizacjiDni" INTEGER NOT NULL,
    "opisOferty" TEXT NOT NULL,
    "zakresUslug" TEXT NOT NULL,
    "warunkiPlatnosci" TEXT NOT NULL,
    "dodatkoweWarunki" TEXT,
    "wyroznienie" BOOLEAN NOT NULL DEFAULT false,
    "punktyWyroznienia" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ZLOZONA',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "zaakceptowanaData" DATETIME,
    "odrzuconaData" DATETIME,
    CONSTRAINT "Offer_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Offer_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Negotiation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "propozycjaKwoty" REAL NOT NULL,
    "uzasadnienie" TEXT NOT NULL,
    "terminRealizacji" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Negotiation_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Negotiation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "caseId" TEXT,
    "temat" TEXT NOT NULL,
    "tresc" TEXT NOT NULL,
    "zalaczniki" TEXT,
    "przeczytana" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "ocenaOgolna" INTEGER NOT NULL,
    "profesjonalizm" INTEGER,
    "komunikacja" INTEGER,
    "terminowosc" INTEGER,
    "stosunekJakosci" INTEGER,
    "tytulOpinii" TEXT NOT NULL,
    "trescOpinii" TEXT NOT NULL,
    "polecam" BOOLEAN NOT NULL DEFAULT true,
    "anonimowa" BOOLEAN NOT NULL DEFAULT false,
    "odpowiedz" TEXT,
    "dataOdpowiedzi" DATETIME,
    "zweryfikowana" BOOLEAN NOT NULL DEFAULT false,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "nazwaUslugi" TEXT NOT NULL,
    "opisUslugi" TEXT NOT NULL,
    "cenaOd" REAL,
    "cenaDo" REAL,
    "jednostka" TEXT NOT NULL,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Service_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "nazwaCertyfikatu" TEXT NOT NULL,
    "wydawca" TEXT NOT NULL,
    "dataUzyskania" DATETIME NOT NULL,
    "dataWaznosci" DATETIME,
    "numerCertyfikatu" TEXT,
    "skanCertyfikatu" TEXT NOT NULL,
    "aktywny" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Certificate_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "tytul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tresc" TEXT NOT NULL,
    "kategoriaWpisu" TEXT,
    "tagi" TEXT,
    "obrazekWyrozniajacy" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "opublikowany" BOOLEAN NOT NULL DEFAULT false,
    "dataPublikacji" DATETIME,
    "wyswietlenia" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BlogPost_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlogComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blogPostId" TEXT NOT NULL,
    "userId" TEXT,
    "author" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "url" TEXT,
    "comment" TEXT NOT NULL,
    "zatwierdzony" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlogComment_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "pakietPunktow" TEXT NOT NULL,
    "liczbaPunktow" INTEGER NOT NULL,
    "kwota" REAL NOT NULL,
    "metodaPlatnosci" TEXT NOT NULL,
    "statusPlatnosci" TEXT NOT NULL DEFAULT 'OCZEKUJE',
    "daneFaktury" TEXT,
    "externalOrderId" TEXT,
    "transactionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "zaplaconoData" DATETIME,
    CONSTRAINT "Order_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawFirmId" TEXT NOT NULL,
    "typPromocji" TEXT NOT NULL,
    "czasTrwaniaDni" INTEGER NOT NULL,
    "kategoriaPromocji" TEXT,
    "wojewodztwoPromocji" TEXT,
    "startPromocji" DATETIME NOT NULL,
    "koniecPromocji" DATETIME NOT NULL,
    "kosztPunktow" INTEGER NOT NULL,
    "automatyczneOdnowienie" BOOLEAN NOT NULL DEFAULT false,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Promotion_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "tytul" TEXT NOT NULL,
    "tresc" TEXT NOT NULL,
    "linkUrl" TEXT,
    "przeczytane" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "emailNoweOferty" BOOLEAN NOT NULL DEFAULT true,
    "emailWiadomosci" BOOLEAN NOT NULL DEFAULT true,
    "emailStatusy" BOOLEAN NOT NULL DEFAULT true,
    "smsPilne" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Voivodeship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nazwa" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nazwa" TEXT NOT NULL,
    "voivodeshipId" TEXT NOT NULL,
    CONSTRAINT "City_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Newsletter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "imie" TEXT,
    "zgoda" BOOLEAN NOT NULL DEFAULT true,
    "aktywny" BOOLEAN NOT NULL DEFAULT true,
    "dataZapisu" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataRezygnacji" DATETIME
);

-- CreateTable
CREATE TABLE "ContactForm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imieNazwisko" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefon" TEXT,
    "temat" TEXT NOT NULL,
    "wiadomosc" TEXT NOT NULL,
    "zalacznik" TEXT,
    "odpowiedziano" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");

-- CreateIndex
CREATE INDEX "Client_userId_idx" ON "Client"("userId");

-- CreateIndex
CREATE INDEX "Client_voivodeshipId_idx" ON "Client"("voivodeshipId");

-- CreateIndex
CREATE UNIQUE INDEX "LawFirm_userId_key" ON "LawFirm"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LawFirm_nip_key" ON "LawFirm"("nip");

-- CreateIndex
CREATE INDEX "LawFirm_userId_idx" ON "LawFirm"("userId");

-- CreateIndex
CREATE INDEX "LawFirm_voivodeshipId_idx" ON "LawFirm"("voivodeshipId");

-- CreateIndex
CREATE INDEX "LawFirm_nip_idx" ON "LawFirm"("nip");

-- CreateIndex
CREATE INDEX "LawFirm_zweryfikowana_idx" ON "LawFirm"("zweryfikowana");

-- CreateIndex
CREATE INDEX "LawFirm_aktywna_idx" ON "LawFirm"("aktywna");

-- CreateIndex
CREATE INDEX "LawFirmVoivodeship_lawFirmId_idx" ON "LawFirmVoivodeship"("lawFirmId");

-- CreateIndex
CREATE INDEX "LawFirmVoivodeship_voivodeshipId_idx" ON "LawFirmVoivodeship"("voivodeshipId");

-- CreateIndex
CREATE UNIQUE INDEX "LawFirmVoivodeship_lawFirmId_voivodeshipId_key" ON "LawFirmVoivodeship"("lawFirmId", "voivodeshipId");

-- CreateIndex
CREATE INDEX "FavoriteLawFirm_clientId_idx" ON "FavoriteLawFirm"("clientId");

-- CreateIndex
CREATE INDEX "FavoriteLawFirm_lawFirmId_idx" ON "FavoriteLawFirm"("lawFirmId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteLawFirm_clientId_lawFirmId_key" ON "FavoriteLawFirm"("clientId", "lawFirmId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Category_aktywna_idx" ON "Category"("aktywna");

-- CreateIndex
CREATE INDEX "LawFirmCategory_lawFirmId_idx" ON "LawFirmCategory"("lawFirmId");

-- CreateIndex
CREATE INDEX "LawFirmCategory_categoryId_idx" ON "LawFirmCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "LawFirmCategory_lawFirmId_categoryId_key" ON "LawFirmCategory"("lawFirmId", "categoryId");

-- CreateIndex
CREATE INDEX "Case_clientId_idx" ON "Case"("clientId");

-- CreateIndex
CREATE INDEX "Case_categoryId_idx" ON "Case"("categoryId");

-- CreateIndex
CREATE INDEX "Case_voivodeshipId_idx" ON "Case"("voivodeshipId");

-- CreateIndex
CREATE INDEX "Case_status_idx" ON "Case"("status");

-- CreateIndex
CREATE INDEX "Case_createdAt_idx" ON "Case"("createdAt");

-- CreateIndex
CREATE INDEX "Offer_caseId_idx" ON "Offer"("caseId");

-- CreateIndex
CREATE INDEX "Offer_lawFirmId_idx" ON "Offer"("lawFirmId");

-- CreateIndex
CREATE INDEX "Offer_status_idx" ON "Offer"("status");

-- CreateIndex
CREATE INDEX "Offer_createdAt_idx" ON "Offer"("createdAt");

-- CreateIndex
CREATE INDEX "Negotiation_offerId_idx" ON "Negotiation"("offerId");

-- CreateIndex
CREATE INDEX "Negotiation_clientId_idx" ON "Negotiation"("clientId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_receiverId_idx" ON "Message"("receiverId");

-- CreateIndex
CREATE INDEX "Message_caseId_idx" ON "Message"("caseId");

-- CreateIndex
CREATE INDEX "Message_przeczytana_idx" ON "Message"("przeczytana");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Review_lawFirmId_idx" ON "Review"("lawFirmId");

-- CreateIndex
CREATE INDEX "Review_clientId_idx" ON "Review"("clientId");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

-- CreateIndex
CREATE INDEX "Review_aktywna_idx" ON "Review"("aktywna");

-- CreateIndex
CREATE INDEX "Service_lawFirmId_idx" ON "Service"("lawFirmId");

-- CreateIndex
CREATE INDEX "Service_aktywna_idx" ON "Service"("aktywna");

-- CreateIndex
CREATE INDEX "Certificate_lawFirmId_idx" ON "Certificate"("lawFirmId");

-- CreateIndex
CREATE INDEX "Certificate_aktywny_idx" ON "Certificate"("aktywny");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_lawFirmId_idx" ON "BlogPost"("lawFirmId");

-- CreateIndex
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_opublikowany_idx" ON "BlogPost"("opublikowany");

-- CreateIndex
CREATE INDEX "BlogComment_blogPostId_idx" ON "BlogComment"("blogPostId");

-- CreateIndex
CREATE INDEX "BlogComment_zatwierdzony_idx" ON "BlogComment"("zatwierdzony");

-- CreateIndex
CREATE INDEX "Order_lawFirmId_idx" ON "Order"("lawFirmId");

-- CreateIndex
CREATE INDEX "Order_statusPlatnosci_idx" ON "Order"("statusPlatnosci");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Promotion_lawFirmId_idx" ON "Promotion"("lawFirmId");

-- CreateIndex
CREATE INDEX "Promotion_aktywna_idx" ON "Promotion"("aktywna");

-- CreateIndex
CREATE INDEX "Promotion_startPromocji_idx" ON "Promotion"("startPromocji");

-- CreateIndex
CREATE INDEX "Promotion_koniecPromocji_idx" ON "Promotion"("koniecPromocji");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_przeczytane_idx" ON "Notification"("przeczytane");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSettings_userId_key" ON "NotificationSettings"("userId");

-- CreateIndex
CREATE INDEX "NotificationSettings_userId_idx" ON "NotificationSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Voivodeship_nazwa_key" ON "Voivodeship"("nazwa");

-- CreateIndex
CREATE UNIQUE INDEX "Voivodeship_slug_key" ON "Voivodeship"("slug");

-- CreateIndex
CREATE INDEX "Voivodeship_slug_idx" ON "Voivodeship"("slug");

-- CreateIndex
CREATE INDEX "City_voivodeshipId_idx" ON "City"("voivodeshipId");

-- CreateIndex
CREATE INDEX "City_nazwa_idx" ON "City"("nazwa");

-- CreateIndex
CREATE UNIQUE INDEX "Newsletter_email_key" ON "Newsletter"("email");

-- CreateIndex
CREATE INDEX "Newsletter_email_idx" ON "Newsletter"("email");

-- CreateIndex
CREATE INDEX "Newsletter_aktywny_idx" ON "Newsletter"("aktywny");

-- CreateIndex
CREATE INDEX "ContactForm_odpowiedziano_idx" ON "ContactForm"("odpowiedziano");

-- CreateIndex
CREATE INDEX "ContactForm_createdAt_idx" ON "ContactForm"("createdAt");
