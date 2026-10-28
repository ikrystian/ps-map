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
