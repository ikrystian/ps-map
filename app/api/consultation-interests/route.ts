import { auth } from "@/lib/auth"
import { CONSULTATION_DURATIONS, CONSULTATION_FORM_LABELS } from "@/lib/consultation-requests"
import { sendSystemNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

const MIN_WIADOMOSC_LENGTH = 100

/**
 * GET /api/consultation-interests?requestId=&lawFirmId=&status=&page=&limit=
 * LAW_FIRM widzi wyłącznie własne zgłoszenia, CLIENT wyłącznie zgłoszenia do swoich zapytań.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get("requestId")
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    const where: Record<string, unknown> = {}

    if (requestId) {
      where.requestId = requestId
    }

    const validStatuses = ["ZLOZONE", "ZAAKCEPTOWANE", "ODRZUCONE", "WYGASLE"]
    if (status === "active") {
      where.status = { in: ["ZLOZONE", "ZAAKCEPTOWANE"] }
    } else if (status && validStatuses.includes(status)) {
      where.status = status
    }

    if (session.user.role === "LAW_FIRM") {
      const lawFirm = await prisma.lawFirm.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })

      if (!lawFirm) {
        return NextResponse.json({ error: "Nie znaleziono profilu eksperta" }, { status: 404 })
      }

      where.lawFirmId = lawFirm.id
    } else if (session.user.role === "CLIENT") {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })

      if (!client) {
        return NextResponse.json({ error: "Nie znaleziono profilu klienta" }, { status: 404 })
      }

      where.request = { clientId: client.id }
    } else {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 })
    }

    const [interests, total] = await Promise.all([
      prisma.consultationInterest.findMany({
        where,
        include: {
          request: {
            select: {
              id: true,
              temat: true,
              status: true,
              forma: true,
              category: { select: { nazwa: true } },
              client: { select: { imie: true, nazwisko: true } },
            },
          },
          lawFirm: {
            select: {
              id: true,
              nazwa: true,
              slug: true,
              logo: true,
              user: {
                select: {
                  image: true,
                  miasto: true,
                  voivodeship: { select: { nazwa: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.consultationInterest.count({ where }),
    ])

    return NextResponse.json({
      interests,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error fetching consultation interests:", error)
    return NextResponse.json({ error: "Błąd podczas pobierania zgłoszeń" }, { status: 500 })
  }
}

/**
 * POST /api/consultation-interests
 * Ekspert zgłasza zainteresowanie odbyciem płatnej konsultacji, proponując termin, czas i cenę.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 })
    }

    if (session.user.role !== "LAW_FIRM") {
      return NextResponse.json(
        { error: "Tylko eksperci mogą zgłaszać zainteresowanie konsultacją" },
        { status: 403 }
      )
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      select: { id: true, nazwa: true, aktywna: true },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Nie znaleziono profilu eksperta" }, { status: 404 })
    }

    if (!lawFirm.aktywna) {
      return NextResponse.json(
        { error: "Twój profil jest nieaktywny – nie możesz zgłaszać się do konsultacji" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      requestId,
      proponowanyTermin,
      alternatywnyTermin,
      duration,
      cena,
      forma,
      wiadomosc,
    } = body

    if (!requestId || !proponowanyTermin || !duration || cena == null || !forma || !wiadomosc) {
      return NextResponse.json({ error: "Brak wymaganych pól" }, { status: 400 })
    }

    const termin = new Date(proponowanyTermin)
    if (Number.isNaN(termin.getTime()) || termin.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "Proponowany termin musi być datą w przyszłości" },
        { status: 400 }
      )
    }

    let terminAlternatywny: Date | null = null
    if (alternatywnyTermin) {
      terminAlternatywny = new Date(alternatywnyTermin)
      if (Number.isNaN(terminAlternatywny.getTime()) || terminAlternatywny.getTime() <= Date.now()) {
        return NextResponse.json(
          { error: "Termin alternatywny musi być datą w przyszłości" },
          { status: 400 }
        )
      }
    }

    if (!CONSULTATION_DURATIONS.includes(Number(duration) as never)) {
      return NextResponse.json(
        { error: "Czas konsultacji musi wynosić 15, 30 lub 60 minut" },
        { status: 400 }
      )
    }

    if (Number(cena) <= 0) {
      return NextResponse.json({ error: "Cena musi być większa od zera" }, { status: 400 })
    }

    if (!CONSULTATION_FORM_LABELS[forma] || forma === "DOWOLNA") {
      return NextResponse.json(
        { error: "Wybierz formę konsultacji: wideo lub telefon" },
        { status: 400 }
      )
    }

    if (typeof wiadomosc !== "string" || wiadomosc.trim().length < MIN_WIADOMOSC_LENGTH) {
      return NextResponse.json(
        { error: `Wiadomość do klienta musi mieć minimum ${MIN_WIADOMOSC_LENGTH} znaków` },
        { status: 400 }
      )
    }

    const consultationRequest = await prisma.consultationRequest.findUnique({
      where: { id: requestId },
      include: {
        client: { select: { id: true, imie: true, nazwisko: true, userId: true } },
        category: { select: { nazwa: true } },
      },
    })

    if (!consultationRequest) {
      return NextResponse.json({ error: "Nie znaleziono zapytania" }, { status: 404 })
    }

    if (!["NOWE", "ZGLOSZENIA_OTRZYMANE"].includes(consultationRequest.status)) {
      return NextResponse.json(
        { error: "To zapytanie nie przyjmuje już zgłoszeń" },
        { status: 400 }
      )
    }

    // Klient wskazał konkretną formę – zgłoszenie musi ją respektować
    if (consultationRequest.forma !== "DOWOLNA" && consultationRequest.forma !== forma) {
      return NextResponse.json(
        { error: `Klient oczekuje konsultacji w formie: ${CONSULTATION_FORM_LABELS[consultationRequest.forma]}` },
        { status: 400 }
      )
    }

    const existing = await prisma.consultationInterest.findUnique({
      where: { requestId_lawFirmId: { requestId, lawFirmId: lawFirm.id } },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Zgłosiłeś już zainteresowanie tą konsultacją" },
        { status: 400 }
      )
    }

    const interest = await prisma.$transaction(async (tx) => {
      const created = await tx.consultationInterest.create({
        data: {
          requestId,
          lawFirmId: lawFirm.id,
          proponowanyTermin: termin,
          alternatywnyTermin: terminAlternatywny,
          duration: Number(duration),
          cena: Number(cena),
          forma,
          wiadomosc: wiadomosc.trim(),
        },
      })

      if (consultationRequest.status === "NOWE") {
        await tx.consultationRequest.update({
          where: { id: requestId },
          data: { status: "ZGLOSZENIA_OTRZYMANE" },
        })
      }

      return created
    })

    // Powiadomienie poza transakcją – żeby przeszło przez ustawienia użytkownika i socket
    try {
      const baseUrl = process.env.NEXTAUTH_URL || process.env.URL || "http://localhost:3000"
      const terminText = termin.toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })

      const { notification } = await sendSystemNotification({
        userId: consultationRequest.client.userId,
        typ: "NOWE_ZAINTERESOWANIE_KONSULTACJA",
        tytul: "Ekspert zgłosił się do Twojej konsultacji",
        tresc: `${lawFirm.nazwa} proponuje ${duration} min ${CONSULTATION_FORM_LABELS[forma].toLowerCase()} za ${cena} PLN, termin: ${terminText}.`,
        linkUrl: `/panel-klienta/konsultacje/zapytania/${requestId}`,
        emailTemplateType: "NOWE_ZAINTERESOWANIE_KONSULTACJA",
        emailVariables: {
          "{klient}": `${consultationRequest.client.imie} ${consultationRequest.client.nazwisko}`,
          "{ekspert}": lawFirm.nazwa,
          "{temat}": consultationRequest.temat,
          "{termin}": terminText,
          "{czas}": `${duration} min`,
          "{cena}": `${cena} PLN`,
          "{forma}": CONSULTATION_FORM_LABELS[forma],
          "{linkDoPanelu}": `${baseUrl}/panel-klienta/konsultacje/zapytania/${requestId}`,
        },
      })

      const { emitNewNotification } = await import("@/lib/socket")
      await emitNewNotification(consultationRequest.client.userId, notification)
    } catch (notifyError) {
      console.error("Failed to notify client about consultation interest:", notifyError)
    }

    return NextResponse.json(interest, { status: 201 })
  } catch (error) {
    console.error("Error creating consultation interest:", error)
    return NextResponse.json({ error: "Błąd podczas zgłaszania zainteresowania" }, { status: 500 })
  }
}
