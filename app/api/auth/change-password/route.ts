import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nie jesteś zalogowany" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Obecne i nowe hasło są wymagane" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Użytkownik nie znaleziony" },
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

    // Hashuj nowe hasło
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Zaktualizuj hasło
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json(
      { message: "Hasło zostało zmienione" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd" },
      { status: 500 }
    )
  }
}
