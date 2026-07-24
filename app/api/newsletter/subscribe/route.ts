import { generateNewsletterVerificationEmail, sendEmailWithTemplate } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { EmailType } from "@prisma/client"
import crypto from "crypto"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const rl = rateLimit(`newsletter:${getClientIp(req)}`, { limit: 5, windowMs: 60 * 60 * 1000 })
    if (!rl.success) return tooManyRequestsResponse(rl.retryAfterSeconds)

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "E-mail jest wymagany" }, { status: 400 })
    }

    const existingSubscription = await prisma.newsletter.findUnique({
      where: { email }
    })

    if (existingSubscription && existingSubscription.aktywny) {
      return NextResponse.json({ message: "Ten e-mail jest już zapisany do newslettera" }, { status: 400 })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    await prisma.newsletter.upsert({
      where: { email },
      update: {
        tokenPotwierdzajacy: token,
        aktywny: false
      },
      create: {
        email,
        tokenPotwierdzajacy: token,
        aktywny: false
      }
    })

    const confirmationLink = `${process.env.NEXTAUTH_URL}/api/newsletter/confirm?token=${token}`

    await sendEmailWithTemplate({
      to: email,
      templateType: EmailType.NEWSLETTER_POTWIERDZENIE,
      variables: {
        "{email}": email,
        "{linkPotwierdzenia}": confirmationLink,
      },
      fallbackProvider: () => generateNewsletterVerificationEmail(confirmationLink, email),
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
