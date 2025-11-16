import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, generateEmailVerificationEmail } from "@/lib/email"
import crypto from "crypto"
import { UserRole } from "@prisma/client"

/**
 * POST /api/auth/resend-verification
 * WysyBa ponownie email weryfikacyjny
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email jest wymagany" },
        { status: 400 }
      )
    }

    // Znajdz u|ytkownika
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Ze wzgldów bezpieczeDstwa nie informujemy, |e u|ytkownik nie istnieje
      return NextResponse.json(
        { message: "Je[li konto o tym adresie email istnieje, wysBali[my nowy link weryfikacyjny." },
        { status: 200 }
      )
    }

    // Sprawdz czy email nie zostaB ju| zweryfikowany
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email zostaB ju| zweryfikowany. Mo|esz si zalogowa." },
        { status: 400 }
      )
    }

    // UsuD stare tokeny weryfikacyjne dla tego u|ytkownika
    await prisma.verificationToken.deleteMany({
      where: { identifier: user.email },
    })

    // Generuj nowy token weryfikacyjny
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpiry = new Date()
    verificationExpiry.setHours(verificationExpiry.getHours() + 24) // Token wa|ny 24 godziny

    // Zapisz nowy token
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        expires: verificationExpiry,
      },
    })

    // Wy[lij email weryfikacyjny
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`
    const isLawFirm = user.role === UserRole.LAW_FIRM
    const emailContent = generateEmailVerificationEmail(
      verificationUrl,
      user.name || user.email,
      isLawFirm
    )

    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })

    return NextResponse.json(
      { message: "Link weryfikacyjny zostaB wysBany na Twój adres email." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "WystpiB bBd podczas wysyBania emaila weryfikacyjnego" },
      { status: 500 }
    )
  }
}
