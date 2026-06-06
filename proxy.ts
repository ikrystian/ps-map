import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
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
