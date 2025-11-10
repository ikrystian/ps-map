import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, token, newPassword } = body

    // Jeśli tylko email - wyślij token resetujący
    if (email && !token && !newPassword) {
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        // Nie ujawniaj czy użytkownik istnieje
        return NextResponse.json(
          { message: "Jeśli email istnieje, zostanie wysłany link resetujący" },
          { status: 200 }
        )
      }

      // Generuj token
      const resetToken = crypto.randomBytes(32).toString("hex")
      const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 godzina

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      })

      // TODO: Wyślij email z linkiem resetującym
      // sendResetEmail(user.email, resetToken)

      return NextResponse.json(
        { message: "Link resetujący został wysłany na email" },
        { status: 200 }
      )
    }

    // Jeśli token i nowe hasło - resetuj hasło
    if (token && newPassword) {
      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date(),
          },
        },
      })

      if (!user) {
        return NextResponse.json(
          { error: "Token nieprawidłowy lub wygasł" },
          { status: 400 }
        )
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      })

      return NextResponse.json(
        { message: "Hasło zostało zresetowane" },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: "Nieprawidłowe dane" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd" },
      { status: 500 }
    )
  }
}
