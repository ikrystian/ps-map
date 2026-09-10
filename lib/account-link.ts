// Wspólna obsługa przepływu "połącz konto z dostawcą OAuth" (Google, Facebook, LinkedIn).
// Przepływ jest oddzielony od logowania przez NextAuth, bo NextAuth łączy konta wyłącznie
// po zgodnym adresie e-mail — tutaj wiążemy konto dostawcy z aktualnie zalogowanym użytkownikiem.

// Cookie z adresem powrotu — callback dostawcy nie otrzymuje parametrów z pierwszego żądania.
export const LINK_RETURN_COOKIE = "account_link_return"

// Ścieżki, na które wolno wrócić po zakończeniu procesu. Parametr "returnTo" pochodzi
// z adresu URL, więc dopuszczamy tylko znane strony ustawień (ochrona przed open redirect).
const ALLOWED_RETURN_PATHS = [
  "/panel-klienta/profil",
  "/panel-eksperta/ustawienia",
] as const

export const DEFAULT_LINK_RETURN_PATH: string = ALLOWED_RETURN_PATHS[0]

export function sanitizeLinkReturnPath(path?: string | null): string {
  if (!path) return DEFAULT_LINK_RETURN_PATH
  return (ALLOWED_RETURN_PATHS as readonly string[]).includes(path)
    ? path
    : DEFAULT_LINK_RETURN_PATH
}

// Adres powrotu ze statusem procesu, np. /panel-eksperta/ustawienia?linkedin_link=success
export function linkResultUrl(
  origin: string,
  returnPath: string | undefined | null,
  param: string,
  status: string
): URL {
  const url = new URL(sanitizeLinkReturnPath(returnPath), origin)
  url.searchParams.set(param, status)
  return url
}

export const LINK_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 10 * 60, // 10 minut na dokończenie procesu
  path: "/",
} as const
