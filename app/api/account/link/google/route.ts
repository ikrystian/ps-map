import { auth } from "@/lib/auth"
import { GOOGLE_LINK_STATE_COOKIE } from "@/lib/google-link"
import { randomBytes } from "crypto"
import { NextRequest, NextResponse } from "next/server"

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"

// Rozpoczyna proces łączenia zalogowanego konta z kontem Google.
// Przepływ linkuje konto Google bezpośrednio do zalogowanego użytkownika.
export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/logowanie", request.nextUrl.origin))
  }

  const clientId = process.env.AUTH_GOOGLE_ID
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/panel-klienta/profil?google_link=error", request.nextUrl.origin)
    )
  }

  const rawBaseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin
  const baseUrl = rawBaseUrl.replace(/\/$/, "")
  const redirectUri = `${baseUrl}/api/account/link/google/callback`
  const state = randomBytes(24).toString("hex")

  const authUrl = new URL(GOOGLE_AUTH_URL)
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("scope", "openid profile email")
  authUrl.searchParams.set("state", state)
  authUrl.searchParams.set("prompt", "select_account")

  const response = NextResponse.redirect(authUrl)
  response.cookies.set(GOOGLE_LINK_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60, // 10 minut na dokończenie procesu
    path: "/",
  })

  return response
}
