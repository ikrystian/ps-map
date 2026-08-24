import { auth } from "@/lib/auth"
import { CONSULTATION_FORM_LABELS } from "@/lib/consultation-requests"
import { sendSystemNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/consultation-interests/[id]/accept
 *
 * Klient wybiera zgłoszenie eksperta. Akceptacja tworzy `ConsultationBooking`
 * ze statusem ACCEPTED – obie strony już się zgodziły (ekspert proponując termin,
 * klient akceptując). Dzięki temu booking od razu obsługują istniejące mechanizmy:
 * generowanie linku Google Meet (`lib/consultations.ts`), przypomnienia
 * oraz panele konsultacji klienta i eksperta.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 })
    }

    if (session.user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Tylko klient może przyjąć zgłoszenie" },
        { status: 403 }
      )
    }

    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
      select: { id: true, imie: true, nazwisko: true },
    })

    if (!client) {
      return NextResponse.json({ error: "Nie znaleziono profilu klienta" }, { status: 404 })
    }

    const interest = await prisma.consultationInterest.findUnique({
      where: { id },
      include: {
        request: true,
        lawFirm: { select: { id: true, nazwa: true, userId: true } },
      },
    })

    if (!interest) {
      return NextResponse.json({ error: "Nie znaleziono zgłoszenia" }, { status: 404 })
    }

    if (interest.request.clientId !== client.id) {
      return NextResponse.json({ error: "Brak dostępu do tego zgłoszenia" }, { status: 403 })
    }

    if (interest.status !== "ZLOZONE") {
      return NextResponse.json(
        { error: "To zgłoszenie zostało już rozpatrzone" },
        { status: 400 }
      )
    }

    if (interest.request.bookingId) {
      return NextResponse.json(
        { error: "Konsultacja do tego zapytania jest już umówiona" },
        { status: 400 }
      )
    }

    const now = new Date()

    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.consultationBooking.create({
        data: {
          lawFirmId: interest.lawFirmId,
          clientId: client.id,
          consultationDate: interest.proponowanyTermin,
          duration: interest.duration,
          price: interest.cena,
          topic: interest.request.temat,
          clientContact: interest.request.telefonKontakt,
          status: "ACCEPTED",
          paymentStatus: "OCZEKUJE",
        },
      })

      await tx.consultationInterest.update({
        where: { id: interest.id },
        data: { status: "ZAAKCEPTOWANE", zaakceptowaneData: now },
      })

      // Pozostałe zgłoszenia do tego zapytania automatycznie odrzucone
      await tx.consultationInterest.updateMany({
        where: { requestId: interest.requestId, id: { not: interest.id }, status: "ZLOZONE" },
        data: { status: "ODRZUCONE", odrzuconeData: now },
      })

      await tx.consultationRequest.update({
        where: { id: interest.requestId },
        data: { status: "UMOWIONA", bookingId: newBooking.id, zamknieto: now },
      })

      return newBooking
    })

    const baseUrl = process.env.NEXTAUTH_URL || process.env.URL || "http://localhost:3000"
    const terminText = interest.proponowanyTermin.toLocaleString("pl-PL", {
      timeZone: "Europe/Warsaw",
    })

    try {
      const { notification } = await sendSystemNotification({
        userId: interest.lawFirm.userId,
        typ: "ZAINTERESOWANIE_ZAAKCEPTOWANE",
        tytul: "Klient przyjął Twoje zgłoszenie",
        tresc: `Konsultacja "${interest.request.temat}" została umówiona na ${terminText}. Kontakt do klienta: ${interest.request.telefonKontakt}.`,
        linkUrl: "/panel-eksperta/konsultacje",
        emailTemplateType: "ZAINTERESOWANIE_ZAAKCEPTOWANE",
        emailVariables: {
          "{ekspert}": interest.lawFirm.nazwa,
          "{klient}": `${client.imie} ${client.nazwisko}`,
          "{temat}": interest.request.temat,
          "{termin}": terminText,
          "{czas}": `${interest.duration} min`,
          "{cena}": `${interest.cena} PLN`,
          "{forma}": CONSULTATION_FORM_LABELS[interest.forma],
          "{telefon}": interest.request.telefonKontakt,
          "{linkDoPanelu}": `${baseUrl}/panel-eksperta/konsultacje`,
        },
      })

      const { emitNewNotification } = await import("@/lib/socket")
      await emitNewNotification(interest.lawFirm.userId, notification)
    } catch (notifyError) {
      console.error("Failed to notify law firm about accepted interest:", notifyError)
    }

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error("Error accepting consultation interest:", error)
    return NextResponse.json({ error: "Błąd podczas przyjmowania zgłoszenia" }, { status: 500 })
  }
}
