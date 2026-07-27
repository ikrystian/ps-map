import { expertAvatar } from "./expert-avatar"

/**
 * Domyślny avatar (neutralna sylwetka) pokazywany, gdy użytkownik nie ustawił
 * własnego zdjęcia profilowego.
 *
 * Uwaga: nazwa pliku zawiera literówkę („defailt”) — tak nazywa się zasób
 * w `public/images`, więc ścieżka musi ją odwzorowywać.
 *
 * Używać tylko tam, gdzie avatar jest WYŚWIETLANY. Nie stosować w miejscach,
 * gdzie obecność zdjęcia steruje logiką (walidacja, ocena kompletności profilu,
 * pola formularzy) — wartość domyślna trafiłaby do bazy przy zapisie.
 */
export const CLIENT_AVATAR_FALLBACK = "/images/defailt-user.jpg"

/** Zwraca zdjęcie klienta albo domyślną sylwetkę. Puste stringi traktuje jak brak. */
export function clientAvatar(image?: string | null): string {
  return image && image.trim() !== "" ? image : CLIENT_AVATAR_FALLBACK
}

/**
 * Avatar zależny od roli: eksperci mają własny placeholder brandowy,
 * pozostali (klient, admin) neutralną sylwetkę. Do miejsc, które renderują
 * użytkowników o różnych rolach na jednej liście — np. panel admina.
 */
export function userAvatar(image?: string | null, role?: string | null): string {
  return role === "LAW_FIRM" ? expertAvatar(image) : clientAvatar(image)
}
