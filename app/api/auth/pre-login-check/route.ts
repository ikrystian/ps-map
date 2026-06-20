import { logLoginAttempt } from "@/lib/login-history"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Brak wymaganych danych logowania" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Nieprawidłowy email lub hasło" },
        { status: 401 }
      )
    }

    // Jeśli użytkownik rejestrował się przez Google/Facebook/Apple i nie ma hasła
    if (!user.password) {
      return NextResponse.json(
        {
          error: "To konto zostało utworzone za pomocą logowania społecznościowego (Google, Facebook lub Apple). Zaloguj się za pomocą odpowiedniego przycisku poniżej."
        },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      await logLoginAttempt({ userId: user.id, success: false })
      return NextResponse.json(
        { error: "Nieprawidłowy email lub hasło" },
        { status: 401 }
      )
    }

    // Sprawdź czy konto jest zablokowane lub zawieszone
    if (user.status === "BLOCKED" || user.status === "SUSPENDED") {
      await logLoginAttempt({ userId: user.id, success: false })
      return NextResponse.json(
        { error: "Twoje konto zostało zablokowane. Skontaktuj się z administratorem." },
        { status: 403 }
      )
    }

    // Sprawdź czy konto oczekuje na zatwierdzenie
    if (user.status === "PENDING") {
      await logLoginAttempt({ userId: user.id, success: false })
      return NextResponse.json(
        { error: "Twoje konto oczekuje na zatwierdzenie. Skontaktuj się z administratorem." },
        { status: 403 }
      )
    }

    // Sprawdź czy konto jest nieaktywne
    if (user.status === "INACTIVE") {
      await logLoginAttempt({ userId: user.id, success: false })
      return NextResponse.json(
        { error: "Twoje konto jest nieaktywne. Skontaktuj się z administratorem." },
        { status: 403 }
      )
    }

    // Sprawdź czy email został zweryfikowany
    if (!user.emailVerified) {
      await logLoginAttempt({ userId: user.id, success: false })
      return NextResponse.json(
        { error: "Email nie został zweryfikowany. Sprawdź swoją skrzynkę pocztową i kliknij link weryfikacyjny." },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in pre-login-check API:", error)
    return NextResponse.json(
      { error: "Wystąpił wewnętrzny błąd serwera" },
      { status: 500 }
    )
  }
}
