import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Walidacja
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Wszystkie pola są wymagane" },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Nowe hasło musi mieć minimum 8 znaków" },
        { status: 400 }
      )
    }

    // Pobierz użytkownika z hasłem
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Użytkownik nie znaleziony lub nie ma ustawionego hasła" },
        { status: 404 }
      )
    }

    // Sprawdź obecne hasło
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Obecne hasło jest nieprawidłowe" },
        { status: 400 }
      )
    }

    // Zahashuj nowe hasło
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Zaktualizuj hasło
    await db.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
      },
    })

    return NextResponse.json({ message: "Hasło zostało zmienione" })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
