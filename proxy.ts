import { auth } from "@/auth"
import { NextResponse } from "next/server"

// CORS dla statycznego landing page (katalog ps-landing), który żyje na innym
// origin niż ta aplikacja Next.js, a pobiera dane słownikowe i pre-rejestruje
// ekspertów bezpośrednio przeciwko poniższym publicznym endpointom.
const CORS_PATHS = [
  "/api/law-firms",
  "/api/voivodeships",
  "/api/categories",
  "/api/expertise-categories",
  "/api/cities",
  // Weryfikacja numeru telefonu kodem SMS — wymagana przed rejestracją także
  // w pre-rejestracji z landing page.
  "/api/auth/phone-verification/send",
  "/api/auth/phone-verification/verify",
]

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  }
}

export default auth((req) => {
  const { nextUrl } = req

  // CORS dla publicznych endpointów słownikowych wykorzystywanych przez landing page.
  // Obsługujemy preflight i nagłówki zanim wejdzie logika autoryzacji.
  if (CORS_PATHS.includes(nextUrl.pathname)) {
    const origin = req.headers.get("origin") ?? "*"
    if (req.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
    }
    const response = NextResponse.next()
    for (const [key, value] of Object.entries(corsHeaders(origin))) {
      response.headers.set(key, value)
    }
    return response
  }

  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  // Ścieżki publiczne
  const isPublicPath =
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/(public)") ||
    nextUrl.pathname.startsWith("/rejestracja") ||
    nextUrl.pathname.startsWith("/logowanie") ||
    nextUrl.pathname.startsWith("/o-nas") ||
    nextUrl.pathname.startsWith("/jak-to-dziala") ||
    nextUrl.pathname.startsWith("/cennik") ||
    nextUrl.pathname.startsWith("/kontakt") ||
    nextUrl.pathname.startsWith("/regulamin") ||
    nextUrl.pathname.startsWith("/polityka-prywatnosci") ||
    nextUrl.pathname.startsWith("/kategorie") ||
    nextUrl.pathname.startsWith("/ekspert") ||
    nextUrl.pathname.startsWith("/blog") ||
    nextUrl.pathname.startsWith("/dodaj-sprawe") ||
    nextUrl.pathname.startsWith("/szukaj-prawnika") ||
    nextUrl.pathname.startsWith("/sklep") ||
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname.startsWith("/api/socket") ||
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.startsWith("/favicon")

  // Jeśli zalogowany i próbuje wejść na stronę logowania - przekieruj na odpowiedni panel
  if (isLoggedIn && nextUrl.pathname === "/logowanie") {
    if (userRole === "CLIENT") {
      return NextResponse.redirect(new URL("/panel-klienta", nextUrl))
    }
    if (userRole === "LAW_FIRM") {
      return NextResponse.redirect(new URL("/panel-eksperta", nextUrl))
    }
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", nextUrl))
    }
  }

  // Panel klienta - tylko dla CLIENT
  if (nextUrl.pathname.startsWith("/panel-klienta")) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname)
      return NextResponse.redirect(new URL(`/logowanie?callbackUrl=${callbackUrl}`, nextUrl))
    }
    if (userRole !== "CLIENT") {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
  }

  // Panel eksperta - tylko dla LAW_FIRM
  if (nextUrl.pathname.startsWith("/panel-eksperta")) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname)
      return NextResponse.redirect(new URL(`/logowanie?callbackUrl=${callbackUrl}`, nextUrl))
    }
    if (userRole !== "LAW_FIRM") {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
  }

  // Panel admin - tylko dla ADMIN
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname)
      return NextResponse.redirect(new URL(`/logowanie?callbackUrl=${callbackUrl}`, nextUrl))
    }
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
