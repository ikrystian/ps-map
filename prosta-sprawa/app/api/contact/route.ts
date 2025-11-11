import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

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

    // TODO: Wysyłanie emaila do kancelarii
    // Tutaj można dodać integrację z serwisem email (np. SendGrid, AWS SES)
    // await sendEmail({
    //   to: lawFirm.emailKontakt,
    //   subject: `Nowa wiadomość z formularza kontaktowego - ${imieNazwisko}`,
    //   html: emailTemplate,
    // })

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
