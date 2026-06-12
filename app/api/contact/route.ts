import { generateContactFormEmail } from "@/lib/email"
import { sendSystemNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { ContactSubject } from "@prisma/client"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(`contact:${getClientIp(request)}`, { limit: 10, windowMs: 60 * 60 * 1000 })
    if (!rl.success) return tooManyRequestsResponse(rl.retryAfterSeconds)

    const body = await request.json()
    const {
      lawFirmId,
      imieNazwisko,
      miasto,
      wojewodztwo,
      email,
      telefon,
      typSprawy,
      tresc,
      politykaPrivacy,
      temat, // opcjonalny temat z formularza (enum ContactSubject)
    } = body

    // Walidacja wymaganych pól (lawFirmId jest teraz opcjonalny)
    if (!imieNazwisko || !email || !tresc || !politykaPrivacy) {
      return Response.json(
        { error: "Brak wymaganych pól" },
        { status: 400 }
      )
    }

    // Walidacja email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: "Nieprawidłowy adres email" },
        { status: 400 }
      )
    }

    // Ustal temat (enum ContactSubject)
    let subjectEnum: ContactSubject = ContactSubject.INFORMACJA
    if (temat && Object.values(ContactSubject).includes(temat)) {
      subjectEnum = temat as ContactSubject
    }

    // Zapisz wiadomość w bazie danych
    const message = await prisma.contactForm.create({
      data: {
        imieNazwisko,
        email,
        telefon: telefon || null,
        temat: subjectEnum,
        wiadomosc: tresc,
      },
    })

    // Jeśli podano lawFirmId, powiąż/wyślij powiadomienie do ekspercie
    if (lawFirmId) {
      // Sprawdź czy ekspert istnieje
      const lawFirm = await prisma.lawFirm.findUnique({
        where: { id: lawFirmId },
        select: {
          nazwa: true,
          userId: true,
        },
      })

      if (!lawFirm) {
        return Response.json(
          { error: "Nie znaleziono ekspercie" },
          { status: 404 }
        )
      }

      // Utwórz powiadomienie dla ekspertów (wraz z weryfikacją wysłania maila)
      let emailData
      if (law.Firm.user?.email) {
        emailData = generateContactFormEmail(
          lawFirm.nazwaFirmy,
          law.Firm.user?.email,
          imieNazwisko,
          email,
          telefon,
          typSprawy || "Kontakt przez formularz",
          tresc
        )
      }

      await sendSystemNotification({
        userId: lawFirm.userId,
        typ: "NOWA_WIADOMOSC",
        tytul: "Nowa wiadomość kontaktowa",
        tresc: `${imieNazwisko} wysłał(a) wiadomość przez formularz kontaktowy`,
        linkUrl: `/panel-eksperta/wiadomosci`,
        emailSubject: emailData?.subject,
        emailHtml: emailData?.html,
        emailText: emailData?.text,
      })
    }

    return Response.json(
      {
        message: "Wiadomość została wysłana",
        id: message.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error sending contact message:", error)
    return Response.json(
      { error: "Błąd podczas wysyłania wiadomości" },
      { status: 500 }
    )
  }
}
