import { generateContactFormBokEmail, generateContactFormEmail, sendEmail } from "@/lib/email"
import { sendSystemNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { ContactSubject } from "@prisma/client"
import { NextRequest } from "next/server"

/** Skrzynka BOK, na którą trafiają zapytania z formularza kontaktowego */
const BOK_EMAIL = process.env.CONTACT_FORM_EMAIL || "bok@prostasprawa.pl"

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
      zrodlo: zrodloBody,
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

    // Wiadomość skierowana do konkretnego eksperta (formularz na /ekspert/[slug])
    // musi mieć potwierdzonego adresata, zanim zapiszemy ją w bazie.
    let lawFirm = null
    if (lawFirmId) {
      lawFirm = await prisma.lawFirm.findUnique({
        where: { id: lawFirmId },
        select: {
          nazwa: true,
          userId: true,
          user: {
            select: {
              email: true,
            }
          }
        },
      })

      if (!lawFirm) {
        return Response.json(
          { error: "nie znaleziono eksperta" },
          { status: 404 }
        )
      }
    }

    // Ustal źródło wiadomości (EKSPERT, KONTAKT, REKLAMA)
    const zrodlo = lawFirmId
      ? "EKSPERT"
      : zrodloBody || (tresc.includes("[Zapytanie z Landing Page Reklama]") ? "REKLAMA" : "KONTAKT")

    // Zapisz wiadomość w bazie danych
    const message = await prisma.contactForm.create({
      data: {
        imieNazwisko,
        email,
        telefon: telefon || null,
        temat: subjectEnum,
        wiadomosc: tresc,
        zrodlo,
        lawFirmId: lawFirmId || null,
      },
    })

    // Powiadom eksperta o nowej wiadomości
    if (lawFirm) {
      // Utwórz powiadomienie dla ekspertów (wraz z weryfikacją wysłania maila)
      let emailData
      if (lawFirm.user?.email) {
        emailData = generateContactFormEmail(
          lawFirm.nazwa,
          lawFirm.user?.email,
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
    } else {
      // Zapytanie ogólne (formularze /kontakt, /reklama) - wyślij na skrzynkę BOK.
      // replyTo = adres nadawcy, żeby odpowiedź z BOK trafiła wprost do niego.
      const bokEmail = generateContactFormBokEmail({
        senderName: imieNazwisko,
        senderEmail: email,
        senderPhone: telefon,
        subject: subjectEnum,
        message: tresc,
        messageId: message.id,
      })

      const sent = await sendEmail({
        to: BOK_EMAIL,
        subject: bokEmail.subject,
        html: bokEmail.html,
        text: bokEmail.text,
        replyTo: email,
        templateType: "KONTAKT_BOK",
      })

      if (!sent) {
        // Wiadomość jest już zapisana w bazie - nie przerywamy odpowiedzi dla użytkownika
        console.error(`Nie udało się wysłać zapytania kontaktowego ${message.id} na ${BOK_EMAIL}`)
      }
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
