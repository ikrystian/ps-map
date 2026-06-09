-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'LAW_FIRM', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('INDIVIDUAL', 'BUSINESS');

-- CreateEnum
CREATE TYPE "LawFirmType" AS ENUM ('OSOBA_FIZYCZNA', 'SPOLKA_CYWILNA', 'SPOLKA_PARTNERSKA', 'SPOLKA_KOMANDYTOWA', 'SPOLKA_JAWNA', 'SPOLKA_ZOO', 'INNY');

-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('STALA_WSPOLPRACA', 'JEDNORAZOWA_USLUGA', 'KONSULTACJA', 'WSZYSTKIE');

-- CreateEnum
CREATE TYPE "SubscriptionPackage" AS ENUM ('PODSTAWOWY', 'STANDARD', 'PREMIUM', 'BIZNES');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('SPRAWY_FIRMOWE', 'SPRAWY_PRYWATNE');

-- CreateEnum
CREATE TYPE "CaseType" AS ENUM ('OSOBA_PRYWATNA', 'FIRMA', 'ORGANIZACJA');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('NOWA', 'OFERTY_OTRZYMANE', 'W_TRAKCIE', 'ZAKONCZONA', 'ANULOWANA');

-- CreateEnum
CREATE TYPE "PreferredContact" AS ENUM ('EMAIL', 'TELEFON', 'OBA');

-- CreateEnum
CREATE TYPE "PaymentTerms" AS ENUM ('PRZELEW_7', 'PRZELEW_14', 'PRZELEW_30', 'Z_GORY', 'RATY', 'INNY');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('ZLOZONA', 'ZAAKCEPTOWANA', 'ODRZUCONA', 'NEGOCJACJE', 'WYGASLA');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENDING', 'SENT', 'DELIVERED', 'READ', 'ERROR');

-- CreateEnum
CREATE TYPE "ServiceUnit" AS ENUM ('ZA_USLUGE', 'ZA_GODZINE', 'RYCZALT', 'DO_UZGODNIENIA');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('POINTS', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PAYU', 'PRZELEWY24', 'PRZELEW', 'PAYPAL', 'BACS', 'POINTS', 'TEST', 'TPAY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('OCZEKUJE', 'ZAPLACONE', 'ANULOWANE', 'ZWROT');

-- CreateEnum
CREATE TYPE "PointTransactionType" AS ENUM ('SUBSCRIPTION_PURCHASE', 'POINTS_PURCHASE', 'PROMOTION_PURCHASE', 'OFFER_HIGHLIGHT', 'PARTNER_BONUS', 'ADMIN_ADJUSTMENT', 'REFUND', 'SUBSCRIPTION_BONUS', 'REVIEW_DELETE');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('PODBICIE_OGLOSZENIA', 'WYROZNIENIE', 'TOP_LISTA', 'STRONA_GLOWNA', 'POLECANI_PRAWNICY', 'NAJCZESCIEJ_KONSULTOWANE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NOWA_OFERTA', 'NOWA_WIADOMOSC', 'ZMIANA_STATUSU', 'NOWA_OPINIA', 'MALY_STAN_PUNKTOW', 'KONIEC_SUBSKRYPCJI', 'NOWA_KONSULTACJA', 'KONSULTACJA_ZAAKCEPTOWANA', 'KONSULTACJA_ODRZUCONA', 'KONSULTACJA_ZAPLACONA', 'KONSULTACJA_ANULOWANA', 'SYSTEM');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'SENT', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContactSubject" AS ENUM ('INFORMACJA', 'WSPARCIE', 'WSPOLPRACA', 'REKLAMACJA', 'INNE');

-- CreateEnum
CREATE TYPE "ModuleType" AS ENUM ('TEMPLATE', 'EDITABLE_HTML');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('NOWA_SPRAWA', 'NOWA_OFERTA', 'AKCEPTACJA_OFERTY', 'ODRZUCENIE_OFERTY', 'NOWA_WIADOMOSC', 'NOWA_OPINIA', 'REJESTRACJA_KLIENT', 'REJESTRACJA_KANCELARIA', 'RESET_HASLA', 'POTWIERDZENIE_EMAIL', 'PLATNOSC_POTWIERDZONA', 'SUBSKRYPCJA_WYGASA', 'NISKI_STAN_PUNKTOW', 'CUSTOM', 'POTWIERDZENIE_DODANIA_SPRAWY', 'SUBSKRYPCJA_KONIEC', 'PROSBA_O_OCENE', 'NOWA_KONSULTACJA', 'KONSULTACJA_ZAAKCEPTOWANA', 'KONSULTACJA_ZAAKCEPTOWANA_EKSPERT', 'KONSULTACJA_ODRZUCONA', 'KONSULTACJA_ZAPLACONA', 'KONSULTACJA_ANULOWANA', 'PRZYPOMNIENIE_KONSULTACJI', 'LINK_KONSULTACJI');

-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmailLogStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "BadgeConditionType" AS ENUM ('YEARS_IN_SERVICE', 'WON_CASES', 'REVIEWS_COUNT', 'BLOG_POSTS_COUNT', 'OFFERS_SUBMITTED', 'PROFILE_VIEWS');

-- CreateEnum
CREATE TYPE "ScheduledEmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JobRunStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLogin" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientType" "ClientType" NOT NULL DEFAULT 'INDIVIDUAL',
    "imie" TEXT NOT NULL,
    "nazwisko" TEXT NOT NULL,
    "telefon" TEXT,
    "nazwaFirmy" TEXT,
    "nip" TEXT,
    "regon" TEXT,
    "krs" TEXT,
    "adres" TEXT,
    "kodPocztowy" TEXT,
    "miasto" TEXT,
    "voivodeshipId" TEXT,
    "zgodaRegulamin" BOOLEAN NOT NULL DEFAULT false,
    "zgodaNewsletter" BOOLEAN NOT NULL DEFAULT false,
    "zgodaMarketing" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "punktySaldo" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawFirm" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "typ" "LawFirmType" NOT NULL,
    "typInny" TEXT,
    "nazwa" TEXT NOT NULL,
    "nazwaFirmy" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
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
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
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
    "mainCategoryId" TEXT,
    "callaPolska" BOOLEAN NOT NULL DEFAULT false,
    "onlineOnly" BOOLEAN NOT NULL DEFAULT false,
    "typOferty" "OfferType" NOT NULL,
    "punktySaldo" INTEGER NOT NULL DEFAULT 0,
    "pakietSubskrypcji" "SubscriptionPackage",
    "dataPakietuOd" TIMESTAMP(3),
    "dataPakietuDo" TIMESTAMP(3),
    "autoRenewal" BOOLEAN NOT NULL DEFAULT false,
    "wyswietleniaProfilu" INTEGER NOT NULL DEFAULT 0,
    "zlozoneOferty" INTEGER NOT NULL DEFAULT 0,
    "wygraneOferty" INTEGER NOT NULL DEFAULT 0,
    "konwersja" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pozycjaRanking" INTEGER,
    "zgodaRegulamin" BOOLEAN NOT NULL DEFAULT false,
    "zgodaPrzetwarzanie" BOOLEAN NOT NULL DEFAULT false,
    "zweryfikowana" BOOLEAN NOT NULL DEFAULT false,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "accountManagerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LawFirm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawFirmVoivodeship" (
    "id" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "voivodeshipId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LawFirmVoivodeship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawFirmCity" (
    "id" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LawFirmCity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteLawFirm" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteLawFirm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "nazwa" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "opis" TEXT,
    "opisDodatkowy" TEXT,
    "ikona" TEXT,
    "ikonaUrl" TEXT,
    "backgroundImageUrl" TEXT,
    "typ" "CategoryType" NOT NULL DEFAULT 'SPRAWY_PRYWATNE',
    "parentId" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "kolejnosc" INTEGER NOT NULL DEFAULT 0,
    "wyswietlajNaGlownejPrywatne" BOOLEAN NOT NULL DEFAULT false,
    "wyswietlajNaGlownejFirmowe" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawFirmCategory" (
    "id" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "kolejnosc" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LawFirmCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "typSprawy" "CaseType" NOT NULL,
    "categoryId" TEXT NOT NULL,
    "wybranadziedzinaPrawa" TEXT,
    "wybranaSpecyfikacja" TEXT,
    "specjalizacja" TEXT,
    "nazwaSprawy" TEXT NOT NULL,
    "opisSprawy" TEXT NOT NULL,
    "zalaczniki" TEXT,
    "oczekiwanyTerminRealizacji" TIMESTAMP(3),
    "trybPilny" BOOLEAN NOT NULL DEFAULT false,
    "budzetOd" DOUBLE PRECISION,
    "budzetDo" DOUBLE PRECISION,
    "doNegocjacji" BOOLEAN NOT NULL DEFAULT false,
    "imieNazwisko" TEXT NOT NULL,
    "emailKontakt" TEXT NOT NULL,
    "telefonKontakt" TEXT NOT NULL,
    "preferowanyKontakt" "PreferredContact" NOT NULL,
    "voivodeshipId" TEXT NOT NULL,
    "cityId" TEXT,
    "status" "CaseStatus" NOT NULL DEFAULT 'NOWA',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "akceptujeKlauzule" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "zamknieto" TIMESTAMP(3),

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "kwotaNetto" DOUBLE PRECISION NOT NULL,
    "vat" INTEGER NOT NULL,
    "kwotaBrutto" DOUBLE PRECISION NOT NULL,
    "terminRealizacjiDni" INTEGER NOT NULL,
    "opisOferty" TEXT NOT NULL,
    "zakresUslug" TEXT NOT NULL,
    "warunkiPlatnosci" "PaymentTerms" NOT NULL,
    "dodatkoweWarunki" TEXT,
    "wyroznienie" BOOLEAN NOT NULL DEFAULT false,
    "punktyWyroznienia" INTEGER,
    "status" "OfferStatus" NOT NULL DEFAULT 'ZLOZONA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "zaakceptowanaData" TIMESTAMP(3),
    "odrzuconaData" TIMESTAMP(3),

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Negotiation" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "propozycjaKwoty" DOUBLE PRECISION NOT NULL,
    "uzasadnienie" TEXT NOT NULL,
    "terminRealizacji" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Negotiation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "caseId" TEXT,
    "temat" TEXT NOT NULL,
    "tresc" TEXT NOT NULL,
    "zalaczniki" TEXT,
    "przeczytana" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "clientUserId" TEXT NOT NULL,
    "lawFirmUserId" TEXT NOT NULL,
    "lastMessageText" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "lastMessageSenderId" TEXT,
    "isArchivedByClient" BOOLEAN NOT NULL DEFAULT false,
    "archivedByClientAt" TIMESTAMP(3),
    "isArchivedByLawFirm" BOOLEAN NOT NULL DEFAULT false,
    "archivedByLawFirmAt" TIMESTAMP(3),
    "isDeletedByClient" BOOLEAN NOT NULL DEFAULT false,
    "deletedByClientAt" TIMESTAMP(3),
    "isDeletedByLawFirm" BOOLEAN NOT NULL DEFAULT false,
    "deletedByLawFirmAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentIv" TEXT,
    "attachments" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "deliveredAt" TIMESTAMP(3),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBlock" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOnlineStatus" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserOnlineStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypingIndicator" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isTyping" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypingIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
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
    "dataOdpowiedzi" TIMESTAMP(3),
    "zweryfikowana" BOOLEAN NOT NULL DEFAULT false,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "nazwaUslugi" TEXT NOT NULL,
    "opisUslugi" TEXT NOT NULL,
    "cenaOd" DOUBLE PRECISION,
    "cenaDo" DOUBLE PRECISION,
    "jednostka" "ServiceUnit" NOT NULL,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "nazwaCertyfikatu" TEXT NOT NULL,
    "wydawca" TEXT NOT NULL,
    "dataUzyskania" TIMESTAMP(3) NOT NULL,
    "dataWaznosci" TIMESTAMP(3),
    "numerCertyfikatu" TEXT,
    "skanCertyfikatu" TEXT NOT NULL,
    "aktywny" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL,
    "nazwa" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "opis" TEXT,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "lawFirmId" TEXT,
    "isSponsored" BOOLEAN NOT NULL DEFAULT false,
    "sponsoredLawFirmId" TEXT,
    "tytul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tresc" TEXT NOT NULL,
    "categoryId" TEXT,
    "tagi" TEXT,
    "obrazekWyrozniajacy" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "opublikowany" BOOLEAN NOT NULL DEFAULT false,
    "dataPublikacji" TIMESTAMP(3),
    "wyswietlenia" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT,
    "lawFirmId" TEXT NOT NULL,
    "orderType" "OrderType" NOT NULL DEFAULT 'POINTS',
    "pakietPunktow" TEXT,
    "liczbaPunktow" INTEGER,
    "subscriptionPlanId" TEXT,
    "subscriptionPeriod" INTEGER,
    "packageStartDate" TIMESTAMP(3),
    "packageEndDate" TIMESTAMP(3),
    "kwota" DOUBLE PRECISION NOT NULL,
    "punktyKoszt" INTEGER,
    "metodaPlatnosci" "PaymentMethod" NOT NULL,
    "statusPlatnosci" "PaymentStatus" NOT NULL DEFAULT 'OCZEKUJE',
    "daneFaktury" TEXT,
    "externalOrderId" TEXT,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "zaplaconoData" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointTransaction" (
    "id" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "type" "PointTransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "typPromocji" "PromotionType" NOT NULL,
    "czasTrwaniaDni" INTEGER NOT NULL,
    "kategoriaPromocji" TEXT,
    "wojewodztwoPromocji" TEXT,
    "startPromocji" TIMESTAMP(3) NOT NULL,
    "koniecPromocji" TIMESTAMP(3) NOT NULL,
    "kosztPunktow" INTEGER NOT NULL,
    "automatyczneOdnowienie" BOOLEAN NOT NULL DEFAULT false,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionConfig" (
    "id" TEXT NOT NULL,
    "type" "PromotionType" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pointsPerDay" INTEGER,
    "pointsPerWeek" INTEGER,
    "pointsPerMonth" INTEGER,
    "features" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "kolejnosc" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionStats" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "profileClicks" INTEGER NOT NULL DEFAULT 0,
    "contactClicks" INTEGER NOT NULL DEFAULT 0,
    "offersSent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "typ" "NotificationType" NOT NULL,
    "tytul" TEXT NOT NULL,
    "tresc" TEXT NOT NULL,
    "linkUrl" TEXT,
    "przeczytane" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isConfigured" BOOLEAN NOT NULL DEFAULT false,
    "emailNoweOferty" BOOLEAN NOT NULL DEFAULT true,
    "emailWiadomosci" BOOLEAN NOT NULL DEFAULT true,
    "emailStatusy" BOOLEAN NOT NULL DEFAULT true,
    "smsPilne" BOOLEAN NOT NULL DEFAULT false,
    "kontaktKlienci" BOOLEAN NOT NULL DEFAULT true,
    "kluczowe" BOOLEAN NOT NULL DEFAULT true,
    "wskazowkiPorady" BOOLEAN NOT NULL DEFAULT true,
    "ofertPromocje" BOOLEAN NOT NULL DEFAULT true,
    "przypomnienieWiadomosci" BOOLEAN NOT NULL DEFAULT true,
    "noweFunkcje" BOOLEAN NOT NULL DEFAULT true,
    "zmianyCenniki" BOOLEAN NOT NULL DEFAULT true,
    "zmianyRegulamin" BOOLEAN NOT NULL DEFAULT true,
    "kontaktDoradca" BOOLEAN NOT NULL DEFAULT false,
    "wyswietlanieAwatara" BOOLEAN NOT NULL DEFAULT true,
    "autoProsbOpinie" BOOLEAN NOT NULL DEFAULT false,
    "powiadomienieDzwiekowe" BOOLEAN NOT NULL DEFAULT false,
    "ustawieniaOgloszenia" BOOLEAN NOT NULL DEFAULT true,
    "powiadomieniaSmNowa" BOOLEAN NOT NULL DEFAULT false,
    "wiadomosciZbiorcze" BOOLEAN NOT NULL DEFAULT true,
    "urlop" BOOLEAN NOT NULL DEFAULT false,
    "welcomePackageSeen" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voivodeship" (
    "id" TEXT NOT NULL,
    "nazwa" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Voivodeship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "nazwa" TEXT NOT NULL,
    "voivodeshipId" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostalCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,

    CONSTRAINT "PostalCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Newsletter" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "imie" TEXT,
    "zgoda" BOOLEAN NOT NULL DEFAULT true,
    "aktywny" BOOLEAN NOT NULL DEFAULT true,
    "potwierdzony" BOOLEAN NOT NULL DEFAULT false,
    "tokenPotwierdzajacy" TEXT,
    "unsubscribeToken" TEXT,
    "dataPotwierdzenia" TIMESTAMP(3),
    "dataZapisu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataRezygnacji" TIMESTAMP(3),

    CONSTRAINT "Newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "typ" "SubscriptionPackage" NOT NULL,
    "nazwa" TEXT NOT NULL,
    "cena1Miesiac" DOUBLE PRECISION,
    "cena6Miesiecy" DOUBLE PRECISION,
    "cena12Miesiecy" DOUBLE PRECISION NOT NULL,
    "aktywny" BOOLEAN NOT NULL DEFAULT true,
    "dostepDoSpraw" INTEGER,
    "kategorieSpraw" INTEGER,
    "wojewodztwa" INTEGER NOT NULL,
    "miasta" INTEGER NOT NULL,
    "priorytetWyszukiwanie" BOOLEAN NOT NULL DEFAULT false,
    "osobistyOpiekun" INTEGER NOT NULL DEFAULT 0,
    "artykutySponsoro" BOOLEAN NOT NULL DEFAULT false,
    "specjalneOznaczenie" TEXT,
    "statystykiAnalizy" BOOLEAN NOT NULL DEFAULT false,
    "mozliwoscBloga" BOOLEAN NOT NULL DEFAULT false,
    "wsparcieMarketingowe" BOOLEAN NOT NULL DEFAULT false,
    "promowanieProfilu" BOOLEAN NOT NULL DEFAULT false,
    "powiadomieniaSprawy" INTEGER NOT NULL DEFAULT 0,
    "liczbaTakow" INTEGER NOT NULL DEFAULT 0,
    "zalaczniki" BOOLEAN NOT NULL DEFAULT false,
    "coverBaner" BOOLEAN NOT NULL DEFAULT false,
    "wyswietlanieReklam" BOOLEAN NOT NULL DEFAULT true,
    "punktyGratis" INTEGER NOT NULL DEFAULT 0,
    "skillLawFocus" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerNIP" TEXT,
    "buyerAddress" TEXT NOT NULL,
    "buyerPostalCode" TEXT NOT NULL,
    "buyerCity" TEXT NOT NULL,
    "buyerCountry" TEXT NOT NULL DEFAULT 'Polska',
    "netAmount" DOUBLE PRECISION NOT NULL,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 23.0,
    "vatAmount" DOUBLE PRECISION NOT NULL,
    "grossAmount" DOUBLE PRECISION NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "pdfUrl" TEXT,
    "ksefNumber" TEXT,
    "ksefReferenceNumber" TEXT,
    "ksefStatus" TEXT,
    "ksefDiagnostics" TEXT,
    "upoContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactForm" (
    "id" TEXT NOT NULL,
    "imieNazwisko" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefon" TEXT,
    "temat" "ContactSubject" NOT NULL,
    "wiadomosc" TEXT NOT NULL,
    "zalacznik" TEXT,
    "odpowiedziano" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpCategory" (
    "id" TEXT NOT NULL,
    "nazwa" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "opis" TEXT,
    "ikona" TEXT,
    "kolejnosc" INTEGER NOT NULL DEFAULT 0,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "odbiorca" TEXT NOT NULL DEFAULT 'ALL',

    CONSTRAINT "HelpCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "preview" TEXT,
    "type" "ModuleType" NOT NULL DEFAULT 'TEMPLATE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpQuestion" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "pytanie" TEXT NOT NULL,
    "odpowiedz" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kolejnosc" INTEGER NOT NULL DEFAULT 0,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "wyswietlenia" INTEGER NOT NULL DEFAULT 0,
    "pomocne" INTEGER NOT NULL DEFAULT 0,
    "niepomocne" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawFirmStats" (
    "id" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "offersSubmitted" INTEGER NOT NULL DEFAULT 0,
    "offersAccepted" INTEGER NOT NULL DEFAULT 0,
    "offersRejected" INTEGER NOT NULL DEFAULT 0,
    "casesViewed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LawFirmStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawFirmCategoryStats" (
    "id" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "offersSubmitted" INTEGER NOT NULL DEFAULT 0,
    "offersAccepted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LawFirmCategoryStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "nazwa" TEXT NOT NULL,
    "typDokumentu" TEXT NOT NULL,
    "rozmiar" INTEGER NOT NULL,
    "sciezka" TEXT NOT NULL,
    "rozszerzenie" TEXT NOT NULL,
    "zrodlo" TEXT NOT NULL DEFAULT 'KANCELARIA',
    "clientUserId" TEXT,
    "conversationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageModule" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "data" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "action" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "userId" TEXT,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerProgram" (
    "id" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "bannerCode" TEXT NOT NULL,
    "bannerPlaced" BOOLEAN NOT NULL DEFAULT false,
    "lastVerificationDate" TIMESTAMP(3),
    "lastVerificationStatus" BOOLEAN NOT NULL DEFAULT false,
    "verificationFailCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "monthlyPoints" INTEGER NOT NULL DEFAULT 100,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerPointsHistory" (
    "id" TEXT NOT NULL,
    "partnerProgramId" TEXT NOT NULL,
    "pointsAwarded" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "verificationUrl" TEXT,
    "verificationStatus" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerPointsHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountManager" (
    "id" TEXT NOT NULL,
    "imie" TEXT NOT NULL,
    "nazwisko" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefon" TEXT,
    "avatar" TEXT,
    "aktywny" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "nazwa" TEXT NOT NULL,
    "temat" TEXT NOT NULL,
    "tresc" TEXT NOT NULL,
    "trescHtml" TEXT,
    "typ" "EmailType" NOT NULL,
    "aktywny" BOOLEAN NOT NULL DEFAULT true,
    "triggery" TEXT,
    "zmienne" TEXT,
    "opisZmiennych" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationAvailability" (
    "id" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "price15min" DOUBLE PRECISION NOT NULL,
    "price30min" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationBooking" (
    "id" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "consultationDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "topic" TEXT NOT NULL,
    "clientContact" TEXT NOT NULL,
    "status" "ConsultationStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'OCZEKUJE',
    "googleMeetUrl" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "conditionType" "BadgeConditionType" NOT NULL,
    "threshold" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawFirmBadge" (
    "id" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LawFirmBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT,
    "html" TEXT,
    "templateType" TEXT,
    "variables" TEXT,
    "status" "EmailLogStatus" NOT NULL,
    "errorMessage" TEXT,
    "smtpLog" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledEmail" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT,
    "html" TEXT,
    "templateType" "EmailType",
    "variables" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "ScheduledEmailStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advertisement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "linkUrl" TEXT NOT NULL,
    "htmlContent" TEXT,
    "location" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewReport" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageTestimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageTestimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderOverride" (
    "id" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledJob" (
    "jobName" TEXT NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "lastStatus" "JobRunStatus",
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledJob_pkey" PRIMARY KEY ("jobName")
);

-- CreateTable
CREATE TABLE "ScheduledJobRun" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "status" "JobRunStatus" NOT NULL,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "error" TEXT,
    "result" TEXT,
    "instanceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduledJobRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");

-- CreateIndex
CREATE INDEX "Client_userId_idx" ON "Client"("userId");

-- CreateIndex
CREATE INDEX "Client_voivodeshipId_idx" ON "Client"("voivodeshipId");

-- CreateIndex
CREATE UNIQUE INDEX "LawFirm_userId_key" ON "LawFirm"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LawFirm_slug_key" ON "LawFirm"("slug");

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
CREATE INDEX "LawFirm_accountManagerId_idx" ON "LawFirm"("accountManagerId");

-- CreateIndex
CREATE INDEX "LawFirm_mainCategoryId_idx" ON "LawFirm"("mainCategoryId");

-- CreateIndex
CREATE INDEX "LawFirmVoivodeship_lawFirmId_idx" ON "LawFirmVoivodeship"("lawFirmId");

-- CreateIndex
CREATE INDEX "LawFirmVoivodeship_voivodeshipId_idx" ON "LawFirmVoivodeship"("voivodeshipId");

-- CreateIndex
CREATE UNIQUE INDEX "LawFirmVoivodeship_lawFirmId_voivodeshipId_key" ON "LawFirmVoivodeship"("lawFirmId", "voivodeshipId");

-- CreateIndex
CREATE INDEX "LawFirmCity_lawFirmId_idx" ON "LawFirmCity"("lawFirmId");

-- CreateIndex
CREATE INDEX "LawFirmCity_cityId_idx" ON "LawFirmCity"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "LawFirmCity_lawFirmId_cityId_key" ON "LawFirmCity"("lawFirmId", "cityId");

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
CREATE INDEX "Category_typ_idx" ON "Category"("typ");

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
CREATE INDEX "Case_cityId_idx" ON "Case"("cityId");

-- CreateIndex
CREATE INDEX "Case_status_idx" ON "Case"("status");

-- CreateIndex
CREATE INDEX "Case_isArchived_idx" ON "Case"("isArchived");

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
CREATE INDEX "Conversation_clientUserId_idx" ON "Conversation"("clientUserId");

-- CreateIndex
CREATE INDEX "Conversation_lawFirmUserId_idx" ON "Conversation"("lawFirmUserId");

-- CreateIndex
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_isArchivedByClient_idx" ON "Conversation"("isArchivedByClient");

-- CreateIndex
CREATE INDEX "Conversation_isArchivedByLawFirm_idx" ON "Conversation"("isArchivedByLawFirm");

-- CreateIndex
CREATE INDEX "Conversation_isDeletedByClient_idx" ON "Conversation"("isDeletedByClient");

-- CreateIndex
CREATE INDEX "Conversation_isDeletedByLawFirm_idx" ON "Conversation"("isDeletedByLawFirm");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_clientUserId_lawFirmUserId_key" ON "Conversation"("clientUserId", "lawFirmUserId");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId");

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_isRead_idx" ON "ChatMessage"("isRead");

-- CreateIndex
CREATE INDEX "ChatMessage_status_idx" ON "ChatMessage"("status");

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
CREATE UNIQUE INDEX "BlogCategory_nazwa_key" ON "BlogCategory"("nazwa");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- CreateIndex
CREATE INDEX "BlogCategory_slug_idx" ON "BlogCategory"("slug");

-- CreateIndex
CREATE INDEX "BlogCategory_aktywna_idx" ON "BlogCategory"("aktywna");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_lawFirmId_idx" ON "BlogPost"("lawFirmId");

-- CreateIndex
CREATE INDEX "BlogPost_sponsoredLawFirmId_idx" ON "BlogPost"("sponsoredLawFirmId");

-- CreateIndex
CREATE INDEX "BlogPost_categoryId_idx" ON "BlogPost"("categoryId");

-- CreateIndex
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_opublikowany_idx" ON "BlogPost"("opublikowany");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_lawFirmId_idx" ON "Order"("lawFirmId");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_statusPlatnosci_idx" ON "Order"("statusPlatnosci");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_externalOrderId_idx" ON "Order"("externalOrderId");

-- CreateIndex
CREATE INDEX "PointTransaction_lawFirmId_idx" ON "PointTransaction"("lawFirmId");

-- CreateIndex
CREATE INDEX "PointTransaction_createdAt_idx" ON "PointTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "PointTransaction_type_idx" ON "PointTransaction"("type");

-- CreateIndex
CREATE INDEX "Promotion_lawFirmId_idx" ON "Promotion"("lawFirmId");

-- CreateIndex
CREATE INDEX "Promotion_aktywna_idx" ON "Promotion"("aktywna");

-- CreateIndex
CREATE INDEX "Promotion_startPromocji_idx" ON "Promotion"("startPromocji");

-- CreateIndex
CREATE INDEX "Promotion_koniecPromocji_idx" ON "Promotion"("koniecPromocji");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionConfig_type_key" ON "PromotionConfig"("type");

-- CreateIndex
CREATE INDEX "PromotionConfig_type_idx" ON "PromotionConfig"("type");

-- CreateIndex
CREATE INDEX "PromotionConfig_aktywna_idx" ON "PromotionConfig"("aktywna");

-- CreateIndex
CREATE INDEX "PromotionConfig_kolejnosc_idx" ON "PromotionConfig"("kolejnosc");

-- CreateIndex
CREATE INDEX "PromotionStats_promotionId_idx" ON "PromotionStats"("promotionId");

-- CreateIndex
CREATE INDEX "PromotionStats_date_idx" ON "PromotionStats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionStats_promotionId_date_key" ON "PromotionStats"("promotionId", "date");

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
CREATE INDEX "PostalCode_code_idx" ON "PostalCode"("code");

-- CreateIndex
CREATE INDEX "PostalCode_cityId_idx" ON "PostalCode"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "PostalCode_code_cityId_key" ON "PostalCode"("code", "cityId");

-- CreateIndex
CREATE UNIQUE INDEX "Newsletter_email_key" ON "Newsletter"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Newsletter_tokenPotwierdzajacy_key" ON "Newsletter"("tokenPotwierdzajacy");

-- CreateIndex
CREATE UNIQUE INDEX "Newsletter_unsubscribeToken_key" ON "Newsletter"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "Newsletter_email_idx" ON "Newsletter"("email");

-- CreateIndex
CREATE INDEX "Newsletter_aktywny_idx" ON "Newsletter"("aktywny");

-- CreateIndex
CREATE INDEX "Newsletter_unsubscribeToken_idx" ON "Newsletter"("unsubscribeToken");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_typ_key" ON "SubscriptionPlan"("typ");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_typ_idx" ON "SubscriptionPlan"("typ");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_aktywny_idx" ON "SubscriptionPlan"("aktywny");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_orderId_key" ON "Invoice"("orderId");

-- CreateIndex
CREATE INDEX "Invoice_lawFirmId_idx" ON "Invoice"("lawFirmId");

-- CreateIndex
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_issueDate_idx" ON "Invoice"("issueDate");

-- CreateIndex
CREATE INDEX "ContactForm_odpowiedziano_idx" ON "ContactForm"("odpowiedziano");

-- CreateIndex
CREATE INDEX "ContactForm_createdAt_idx" ON "ContactForm"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HelpCategory_slug_key" ON "HelpCategory"("slug");

-- CreateIndex
CREATE INDEX "Module_active_idx" ON "Module"("active");

-- CreateIndex
CREATE INDEX "Module_createdAt_idx" ON "Module"("createdAt");

-- CreateIndex
CREATE INDEX "Module_type_idx" ON "Module"("type");

-- CreateIndex
CREATE UNIQUE INDEX "HelpQuestion_slug_key" ON "HelpQuestion"("slug");

-- CreateIndex
CREATE INDEX "HelpQuestion_categoryId_idx" ON "HelpQuestion"("categoryId");

-- CreateIndex
CREATE INDEX "HelpQuestion_slug_idx" ON "HelpQuestion"("slug");

-- CreateIndex
CREATE INDEX "HelpQuestion_aktywna_idx" ON "HelpQuestion"("aktywna");

-- CreateIndex
CREATE INDEX "HelpQuestion_kolejnosc_idx" ON "HelpQuestion"("kolejnosc");

-- CreateIndex
CREATE INDEX "LawFirmStats_lawFirmId_idx" ON "LawFirmStats"("lawFirmId");

-- CreateIndex
CREATE INDEX "LawFirmStats_year_month_idx" ON "LawFirmStats"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "LawFirmStats_lawFirmId_year_month_key" ON "LawFirmStats"("lawFirmId", "year", "month");

-- CreateIndex
CREATE INDEX "LawFirmCategoryStats_lawFirmId_idx" ON "LawFirmCategoryStats"("lawFirmId");

-- CreateIndex
CREATE INDEX "LawFirmCategoryStats_categoryId_idx" ON "LawFirmCategoryStats"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "LawFirmCategoryStats_lawFirmId_categoryId_key" ON "LawFirmCategoryStats"("lawFirmId", "categoryId");

-- CreateIndex
CREATE INDEX "Document_lawFirmId_idx" ON "Document"("lawFirmId");

-- CreateIndex
CREATE INDEX "Document_createdAt_idx" ON "Document"("createdAt");

-- CreateIndex
CREATE INDEX "Document_typDokumentu_idx" ON "Document"("typDokumentu");

-- CreateIndex
CREATE INDEX "Document_zrodlo_idx" ON "Document"("zrodlo");

-- CreateIndex
CREATE INDEX "Document_clientUserId_idx" ON "Document"("clientUserId");

-- CreateIndex
CREATE INDEX "Document_conversationId_idx" ON "Document"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE INDEX "Page_slug_idx" ON "Page"("slug");

-- CreateIndex
CREATE INDEX "Page_published_idx" ON "Page"("published");

-- CreateIndex
CREATE INDEX "Page_createdAt_idx" ON "Page"("createdAt");

-- CreateIndex
CREATE INDEX "PageModule_pageId_idx" ON "PageModule"("pageId");

-- CreateIndex
CREATE INDEX "PageModule_moduleId_idx" ON "PageModule"("moduleId");

-- CreateIndex
CREATE INDEX "PageModule_order_idx" ON "PageModule"("order");

-- CreateIndex
CREATE UNIQUE INDEX "PageModule_pageId_moduleId_order_key" ON "PageModule"("pageId", "moduleId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key");

-- CreateIndex
CREATE INDEX "Settings_key_idx" ON "Settings"("key");

-- CreateIndex
CREATE INDEX "LoginHistory_userId_idx" ON "LoginHistory"("userId");

-- CreateIndex
CREATE INDEX "LoginHistory_createdAt_idx" ON "LoginHistory"("createdAt");

-- CreateIndex
CREATE INDEX "LoginHistory_success_idx" ON "LoginHistory"("success");

-- CreateIndex
CREATE INDEX "SystemLog_level_idx" ON "SystemLog"("level");

-- CreateIndex
CREATE INDEX "SystemLog_action_idx" ON "SystemLog"("action");

-- CreateIndex
CREATE INDEX "SystemLog_userId_idx" ON "SystemLog"("userId");

-- CreateIndex
CREATE INDEX "SystemLog_createdAt_idx" ON "SystemLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerProgram_lawFirmId_key" ON "PartnerProgram"("lawFirmId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerProgram_bannerCode_key" ON "PartnerProgram"("bannerCode");

-- CreateIndex
CREATE INDEX "PartnerProgram_lawFirmId_idx" ON "PartnerProgram"("lawFirmId");

-- CreateIndex
CREATE INDEX "PartnerProgram_active_idx" ON "PartnerProgram"("active");

-- CreateIndex
CREATE INDEX "PartnerProgram_bannerCode_idx" ON "PartnerProgram"("bannerCode");

-- CreateIndex
CREATE INDEX "PartnerPointsHistory_partnerProgramId_idx" ON "PartnerPointsHistory"("partnerProgramId");

-- CreateIndex
CREATE INDEX "PartnerPointsHistory_year_month_idx" ON "PartnerPointsHistory"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerPointsHistory_partnerProgramId_year_month_key" ON "PartnerPointsHistory"("partnerProgramId", "year", "month");

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

-- CreateIndex
CREATE INDEX "ConsultationAvailability_lawFirmId_idx" ON "ConsultationAvailability"("lawFirmId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationAvailability_lawFirmId_dayOfWeek_key" ON "ConsultationAvailability"("lawFirmId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "ConsultationBooking_lawFirmId_idx" ON "ConsultationBooking"("lawFirmId");

-- CreateIndex
CREATE INDEX "ConsultationBooking_clientId_idx" ON "ConsultationBooking"("clientId");

-- CreateIndex
CREATE INDEX "ConsultationBooking_status_idx" ON "ConsultationBooking"("status");

-- CreateIndex
CREATE INDEX "ConsultationBooking_consultationDate_idx" ON "ConsultationBooking"("consultationDate");

-- CreateIndex
CREATE INDEX "Badge_conditionType_idx" ON "Badge"("conditionType");

-- CreateIndex
CREATE INDEX "LawFirmBadge_lawFirmId_idx" ON "LawFirmBadge"("lawFirmId");

-- CreateIndex
CREATE INDEX "LawFirmBadge_badgeId_idx" ON "LawFirmBadge"("badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "LawFirmBadge_lawFirmId_badgeId_key" ON "LawFirmBadge"("lawFirmId", "badgeId");

-- CreateIndex
CREATE INDEX "EmailLog_to_idx" ON "EmailLog"("to");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");

-- CreateIndex
CREATE INDEX "EmailLog_sentAt_idx" ON "EmailLog"("sentAt");

-- CreateIndex
CREATE INDEX "ScheduledEmail_status_idx" ON "ScheduledEmail"("status");

-- CreateIndex
CREATE INDEX "ScheduledEmail_scheduledAt_idx" ON "ScheduledEmail"("scheduledAt");

-- CreateIndex
CREATE INDEX "Advertisement_location_idx" ON "Advertisement"("location");

-- CreateIndex
CREATE INDEX "Advertisement_active_idx" ON "Advertisement"("active");

-- CreateIndex
CREATE INDEX "ReviewReport_reviewId_idx" ON "ReviewReport"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewReport_userId_idx" ON "ReviewReport"("userId");

-- CreateIndex
CREATE INDEX "HomepageTestimonial_active_idx" ON "HomepageTestimonial"("active");

-- CreateIndex
CREATE INDEX "HomepageTestimonial_order_idx" ON "HomepageTestimonial"("order");

-- CreateIndex
CREATE INDEX "OrderOverride_context_idx" ON "OrderOverride"("context");

-- CreateIndex
CREATE UNIQUE INDEX "OrderOverride_context_lawFirmId_key" ON "OrderOverride"("context", "lawFirmId");

-- CreateIndex
CREATE INDEX "ScheduledJob_lockedAt_idx" ON "ScheduledJob"("lockedAt");

-- CreateIndex
CREATE INDEX "ScheduledJobRun_jobName_startedAt_idx" ON "ScheduledJobRun"("jobName", "startedAt");

-- CreateIndex
CREATE INDEX "ScheduledJobRun_status_idx" ON "ScheduledJobRun"("status");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawFirm" ADD CONSTRAINT "LawFirm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawFirm" ADD CONSTRAINT "LawFirm_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawFirm" ADD CONSTRAINT "LawFirm_mainCategoryId_fkey" FOREIGN KEY ("mainCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawFirm" ADD CONSTRAINT "LawFirm_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "AccountManager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawFirmVoivodeship" ADD CONSTRAINT "LawFirmVoivodeship_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawFirmVoivodeship" ADD CONSTRAINT "LawFirmVoivodeship_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawFirmCity" ADD CONSTRAINT "LawFirmCity_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawFirmCity" ADD CONSTRAINT "LawFirmCity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteLawFirm" ADD CONSTRAINT "FavoriteLawFirm_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteLawFirm" ADD CONSTRAINT "FavoriteLawFirm_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawFirmCategory" ADD CONSTRAINT "LawFirmCategory_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawFirmCategory" ADD CONSTRAINT "LawFirmCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negotiation" ADD CONSTRAINT "Negotiation_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negotiation" ADD CONSTRAINT "Negotiation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_lawFirmUserId_fkey" FOREIGN KEY ("lawFirmUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypingIndicator" ADD CONSTRAINT "TypingIndicator_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_sponsoredLawFirmId_fkey" FOREIGN KEY ("sponsoredLawFirmId") REFERENCES "LawFirm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionStats" ADD CONSTRAINT "PromotionStats_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSettings" ADD CONSTRAINT "NotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_voivodeshipId_fkey" FOREIGN KEY ("voivodeshipId") REFERENCES "Voivodeship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostalCode" ADD CONSTRAINT "PostalCode_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpQuestion" ADD CONSTRAINT "HelpQuestion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "HelpCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawFirmStats" ADD CONSTRAINT "LawFirmStats_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawFirmCategoryStats" ADD CONSTRAINT "LawFirmCategoryStats_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawFirmCategoryStats" ADD CONSTRAINT "LawFirmCategoryStats_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageModule" ADD CONSTRAINT "PageModule_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageModule" ADD CONSTRAINT "PageModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginHistory" ADD CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerProgram" ADD CONSTRAINT "PartnerProgram_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPointsHistory" ADD CONSTRAINT "PartnerPointsHistory_partnerProgramId_fkey" FOREIGN KEY ("partnerProgramId") REFERENCES "PartnerProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationAvailability" ADD CONSTRAINT "ConsultationAvailability_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationBooking" ADD CONSTRAINT "ConsultationBooking_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationBooking" ADD CONSTRAINT "ConsultationBooking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawFirmBadge" ADD CONSTRAINT "LawFirmBadge_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawFirmBadge" ADD CONSTRAINT "LawFirmBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReport" ADD CONSTRAINT "ReviewReport_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReport" ADD CONSTRAINT "ReviewReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderOverride" ADD CONSTRAINT "OrderOverride_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledJobRun" ADD CONSTRAINT "ScheduledJobRun_jobName_fkey" FOREIGN KEY ("jobName") REFERENCES "ScheduledJob"("jobName") ON DELETE CASCADE ON UPDATE CASCADE;
