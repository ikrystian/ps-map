import {
  LINK_COOKIE_OPTIONS,
  LINK_RETURN_COOKIE,
  linkResultUrl,
  sanitizeLinkReturnPath,
} from "@/lib/account-link"
import { auth } from "@/lib/auth"
import { LINKEDIN_LINK_STATE_COOKIE } from "@/lib/linkedin-link"
import { randomBytes } from "crypto"
import { NextRequest, NextResponse } from "next/server"

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
const LINKEDIN_SCOPE = "openid profile email"

// Rozpoczyna proces łączenia zalogowanego konta z kontem LinkedIn.
// Przepływ linkuje konto LinkedIn bezpośrednio do zalogowanego użytkownika,
// niezależnie od adresu e-mail zapisanego na LinkedIn.
export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/logowanie", request.nextUrl.origin))
  }

  const returnPath = sanitizeLinkReturnPath(
    request.nextUrl.searchParams.get("returnTo")
  )

  const clientId = process.env.AUTH_LINKEDIN_ID
  if (!clientId) {
    return NextResponse.redirect(
      linkResultUrl(request.nextUrl.origin, returnPath, "linkedin_link", "error")
    )
  }

  const rawBaseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin
  const baseUrl = rawBaseUrl.replace(/\/$/, "")
  const redirectUri = `${baseUrl}/api/account/link/linkedin/callback`
  const state = randomBytes(24).toString("hex")

  const authUrl = new URL(LINKEDIN_AUTH_URL)
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("scope", LINKEDIN_SCOPE)
  authUrl.searchParams.set("state", state)

  const response = NextResponse.redirect(authUrl)
  response.cookies.set(LINKEDIN_LINK_STATE_COOKIE, state, LINK_COOKIE_OPTIONS)
  response.cookies.set(LINK_RETURN_COOKIE, returnPath, LINK_COOKIE_OPTIONS)

  return response
}
