import { sendEmail } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
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

    const emailContent = {
      subject: "Potwierdź zapis do newslettera - Prosta Sprawa",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Witaj!</h1>
          <p>Dziękujemy za chęć zapisu do newslettera Prosta Sprawa.</p>
          <p>Aby potwierdzić subskrypcję i zacząć otrzymywać od nas wiadomości, kliknij v poniższy przycisk:</p>
          <div style="margin: 30px 0;">
            <a href="${confirmationLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Potwierdzam zapis</a>
          </div>
          <p>Jeśli to nie Ty prosiłeś o zapis, możesz zignorować tę wiadomość.</p>
          <p>Link jest ważny przez 24 godziny.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px;">Wiadomość wysłana automatycznie przez serwis Prosta Sprawa.</p>
        </div>
      `,
      text: `Witaj! Dziękujemy za chęć zapisu do newslettera Prosta Sprawa. Aby potwierdzić subskrypcję, kliknij w link: ${confirmationLink}`
    }

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
