import { generatePasswordResetEmail, sendEmail } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Walidacja
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Adres email jest wymagany" },
        { status: 400 }
      )
    }

    // Normalizacja email (lowercase)
    const normalizedEmail = email.toLowerCase().trim()

    // Znajdź użytkownika
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    // Z powodów bezpieczeństwa, zawsze zwracamy sukces, nawet jeśli użytkownik nie istnieje
    // To zapobiega wyciekowi informacji o istniejących kontach
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${normalizedEmail}`)
      return NextResponse.json(
        { message: "Jeśli konto istnieje, link resetujący został wysłany" },
        { status: 200 }
      )
    }

    // Generuj bezpieczny token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    // Ustaw token i jego ważność (1 godzina)
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 godzina

    // Zapisz token w bazie danych
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry,
      },
    })

    // Wygeneruj URL resetowania
    const baseUrl = process.env.NEXTAUTH_URL ||
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const resetUrl = `${baseUrl}/reset-hasla?token=${resetToken}`

    // Przygotuj email
    const { subject, html, text } = generatePasswordResetEmail(resetUrl, user.name || undefined)

    // Wyślij email
    const emailSent = await sendEmail({
      to: user.email,
      subject,
      html,
      text,
    })

    if (!emailSent) {
      console.error("Failed to send password reset email")
      // Nie ujawniamy błędu wysyłki emaila użytkownikowi
    }

    console.log(`Password reset email sent to: ${user.email}`)
    if (process.env.NODE_ENV === "development") {
      console.log(`Reset URL (dev only): ${resetUrl}`)
    }

    return NextResponse.json(
      { message: "Jeśli konto istnieje, link resetujący został wysłany" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in forgot-password:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd. Spróbuj ponownie później." },
      { status: 500 }
    )
  }
}
