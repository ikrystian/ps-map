import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/auth/verify-email?token=...
 * Weryfikuje adres email użytkownika na podstawie tokenu
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Brak tokenu weryfikacyjnego" },
        { status: 400 }
      )
    }

    // Znajdź token weryfikacyjny
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Nieprawidłowy token weryfikacyjny" },
        { status: 400 }
      )
    }

    // Sprawdź czy token nie wygasł
    if (verificationToken.expires < new Date()) {
      // Usuń wygasły token
      await prisma.verificationToken.delete({
        where: { token },
      })

      return NextResponse.json(
        { error: "Token weryfikacyjny wygasł. Poproś o nowy link weryfikacyjny." },
        { status: 400 }
      )
    }

    // Znajdź użytkownika po email (identifier)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Nie znaleziono użytkownika" },
        { status: 404 }
      )
    }

    // Sprawdź czy email nie został już zweryfikowany
    if (user.emailVerified) {
      // Usuń token
      await prisma.verificationToken.delete({
        where: { token },
      })

      return NextResponse.json(
        {
          message: "Email został już wcześniej zweryfikowany",
          alreadyVerified: true,
        },
        { status: 200 }
      )
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

    return NextResponse.json(
      {
        message: "Email został pomyślnie zweryfikowany. Możesz się teraz zalogować.",
        verified: true,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas weryfikacji emaila" },
      { status: 500 }
    )
  }
}
