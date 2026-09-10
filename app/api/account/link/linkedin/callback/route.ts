import { LINK_RETURN_COOKIE, linkResultUrl } from "@/lib/account-link"
import { auth } from "@/lib/auth"
import { LINKEDIN_LINK_STATE_COOKIE } from "@/lib/linkedin-link"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
const LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo"
const LINKEDIN_SCOPE = "openid profile email"

function redirectToProfile(origin: string, returnPath: string | undefined, status: string) {
  const response = NextResponse.redirect(
    linkResultUrl(origin, returnPath, "linkedin_link", status)
  )
  response.cookies.delete(LINKEDIN_LINK_STATE_COOKIE)
  response.cookies.delete(LINK_RETURN_COOKIE)
  return response
}

export async function GET(request: NextRequest) {
  const rawOrigin = process.env.NEXTAUTH_URL || request.nextUrl.origin
  const origin = rawOrigin.replace(/\/$/, "")
  const returnPath = request.cookies.get(LINK_RETURN_COOKIE)?.value
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/logowanie", origin))
  }

  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const cookieState = request.cookies.get(LINKEDIN_LINK_STATE_COOKIE)?.value

  // Użytkownik anulował w oknie LinkedIn
  if (searchParams.get("error") || !code) {
    return redirectToProfile(origin, returnPath, "cancelled")
  }

  if (!state || !cookieState || state !== cookieState) {
    return redirectToProfile(origin, returnPath, "error")
  }

  try {
    const redirectUri = `${origin}/api/account/link/linkedin/callback`

    const bodyParams = new URLSearchParams()
    bodyParams.set("grant_type", "authorization_code")
    bodyParams.set("code", code)
    bodyParams.set("client_id", process.env.AUTH_LINKEDIN_ID || "")
    bodyParams.set("client_secret", process.env.AUTH_LINKEDIN_SECRET || "")
    bodyParams.set("redirect_uri", redirectUri)

    const tokenResponse = await fetch(LINKEDIN_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams.toString(),
    })

    if (!tokenResponse.ok) {
      console.error("LinkedIn token exchange failed:", await tokenResponse.text())
      return redirectToProfile(origin, returnPath, "error")
    }

    const tokenData: {
      access_token: string
      refresh_token?: string
      id_token?: string
      token_type?: string
      expires_in?: number
      scope?: string
    } = await tokenResponse.json()

    const meResponse = await fetch(LINKEDIN_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!meResponse.ok) {
      console.error("LinkedIn profile fetch failed:", await meResponse.text())
      return redirectToProfile(origin, returnPath, "error")
    }

    // LinkedIn zwraca identyfikator użytkownika w polu "sub" (OpenID Connect)
    const profile: { sub?: string } = await meResponse.json()
    const linkedinUserId = profile.sub

    if (!linkedinUserId) {
      console.error("LinkedIn profile missing ID")
      return redirectToProfile(origin, returnPath, "error")
    }

    // To konto LinkedIn może być już powiązane z innym użytkownikiem serwisu
    const existingAccount = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "linkedin",
          providerAccountId: linkedinUserId,
        },
      },
    })

    if (existingAccount && existingAccount.userId !== session.user.id) {
      return redirectToProfile(origin, returnPath, "in_use")
    }

    const accountData = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? null,
      id_token: tokenData.id_token ?? null,
      token_type: tokenData.token_type ?? "bearer",
      expires_at: tokenData.expires_in
        ? Math.floor(Date.now() / 1000) + tokenData.expires_in
        : null,
      scope: tokenData.scope || LINKEDIN_SCOPE,
    }

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: accountData,
      })
    } else {
      // Usuń ewentualne wcześniejsze powiązanie z innym profilem LinkedIn
      await prisma.account.deleteMany({
        where: { userId: session.user.id, provider: "linkedin" },
      })
      await prisma.account.create({
        data: {
          userId: session.user.id,
          type: "oidc",
          provider: "linkedin",
          providerAccountId: linkedinUserId,
          ...accountData,
        },
      })
    }

    return redirectToProfile(origin, returnPath, "success")
  } catch (error) {
    console.error("Error linking LinkedIn account:", error)
    return redirectToProfile(origin, returnPath, "error")
  }
}
