import { auth } from "@/lib/auth"
import { GOOGLE_LINK_STATE_COOKIE } from "@/lib/google-link"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

const PROFILE_URL = "/panel-klienta/profil"

function redirectToProfile(origin: string, status: string) {
  const response = NextResponse.redirect(
    new URL(`${PROFILE_URL}?google_link=${status}`, origin)
  )
  response.cookies.delete(GOOGLE_LINK_STATE_COOKIE)
  return response
}

export async function GET(request: NextRequest) {
  const rawOrigin = process.env.NEXTAUTH_URL || request.nextUrl.origin
  const origin = rawOrigin.replace(/\/$/, "")
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/logowanie", origin))
  }

  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const cookieState = request.cookies.get(GOOGLE_LINK_STATE_COOKIE)?.value

  // Użytkownik anulował w oknie Google
  if (searchParams.get("error") || !code) {
    return redirectToProfile(origin, "cancelled")
  }

  if (!state || !cookieState || state !== cookieState) {
    return redirectToProfile(origin, "error")
  }

  try {
    const redirectUri = `${origin}/api/account/link/google/callback`

    const bodyParams = new URLSearchParams()
    bodyParams.set("code", code)
    bodyParams.set("client_id", process.env.AUTH_GOOGLE_ID || "")
    bodyParams.set("client_secret", process.env.AUTH_GOOGLE_SECRET || "")
    bodyParams.set("redirect_uri", redirectUri)
    bodyParams.set("grant_type", "authorization_code")

    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams.toString(),
    })

    if (!tokenResponse.ok) {
      console.error("Google token exchange failed:", await tokenResponse.text())
      return redirectToProfile(origin, "error")
    }

    const tokenData: {
      access_token: string
      refresh_token?: string
      id_token?: string
      token_type?: string
      expires_in?: number
      scope?: string
    } = await tokenResponse.json()

    const meResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!meResponse.ok) {
      console.error("Google profile fetch failed:", await meResponse.text())
      return redirectToProfile(origin, "error")
    }

    const profile: { id?: string; sub?: string } = await meResponse.json()
    const googleUserId = profile.id || profile.sub

    if (!googleUserId) {
      console.error("Google profile missing ID")
      return redirectToProfile(origin, "error")
    }

    // To konto Google może być już powiązane z innym użytkownikiem serwisu
    const existingAccount = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: googleUserId,
        },
      },
    })

    if (existingAccount && existingAccount.userId !== session.user.id) {
      return redirectToProfile(origin, "in_use")
    }

    const accountData = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? null,
      id_token: tokenData.id_token ?? null,
      token_type: tokenData.token_type ?? "bearer",
      expires_at: tokenData.expires_in
        ? Math.floor(Date.now() / 1000) + tokenData.expires_in
        : null,
      scope: tokenData.scope || "openid profile email",
    }

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: accountData,
      })
    } else {
      // Usuń ewentualne wcześniejsze powiązanie z innym profilem Google
      await prisma.account.deleteMany({
        where: { userId: session.user.id, provider: "google" },
      })
      await prisma.account.create({
        data: {
          userId: session.user.id,
          type: "oauth",
          provider: "google",
          providerAccountId: googleUserId,
          ...accountData,
        },
      })
    }

    return redirectToProfile(origin, "success")
  } catch (error) {
    console.error("Error linking Google account:", error)
    return redirectToProfile(origin, "error")
  }
}
