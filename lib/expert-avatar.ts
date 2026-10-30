/**
 * Domyślny avatar eksperta pokazywany, gdy ekspert nie wgrał własnego logo.
 *
 * Używać WYŁĄCZNIE w miejscach, które avatar wyświetlają. Nie stosować tam,
 * gdzie obecność logo steruje logiką — m.in. ocena kompletności profilu
 * (ProfileScoreCard), edytor uploadu (BasicTab) i pola formularzy admina —
 * bo podstawiona wartość domyślna wyglądałaby jak realnie wgrane logo
 * i trafiłaby do bazy przy zapisie.
 */
export const EXPERT_AVATAR_FALLBACK = "/default.jpg"

/** Zwraca logo eksperta albo domyślny avatar. Puste stringi oraz domyślne placeholdery użytkownika traktuje jak brak. */
export function expertAvatar(logo?: string | null): string {
  if (
    !logo ||
    logo.trim() === "" ||
    logo === "/images/defailt-user.jpg" ||
    logo === "/images/default-user.jpg" ||
    logo.endsWith("defailt-user.jpg") ||
    logo.endsWith("default-user.jpg")
  ) {
    return EXPERT_AVATAR_FALLBACK
  }
  return logo
}
