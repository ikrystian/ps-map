import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, generateContactFormEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
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
    } = body

    // Walidacja wymaganych pól
    if (!lawFirmId || !imieNazwisko || !email || !tresc || !politykaPrivacy) {
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

    // Sprawdź czy kancelaria istnieje
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { id: lawFirmId },
      select: {
        nazwa: true,
        emailKontakt: true,
        userId: true,
      },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono kancelarii" },
        { status: 404 }
      )
    }

    // Zapisz wiadomość w bazie danych
    const message = await prisma.contactForm.create({
      data: {
        imieNazwisko,
        email,
        telefon,
        temat: "INFORMACJA",
        wiadomosc: tresc,
      },
    })

    // Utwórz powiadomienie dla kancelarii
    await prisma.notification.create({
      data: {
        userId: lawFirm.userId,
        typ: "NOWA_WIADOMOSC",
        tytul: "Nowa wiadomość kontaktowa",
        tresc: `${imieNazwisko} wysłał(a) wiadomość przez formularz kontaktowy`,
        linkUrl: `/panel-kancelarii/wiadomosci`,
      },
    })

    // Send email to law firm
    if (lawFirm.emailKontakt) {
      const emailData = generateContactFormEmail(
        lawFirm.nazwa,
        lawFirm.emailKontakt,
        imieNazwisko,
        email,
        telefon,
        typSprawy || "Kontakt przez formularz",
        tresc
      )

      // Send email asynchronously (don't wait for it)
      sendEmail({
        to: lawFirm.emailKontakt,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      }).catch((error) => {
        console.error('Error sending contact form email:', error)
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
