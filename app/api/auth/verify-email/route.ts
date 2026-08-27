import { unlockGatedCasesForUser } from "@/lib/case-notifications"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/auth/verify-email?token=...
 * Weryfikuje adres email użytkownika na podstawie tokenu
 */
export async function GET(request: NextRequest) {
  // Za reverse proxy request.url wskazuje na wewnętrzny adres (localhost),
  // dlatego przekierowania budujemy na publicznym adresie z NEXTAUTH_URL
  const baseUrl = process.env.NEXTAUTH_URL || request.url

  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(new URL('/weryfikacja-email?error=brak-tokenu', baseUrl))
    }

    // Znajdź token weryfikacyjny
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.redirect(new URL('/weryfikacja-email?error=nieprawidlowy-token', baseUrl))
    }

    // Sprawdź czy token nie wygasł
    if (verificationToken.expires < new Date()) {
      // Usuń wygasły token
      await prisma.verificationToken.delete({
        where: { token },
      })

      return NextResponse.redirect(new URL('/weryfikacja-email?error=wygasly-token', baseUrl))
    }

    // Znajdź użytkownika po email (identifier)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!user) {
      return NextResponse.redirect(new URL('/weryfikacja-email?error=nie-znaleziono-uzytkownika', baseUrl))
    }

    // Sprawdź czy email nie został już zweryfikowany. Uwaga: rejestracja z kreatora
    // /dodaj-sprawe ustawia `emailVerified` od razu (na podstawie weryfikacji SMS),
    // więc znalezienie tego tokenu wciąż nieusuniętym to JEDYNY dowód, że to pierwsze
    // realne kliknięcie linku — dlatego odblokowujemy ukryte sprawy w obu gałęziach.
    if (user.emailVerified) {
      await unlockGatedCasesForUser(user.id)

      // Usuń token
      await prisma.verificationToken.delete({
        where: { token },
      })

      return NextResponse.redirect(new URL('/weryfikacja-email?status=juz-zweryfikowany', baseUrl))
    }

    // Zaktualizuj użytkownika - oznacz email jako zweryfikowany
    // i aktywuj konto jeśli oczekiwało na weryfikację (PENDING)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        ...(user.status === "PENDING" ? { status: "ACTIVE" } : {}),
      },
    })

    await unlockGatedCasesForUser(user.id)

    // Usuń użyty token
    await prisma.verificationToken.delete({
      where: { token },
    })

    return NextResponse.redirect(new URL('/weryfikacja-email?status=sukces', baseUrl))
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(new URL('/weryfikacja-email?error=blad-serwera', baseUrl))
  }
}
