/**
 * Zapytania o konsultacje online są celowo widoczne dla WSZYSTKICH ekspertów –
 * bez filtra kategorii, lokalizacji ani zakresu usług (inaczej niż sprawy,
 * które przechodzą przez `buildLawFirmCaseWhereInput` w `lib/cases.ts`).
 * Dlatego ten moduł nie zawiera helpera budującego `where` – lista ograniczana
 * jest wyłącznie statusem zapytania w `app/api/consultation-requests/route.ts`.
 */

/** Etykiety form konsultacji do prezentacji w UI i e-mailach. */
export const CONSULTATION_FORM_LABELS: Record<string, string> = {
  VIDEO: "Wideokonferencja",
  TELEFON: "Rozmowa telefoniczna",
  DOWOLNA: "Wideo lub telefon",
}

/** Dozwolone długości konsultacji w minutach. */
export const CONSULTATION_DURATIONS = [15, 30, 60] as const
