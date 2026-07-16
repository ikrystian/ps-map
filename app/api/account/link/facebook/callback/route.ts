import { auth } from "@/lib/auth"
import { FB_LINK_STATE_COOKIE } from "@/lib/facebook-link"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

const FACEBOOK_TOKEN_URL = "https://graph.facebook.com/v19.0/oauth/access_token"
const FACEBOOK_ME_URL = "https://graph.facebook.com/v19.0/me"

const PROFILE_URL = "/panel-klienta/profil"

function redirectToProfile(origin: string, status: string) {
  const response = NextResponse.redirect(
    new URL(`${PROFILE_URL}?fb_link=${status}`, origin)
  )
  response.cookies.delete(FB_LINK_STATE_COOKIE)
  return response
}

export async function GET(request: NextRequest) {
  const origin = process.env.NEXTAUTH_URL || request.nextUrl.origin
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/logowanie", origin))
  }

  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const cookieState = request.cookies.get(FB_LINK_STATE_COOKIE)?.value

  // Użytkownik anulował w oknie Facebooka
  if (searchParams.get("error") || !code) {
    return redirectToProfile(origin, "cancelled")
  }

  if (!state || !cookieState || state !== cookieState) {
    return redirectToProfile(origin, "error")
  }

  try {
    const redirectUri = `${origin}/api/account/link/facebook/callback`

    const tokenUrl = new URL(FACEBOOK_TOKEN_URL)
    tokenUrl.searchParams.set("client_id", process.env.AUTH_FACEBOOK_ID || "")
    tokenUrl.searchParams.set("client_secret", process.env.AUTH_FACEBOOK_SECRET || "")
    tokenUrl.searchParams.set("redirect_uri", redirectUri)
    tokenUrl.searchParams.set("code", code)

    const tokenResponse = await fetch(tokenUrl)
    if (!tokenResponse.ok) {
      console.error("Facebook token exchange failed:", await tokenResponse.text())
      return redirectToProfile(origin, "error")
    }

    const tokenData: {
      access_token: string
      token_type?: string
      expires_in?: number
    } = await tokenResponse.json()

    const meUrl = new URL(FACEBOOK_ME_URL)
    meUrl.searchParams.set("fields", "id")
    meUrl.searchParams.set("access_token", tokenData.access_token)

    const meResponse = await fetch(meUrl)
    if (!meResponse.ok) {
      console.error("Facebook profile fetch failed:", await meResponse.text())
      return redirectToProfile(origin, "error")
    }

    const profile: { id: string } = await meResponse.json()

    // To konto Facebook może być już powiązane z innym użytkownikiem serwisu
    const existingAccount = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "facebook",
          providerAccountId: profile.id,
        },
      },
    })

    if (existingAccount && existingAccount.userId !== session.user.id) {
      return redirectToProfile(origin, "in_use")
    }

    const accountData = {
      access_token: tokenData.access_token,
      token_type: tokenData.token_type ?? "bearer",
      expires_at: tokenData.expires_in
        ? Math.floor(Date.now() / 1000) + tokenData.expires_in
        : null,
      scope: "public_profile,email",
    }

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: accountData,
      })
    } else {
      // Usuń ewentualne wcześniejsze powiązanie z innym profilem FB
      await prisma.account.deleteMany({
        where: { userId: session.user.id, provider: "facebook" },
      })
      await prisma.account.create({
        data: {
          userId: session.user.id,
          type: "oauth",
          provider: "facebook",
          providerAccountId: profile.id,
          ...accountData,
        },
      })
    }

    return redirectToProfile(origin, "success")
  } catch (error) {
    console.error("Error linking Facebook account:", error)
    return redirectToProfile(origin, "error")
  }
}
