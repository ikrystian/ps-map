import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"
import { sendEmail, generateNewsletterVerificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, imie } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email jest wymagany" },
        { status: 400 }
      )
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const verificationUrl = `${baseUrl}/api/newsletter/confirm?token=${verificationToken}`
    const emailContent = generateNewsletterVerificationEmail(verificationUrl, email)

    // Check if email already exists
    const existingSubscription = await prisma.newsletter.findUnique({
      where: { email }
    })

    if (existingSubscription) {
      if (existingSubscription.potwierdzony && existingSubscription.aktywny) {
        return NextResponse.json(
          { error: "Ten adres e-mail jest już zapisany do newslettera" },
          { status: 400 }
        )
      }

      // If already registered but not confirmed, or inactive (unsubscribed), reset status & send confirmation email
      await prisma.newsletter.update({
        where: { email },
        data: {
          aktywny: false, // will become active upon confirmation
          potwierdzony: false,
          tokenPotwierdzajacy: verificationToken,
          imie: imie || existingSubscription.imie,
          dataZapisu: new Date(),
          dataRezygnacji: null,
        }
      })

      // Send verification email
      await sendEmail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      })

      return NextResponse.json({
        message: "Na Twój adres e-mail został wysłany link potwierdzający. Potwierdź subskrypcję, aby aktywować zapis."
      }, { status: 200 })
    }

    // Create new subscription as unconfirmed/inactive
    await prisma.newsletter.create({
      data: {
        email,
        imie: imie || null,
        zgoda: true,
        aktywny: false,
        potwierdzony: false,
        tokenPotwierdzajacy: verificationToken,
      }
    })

    // Send verification email
    await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })

    return NextResponse.json({
      message: "Na Twój adres e-mail został wysłany link potwierdzający. Potwierdź subskrypcję, aby aktywować zapis."
    }, { status: 201 })
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas zapisywania do newslettera" },
      { status: 500 }
    )
  }
}
