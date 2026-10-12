/**
 * Dane spółki — sprzedawcy na fakturach (wydruk, PDF, XML KSeF) i podmiotu
 * w dokumentach prawnych. Jedno źródło prawdy (F-005); wartości jak w regulaminie
 * i polityce prywatności (`lib/legal-pages/*`).
 */
export const COMPANY = {
  name: "POLSKA GRUPA IDENTYFIKACJI FIRM SP. Z O.O.",
  /** Nazwa marki widoczna w logo/nagłówkach. */
  brand: "Prosta Sprawa",
  street: "Generała Mariana Langiewicza 16 lok. 3",
  postalCode: "25-381",
  city: "Kielce",
  nip: "9592020678",
  krs: "0000768210",
  /** Jedyny publiczny adres kontaktowy/BOK (F-007). */
  email: "bok@prostasprawa.pl",
  phone: "+48 534 888 555",
  phoneHref: "tel:+48534888555",
  /** Godziny infolinii (F-008). */
  hours: "poniedziałek – piątek 8:00 – 18:00, sobota 9:00 – 14:00",
  /** Deklarowany czas odpowiedzi na e-mail (F-054). */
  responseTime: "24 h",
} as const
