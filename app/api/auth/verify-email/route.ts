import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

/**
 * GET /api/auth/verify-email?token=...
 * Weryfikuje adres email użytkownika na podstawie tokenu
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(new URL('/weryfikacja-email?error=brak-tokenu', request.url))
    }

    // Znajdź token weryfikacyjny
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.redirect(new URL('/weryfikacja-email?error=nieprawidlowy-token', request.url))
    }

    // Sprawdź czy token nie wygasł
    if (verificationToken.expires < new Date()) {
      // Usuń wygasły token
      await prisma.verificationToken.delete({
        where: { token },
      })

      return NextResponse.redirect(new URL('/weryfikacja-email?error=wygasly-token', request.url))
    }

    // Znajdź użytkownika po email (identifier)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!user) {
      return NextResponse.redirect(new URL('/weryfikacja-email?error=nie-znaleziono-uzytkownika', request.url))
    }

    // Sprawdź czy email nie został już zweryfikowany
    if (user.emailVerified) {
      // Usuń token
      await prisma.verificationToken.delete({
        where: { token },
      })

      return NextResponse.redirect(new URL('/weryfikacja-email?status=juz-zweryfikowany', request.url))
    }

    // Zaktualizuj użytkownika - oznacz email jako zweryfikowany
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    })

    // Usuń użyty token
    await prisma.verificationToken.delete({
      where: { token },
    })

    return NextResponse.redirect(new URL('/weryfikacja-email?status=sukces', request.url))
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(new URL('/weryfikacja-email?error=blad-serwera', request.url))
  }
}
