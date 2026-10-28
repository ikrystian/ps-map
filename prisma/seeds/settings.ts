import { PrismaClient } from "@prisma/client";
import {
  DEFAULT_MIN_CUSTOM_POINTS,
  DEFAULT_POINTS_TO_PLN_RATIO,
  DEFAULT_POINT_PACKAGES,
  DEFAULT_POINT_PRICE_TIERS,
} from "../../lib/points-pricing";

export async function seedSettings(prisma: PrismaClient) {
  console.log("Seeding system settings...");

  // Lookup root ExpertiseCategory "Prawnicy" for homepage tabs
  const prawnicyExp = await prisma.expertiseCategory.findFirst({
    where: { nazwa: "Prawnicy", parentId: null },
  });

  // Lookup popular categories for homepage section "Najczęściej konsultowane"
  const consultedCategories = await prisma.category.findMany({
    where: {
      slug: {
        in: [
          "alimenty-i-rozwody",
          "dziedziczenie-spadki-testamenty",
          "umowy-handlowe-b2b",
          "spory-pracownicze",
          "odszkodowania",
          "obowiazki-podatkowe-dla-firm",
        ],
      },
    },
    select: { id: true },
  });

  const consultedCategoryIds = consultedCategories.map((c) => c.id);

  const settingsList = [
    {
      key: "favicon",
      value: "/favicon.png",
      description: "Adres URL lub ścieżka do faviconu strony",
    },
    {
      key: "ogTitle",
      value: "Prosta Sprawa - Nowoczesna Platforma Prawna",
      description: "Domyślny tytuł Open Graph dla strony głównej i stron publicznych",
    },
    {
      key: "ogDescription",
      value: "Łączymy klientów poszukujących pomocy prawnej ze sprawdzonymi adwokatami, radcami prawnymi i doradcami w całej Polsce.",
      description: "Domyślny opis Open Graph dla strony głównej i stron publicznych",
    },
    {
      key: "ogImage",
      value: "/images/og-image.png",
      description: "Domyślny obrazek Open Graph",
    },
    {
      key: "pointsToPlnRatio",
      value: String(DEFAULT_POINTS_TO_PLN_RATIO),
      description: "Przelicznik punktów na złotówki w systemie (1 punkt = X PLN). Domyślnie 1:1.",
    },
    {
      key: "minCustomPoints",
      value: String(DEFAULT_MIN_CUSTOM_POINTS),
      description: "Minimalna liczba punktów przy zakupie własnej liczby punktów",
    },
    {
      key: "pointsPriceTiers",
      value: JSON.stringify(DEFAULT_POINT_PRICE_TIERS),
      description: "Przedziały cenowe dla zakupu własnej liczby punktów",
    },
    {
      key: "pointsPackages",
      value: JSON.stringify(DEFAULT_POINT_PACKAGES),
      description: "Pakiety punktów prezentowane w panelu eksperta",
    },
    {
      key: "enablePaymentTest",
      value: "true",
      description: "Czy płatność testowa (TEST) jest włączona",
    },
    {
      key: "autoApproveTestPayment",
      value: "true",
      description: "Czy płatność testowa jest automatycznie oznaczana jako opłacona",
    },
    {
      key: "enablePaymentPrzelewy24",
      value: "true",
      description: "Czy płatność Przelewy24 jest aktywna",
    },
    {
      key: "enablePaymentPayU",
      value: "true",
      description: "Czy płatność PayU jest aktywna",
    },
    {
      key: "enablePaymentPrzelew",
      value: "true",
      description: "Czy płatność tradycyjnym przelewem jest aktywna",
    },
    {
      key: "enablePaymentTpay",
      value: "true",
      description: "Czy płatność Tpay jest aktywna",
    },
    {
      key: "ksefEnabled",
      value: "false",
      description: "Czy włączyć automatyczne wystawianie faktur przez KSeF 2.0",
    },
    {
      key: "ksefNip",
      value: "5252812345",
      description: "NIP sprzedawcy (platformy) dla systemu KSeF",
    },
    {
      key: "ksefToken",
      value: "test-ksef-token-mock-2026",
      description: "Token autoryzacyjny KSeF",
    },
    {
      key: "ksefEnv",
      value: "test",
      description: "Środowisko KSeF (test/prod)",
    },
    {
      key: "showChatAssistant",
      value: "true",
      description: "Czy wyświetlać asystenta czatu",
    },
    {
      key: "autoGrantBusinessPackage",
      value: "false",
      description: "Czy automatycznie przyznawać nowym ekspertom pakiet Biznes na start",
    },
    {
      key: "geographicHierarchy",
      value: "voivodeships",
      description: "Hierarchia geograficzna (voivodeships/counties/cities)",
    },
    {
      key: "publicItemsPerPage",
      value: "12",
      description: "Liczba pozycji na stronie w katalogu i wyszukiwarce",
    },
    {
      key: "maxLawFirmCategories",
      value: "10",
      description: "Maksymalna liczba kategorii dla profilu eksperta",
    },
    {
      key: "maxLawFirmTags",
      value: "5",
      description: "Maksymalna liczba słów kluczowych bez płatnego pakietu",
    },
    {
      key: "showExpertTutorial",
      value: "false",
      description: "Czy wyświetlać samouczek w panelu eksperta",
    },
    {
      key: "caseCreationOtpEnabled",
      value: "false",
      description: "Wymóg weryfikacji OTP e-mail przed utworzeniem sprawy",
    },
    {
      key: "minReviewLength",
      value: "50",
      description: "Minimalna liczba znaków w treści opinii",
    },
    {
      key: "comingSoonMode",
      value: "false",
      description: "Tryb zapowiedzi serwisu",
    },
    {
      key: "contactEmail",
      value: "kontakt@prosta-sprawa.pl",
      description: "Adres e-mail do kontaktu",
    },
    {
      key: "contactPhone",
      value: "+48 22 123 45 67",
      description: "Infolinia / telefon kontaktowy",
    },
    {
      key: "companyName",
      value: "Prosta Sprawa Sp. z o.o.",
      description: "Nazwa operatora platformy",
    },
    {
      key: "companyAddress",
      value: "ul. Złota 59, 00-120 Warszawa",
      description: "Adres rejestrowy operatora",
    },
    {
      key: "companyNip",
      value: "5252812345",
      description: "NIP operatora",
    },
    {
      key: "companyKrs",
      value: "0000845123",
      description: "KRS operatora",
    },
    {
      key: "companyRegon",
      value: "147258369",
      description: "REGON operatora",
    },
    {
      key: "socialFacebook",
      value: "https://facebook.com/prostasprawapl",
      description: "Profil Facebook",
    },
    {
      key: "socialLinkedIn",
      value: "https://linkedin.com/company/prostasprawapl",
      description: "Profil LinkedIn",
    },
    {
      key: "socialInstagram",
      value: "https://instagram.com/prostasprawapl",
      description: "Profil Instagram",
    },
    {
      key: "socialTwitter",
      value: "https://twitter.com/prostasprawapl",
      description: "Profil X / Twitter",
    },
    {
      key: "homepageRecommendedCategory",
      value: prawnicyExp?.id || "",
      description: "Kategoria główna dla zakładek Polecani Prawnicy na stronie głównej",
    },
    {
      key: "homepageConsultedCategories",
      value: JSON.stringify(consultedCategoryIds),
      description: "Lista ID kategorii w sekcji Najczęściej konsultowane na stronie głównej",
    },
  ];

  for (const s of settingsList) {
    await prisma.settings.upsert({
      where: { key: s.key },
      create: s,
      update: s,
    });
  }

  console.log(`✓ Zapisano ${settingsList.length} ustawień systemowych (Settings)`);
}
