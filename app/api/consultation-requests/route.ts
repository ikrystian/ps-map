import { auth } from "@/lib/auth"
import { CONSULTATION_FORM_LABELS, CONSULTATION_DURATIONS } from "@/lib/consultation-requests"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { sendSystemNotification } from "@/lib/notifications"
import { Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

const MIN_OPIS_LENGTH = 100

const requestInclude = {
  category: { select: { id: true, nazwa: true, slug: true } },
  client: {
    select: {
      id: true,
      imie: true,
      nazwisko: true,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  },
  interests: {
    include: {
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
    orderBy: { createdAt: "desc" as const },
  },
} as const

/**
 * GET /api/consultation-requests
 * CLIENT   – własne zapytania wraz ze zgłoszeniami ekspertów
 * LAW_FIRM – zapytania pasujące do zadeklarowanych kategorii (patrz lib/consultation-requests.ts)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeAll = searchParams.get("includeAll") === "true"

    if (session.user.role === "CLIENT") {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })

      if (!client) {
        return NextResponse.json({ error: "Nie znaleziono profilu klienta" }, { status: 404 })
      }

      const requests = await prisma.consultationRequest.findMany({
        where: { clientId: client.id, ...(includeAll ? {} : { isArchived: false }) },
        include: requestInclude,
        orderBy: { createdAt: "desc" },
      })

      return NextResponse.json(requests)
    }

    if (session.user.role === "LAW_FIRM") {
      const lawFirm = await prisma.lawFirm.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })

      if (!lawFirm) {
        return NextResponse.json({ error: "Nie znaleziono profilu eksperta" }, { status: 404 })
      }

      // Bez dopasowania po kategoriach ani lokalizacji – każdy ekspert widzi
      // wszystkie zapytania. Ograniczamy wyłącznie do wciąż otwartych.
      const where: Prisma.ConsultationRequestWhereInput = includeAll
        ? {}
        : { status: { in: ["NOWE", "ZGLOSZENIA_OTRZYMANE"] }, isArchived: false }

      const requests = await prisma.consultationRequest.findMany({
        where,
        include: requestInclude,
        orderBy: { createdAt: "desc" },
      })

      // Ekspert nie widzi, kto jeszcze się zgłosił – zostawiamy tylko jego własne zgłoszenie
      const sanitized = requests.map((req) => ({
        ...req,
        interests: req.interests.filter((i) => i.lawFirmId === lawFirm.id),
        liczbaZgloszen: req.interests.length,
      }))

      return NextResponse.json(sanitized)
    }

    return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 })
  } catch (error) {
    console.error("Error fetching consultation requests:", error)
    return NextResponse.json({ error: "Błąd podczas pobierania zapytań o konsultacje" }, { status: 500 })
  }
}

/**
 * POST /api/consultation-requests
 * Klient opisuje sprawę – zapytanie trafia do wszystkich pasujących ekspertów.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 })
    }

    if (session.user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Tylko klienci mogą zamawiać konsultacje" },
        { status: 403 }
      )
    }

    const rl = rateLimit(`consultation-request:${session.user.id}:${getClientIp(request)}`, {
      limit: 10,
      windowMs: 60 * 60 * 1000,
    })
    if (!rl.success) {
      return tooManyRequestsResponse(rl.retryAfterSeconds)
    }

    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
      select: { id: true, imie: true, nazwisko: true },
    })

    if (!client) {
      return NextResponse.json({ error: "Nie znaleziono profilu klienta" }, { status: 404 })
    }

    const body = await request.json()
    const {
      temat,
      opis,
      categoryId,
      forma,
      preferowanyCzas,
      preferowanyTermin,
      terminOd,
      terminDo,
      budzetDo,
      imieNazwisko,
      telefonKontakt,
      akceptujeKlauzule,
    } = body

    if (!temat || !opis || !imieNazwisko || !telefonKontakt) {
      return NextResponse.json(
        { error: "Temat, opis oraz dane kontaktowe są wymagane" },
        { status: 400 }
      )
    }

    if (typeof opis !== "string" || opis.trim().length < MIN_OPIS_LENGTH) {
      return NextResponse.json(
        { error: `Opis sprawy musi mieć minimum ${MIN_OPIS_LENGTH} znaków` },
        { status: 400 }
      )
    }

    if (!akceptujeKlauzule) {
      return NextResponse.json(
        { error: "Musisz zaakceptować regulamin i politykę prywatności" },
        { status: 400 }
      )
    }

    const formaValue = forma && CONSULTATION_FORM_LABELS[forma] ? forma : "DOWOLNA"

    if (preferowanyCzas != null && !CONSULTATION_DURATIONS.includes(Number(preferowanyCzas) as never)) {
      return NextResponse.json(
        { error: "Preferowany czas konsultacji musi wynosić 15, 30 lub 60 minut" },
        { status: 400 }
      )
    }

    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } })
      if (!categoryExists) {
        return NextResponse.json({ error: "Nie znaleziono wybranej kategorii" }, { status: 400 })
      }
    }

    const newRequest = await prisma.consultationRequest.create({
      data: {
        clientId: client.id,
        categoryId: categoryId || null,
        temat: String(temat).trim(),
        opis: opis.trim(),
        forma: formaValue,
        preferowanyCzas: preferowanyCzas != null ? Number(preferowanyCzas) : null,
        preferowanyTermin: preferowanyTermin?.trim() || null,
        terminOd: terminOd ? new Date(terminOd) : null,
        terminDo: terminDo ? new Date(terminDo) : null,
        budzetDo: budzetDo != null && budzetDo !== "" ? Number(budzetDo) : null,
        imieNazwisko: String(imieNazwisko).trim(),
        telefonKontakt: String(telefonKontakt).trim(),
        status: "NOWE",
      },
      include: {
        category: { select: { id: true, nazwa: true } },
      },
    })

    const baseUrl = process.env.NEXTAUTH_URL || process.env.URL || "http://localhost:3000"
    const kategoriaText = newRequest.category?.nazwa || "Konsultacja ogólna"
    const formaText = CONSULTATION_FORM_LABELS[newRequest.forma]
    const budzetText = newRequest.budzetDo ? `do ${newRequest.budzetDo} PLN` : "Do ustalenia"
    const { emitNewNotification } = await import("@/lib/socket")

    // Potwierdzenie dla klienta
    try {
      const { notification: clientNotification } = await sendSystemNotification({
        userId: session.user.id,
        typ: "SYSTEM",
        tytul: "Zapytanie o konsultację wysłane",
        tresc: `Twoje zapytanie "${newRequest.temat}" trafiło do ekspertów. Wkrótce otrzymasz propozycje terminów i cen.`,
        linkUrl: `/panel-klienta/konsultacje/zapytania/${newRequest.id}`,
        force: true,
      })
      await emitNewNotification(session.user.id, clientNotification)
    } catch (notifyError) {
      console.error("Failed to notify client about consultation request:", notifyError)
    }

    // Fan-out do ekspertów – bez filtra lokalizacji (konsultacja jest zdalna),
    // dopasowanie po kategoriach; ekspert bez zadeklarowanych kategorii widzi wszystko.
    const lawFirms = await prisma.lawFirm.findMany({
      where: {
        aktywna: true,
        user: { deletedAt: null },
        ...(newRequest.categoryId
          ? {
              OR: [
                { categories: { none: {} } },
                { categories: { some: { categoryId: newRequest.categoryId } } },
              ],
            }
          : {}),
      },
      select: { userId: true, nazwa: true },
    })

    console.log(
      `[NOTIFY] Found ${lawFirms.length} law firm(s) matching consultation request "${newRequest.temat}" (category: ${newRequest.categoryId ?? "brak"})`
    )

    for (const lf of lawFirms) {
      try {
        const { notification } = await sendSystemNotification({
          userId: lf.userId,
          typ: "NOWE_ZAPYTANIE_KONSULTACJI",
          tytul: "Nowe zapytanie o konsultację online",
          tresc: `💬 ${newRequest.temat} · ${kategoriaText} · ${formaText}. Zgłoś zainteresowanie i zaproponuj termin.`,
          linkUrl: `/panel-eksperta/konsultacje/zapytania/${newRequest.id}`,
          emailTemplateType: "NOWE_ZAPYTANIE_KONSULTACJI",
          emailVariables: {
            "{ekspert}": lf.nazwa,
            "{temat}": newRequest.temat,
            "{kategoria}": kategoriaText,
            "{forma}": formaText,
            "{budzet}": budzetText,
            "{klient}": `${client.imie} ${client.nazwisko}`,
            "{linkDoPanelu}": `${baseUrl}/panel-eksperta/konsultacje/zapytania/${newRequest.id}`,
          },
        })
        await emitNewNotification(lf.userId, notification)
      } catch (notifyError) {
        console.error(`Failed to notify law firm ${lf.nazwa} about consultation request:`, notifyError)
      }
    }

    return NextResponse.json(newRequest, { status: 201 })
  } catch (error) {
    console.error("Error creating consultation request:", error)
    return NextResponse.json(
      { error: "Błąd podczas tworzenia zapytania o konsultację" },
      { status: 500 }
    )
  }
}
