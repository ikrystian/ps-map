import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    // Walidacja
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token jest wymagany" },
        { status: 400 }
      )
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Hasło jest wymagane" },
        { status: 400 }
      )
    }

    // Walidacja siły hasła
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Hasło musi mieć co najmniej 8 znaków" },
        { status: 400 }
      )
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Hasło musi zawierać co najmniej jedną wielką literę" },
        { status: 400 }
      )
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: "Hasło musi zawierać co najmniej jedną małą literę" },
        { status: 400 }
      )
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Hasło musi zawierać co najmniej jedną cyfrę" },
        { status: 400 }
      )
    }

    // Hash tokenu (token w URL jest niezahashowany, w bazie jest zahashowany)
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    // Znajdź użytkownika z pasującym tokenem
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date(), // Token nie wygasł
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Token jest nieprawidłowy lub wygasł. Zażądaj nowego linku resetującego." },
        { status: 400 }
      )
    }

    // Hash nowego hasła
    const hashedPassword = await bcrypt.hash(password, 10)

    // Zaktualizuj hasło użytkownika i usuń token resetowania
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    console.log(`Password successfully reset for user: ${user.email}`)

    return NextResponse.json(
      { message: "Hasło zostało pomyślnie zresetowane" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in reset-password:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd. Spróbuj ponownie później." },
      { status: 500 }
    )
  }
}
