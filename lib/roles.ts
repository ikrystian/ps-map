// Uprawnienia zależne od roli użytkownika — wspólne dla proxy, API i UI.
// Plik bez zależności serwerowych, aby można go było importować w komponentach klienckich.

/** Role mające dostęp do panelu /admin (moderator — wyłącznie do sekcji bloga). */
export function canAccessAdminPanel(role?: string | null): boolean {
  return role === "ADMIN" || role === "MODERATOR"
}

/** Role mogące zarządzać wszystkimi wpisami i kategoriami bloga. */
export function canManageBlog(role?: string | null): boolean {
  return role === "ADMIN" || role === "MODERATOR"
}

/** Nazwa roli osoby, która ostatnio edytowała wpis — pokazywana ekspertowi zamiast danych osobowych. */
export function editorRoleLabel(role?: string | null): string {
  switch (role) {
    case "ADMIN":
      return "Administrator portalu"
    case "MODERATOR":
      return "Moderator portalu"
    case "LAW_FIRM":
      return "Ty"
    default:
      return "Nieznany"
  }
}

/** To samo co editorRoleLabel, ale z perspektywy panelu admina — edytujący ekspert to „Ekspert", a nie „Ty". */
export function editorRoleLabelForAdmin(role?: string | null): string {
  return role === "LAW_FIRM" ? "Ekspert" : editorRoleLabel(role)
}

/** Ścieżki panelu admina dostępne dla moderatora. */
export const MODERATOR_ADMIN_PATHS = ["/admin/blog"]

/** Strona startowa panelu admina dla danej roli. */
export function adminHomePath(role?: string | null): string {
  return role === "MODERATOR" ? "/admin/blog" : "/admin"
}

export function isModeratorAdminPath(pathname: string): boolean {
  return MODERATOR_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
}
