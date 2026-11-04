export const CASE_TYPE_LABEL: Record<string, string> = {
  OSOBA_PRYWATNA: "Osoba prywatna",
  FIRMA: "Firma",
  ORGANIZACJA: "Organizacja",
}

export const PAYMENT_TERMS_LABEL: Record<string, string> = {
  PRZELEW_7: "Przelew 7 dni",
  PRZELEW_14: "Przelew 14 dni",
  PRZELEW_30: "Przelew 30 dni",
  Z_GORY: "Płatność z góry",
  RATY: "Płatność ratalna",
  INNY: "Inne warunki",
}

export const REFERRAL_STATUS_LABEL: Record<string, string> = {
  WYSLANE: "Wysłane",
  OTWARTE: "Link otwarty",
  ZAREJESTROWANO: "Konto założone",
  SPRAWA_UTWORZONA: "Sprawa utworzona",
  WYGASLE: "Wygasło",
  ANULOWANE: "Anulowane",
}

export const BOOKING_STATUS_LABEL: Record<string, string> = {
  PENDING: "Oczekuje na akceptację",
  ACCEPTED: "Zaakceptowana",
  REJECTED: "Odrzucona",
  COMPLETED: "Zakończona",
  CANCELLED: "Anulowana",
}

export const INTEREST_STATUS_LABEL: Record<string, string> = {
  ZLOZONE: "Oczekuje na decyzję klienta",
  ZAAKCEPTOWANE: "Przyjęte – konsultacja umówiona",
  ODRZUCONE: "Odrzucone przez klienta",
  WYGASLE: "Wygasłe",
}

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  PRZELEWY24: "Przelewy24",
  PAYU: "PayU",
  TPAY: "Tpay",
  PRZELEW: "Przelew tradycyjny",
  TEST: "Płatność testowa",
  POINTS: "Punkty",
}

export const PLAN_ORDER = ["PODSTAWOWY", "STANDARD", "PREMIUM", "BIZNES"]

export type Tone = "neutral" | "primary" | "success" | "warning" | "danger"

export function caseTone(status: string): Tone {
  if (status === "OFERTY_OTRZYMANE") return "warning"
  if (status === "W_TRAKCIE") return "success"
  if (status === "ZAKONCZONA" || status === "ANULOWANA") return "neutral"
  return "primary"
}

export function offerTone(status: string): Tone {
  if (status === "ZAAKCEPTOWANA") return "success"
  if (status === "ODRZUCONA") return "danger"
  if (status === "ZLOZONA" || status === "NEGOCJACJE") return "warning"
  return "neutral"
}

export function paymentTone(status: string): Tone {
  if (status === "ZAPLACONE") return "success"
  if (status === "OCZEKUJE") return "warning"
  if (status === "ANULOWANE") return "danger"
  return "neutral"
}
