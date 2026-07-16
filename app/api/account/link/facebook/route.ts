import { auth } from "@/lib/auth"
import { FB_LINK_STATE_COOKIE } from "@/lib/facebook-link"
import { randomBytes } from "crypto"
import { NextRequest, NextResponse } from "next/server"

const FACEBOOK_DIALOG_URL = "https://www.facebook.com/v19.0/dialog/oauth"

// Rozpoczyna proces łączenia zalogowanego konta z kontem Facebook.
// Nie korzystamy z signIn("facebook"), bo NextAuth łączy konta tylko po
// zgodnym adresie e-mail — ten przepływ linkuje konto FB bezpośrednio
// do zalogowanego użytkownika, niezależnie od adresu e-mail na Facebooku.
export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/logowanie", request.nextUrl.origin))
  }

  const clientId = process.env.AUTH_FACEBOOK_ID
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/panel-klienta/profil?fb_link=error", request.nextUrl.origin)
    )
  }

  const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin
  const redirectUri = `${baseUrl}/api/account/link/facebook/callback`
  const state = randomBytes(24).toString("hex")

  const dialogUrl = new URL(FACEBOOK_DIALOG_URL)
  dialogUrl.searchParams.set("client_id", clientId)
  dialogUrl.searchParams.set("redirect_uri", redirectUri)
  dialogUrl.searchParams.set("state", state)
  dialogUrl.searchParams.set("scope", "public_profile,email")

  const response = NextResponse.redirect(dialogUrl)
  response.cookies.set(FB_LINK_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60, // 10 minut na dokończenie procesu
    path: "/",
  })

  return response
}
