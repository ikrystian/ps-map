import { auth } from "@/lib/auth"
import { sendEmailWithTemplate } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { EmailType } from "@prisma/client"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

const EMAIL_CHANGE_TTL_MS = 24 * 60 * 60 * 1000

/**
 * POST /api/account/email-change — prośba o zmianę adresu e-mail.
 * Adres zmienia się dopiero po kliknięciu linku wysłanego na NOWY adres
 * (GET /api/account/email-change/confirm). Konta z hasłem muszą je podać.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }
    if (session.impersonatorId) {
      return NextResponse.json(
        { error: "Nie można zmienić adresu e-mail podczas sesji przejętej przez administratora" },
        { status: 403 }
      )
    }

    const rl = rateLimit(`email-change:${session.user.id}:${getClientIp(request)}`, {
      limit: 5,
      windowMs: 60 * 60 * 1000,
    })
    if (!rl.success) return tooManyRequestsResponse(rl.retryAfterSeconds)

    const body = await request.json().catch(() => ({}))
    const newEmail = typeof body?.newEmail === "string" ? body.newEmail.trim().toLowerCase() : ""
    const password = typeof body?.password === "string" ? body.password : ""

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return NextResponse.json({ error: "Podaj poprawny adres e-mail" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, password: true, imie: true, name: true, client: { select: { imie: true } } },
    })
    if (!user) {
      return NextResponse.json({ error: "Nie znaleziono użytkownika" }, { status: 404 })
    }

    if (newEmail === user.email.toLowerCase()) {
      return NextResponse.json({ error: "To jest Twój obecny adres e-mail" }, { status: 400 })
    }

    if (user.password) {
      if (!password) {
        return NextResponse.json({ error: "Podaj aktualne hasło" }, { status: 400 })
      }
      if (!(await bcrypt.compare(password, user.password))) {
        return NextResponse.json({ error: "Nieprawidłowe hasło" }, { status: 400 })
      }
    }

    const taken = await prisma.user.findUnique({ where: { email: newEmail }, select: { id: true } })
    if (taken) {
      return NextResponse.json({ error: "Ten adres e-mail jest już zajęty" }, { status: 409 })
    }

    // Jedna aktywna prośba na konto — nowy link unieważnia poprzednie
    const token = crypto.randomBytes(32).toString("hex")
    await prisma.$transaction([
      prisma.emailChangeRequest.deleteMany({ where: { userId: user.id } }),
      prisma.emailChangeRequest.create({
        data: { userId: user.id, newEmail, token, expires: new Date(Date.now() + EMAIL_CHANGE_TTL_MS) },
      }),
    ])

    const baseUrl = (process.env.NEXTAUTH_URL || process.env.URL || "http://localhost:3000").replace(/\/$/, "")
    const sent = await sendEmailWithTemplate({
      to: newEmail,
      templateType: EmailType.ZMIANA_EMAIL,
      variables: {
        "{imie}": user.client?.imie || user.imie || user.name || "",
        "{nowyEmail}": newEmail,
        "{linkPotwierdzenia}": `${baseUrl}/api/account/email-change/confirm?token=${token}`,
      },
    })
    if (!sent) {
      return NextResponse.json(
        { error: "Nie udało się wysłać wiadomości z linkiem. Spróbuj ponownie później." },
        { status: 502 }
      )
    }

    return NextResponse.json({ message: `Wysłaliśmy link potwierdzający na ${newEmail}` })
  } catch (error) {
    console.error("Email change request error:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas zmiany adresu e-mail" }, { status: 500 })
  }
}
