import { z } from "zod"
import { isValidNip } from "@/lib/biala-lista"

/**
 * Wspólne reguły walidacji formularzy (F-075): ten sam telefon i NIP są sprawdzane
 * tak samo w rejestracji, panelach i formularzach admina.
 */

/** Telefon: 9–15 znaków (cyfry, spacje, myślniki, opcjonalny wiodący +). */
export const PHONE_REGEX = /^\+?[0-9\s-]{9,15}$/
export const PHONE_MESSAGE = "Podaj poprawny numer telefonu (9–15 cyfr)"

export const phoneSchema = z.string().trim().regex(PHONE_REGEX, PHONE_MESSAGE)

/** NIP z sumą kontrolną; pusty ciąg dozwolony tylko przez `.or(z.literal(""))` po stronie formularza. */
export const nipSchema = z
  .string()
  .refine((value) => isValidNip(value), "Podaj poprawny numer NIP (10 cyfr, z cyfrą kontrolną)")
