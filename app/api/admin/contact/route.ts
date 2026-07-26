import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ContactSubject, Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/contact - Pobieranie listy wiadomości z formularzy kontaktowych
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const search = searchParams.get("search")
    const zrodlo = searchParams.get("zrodlo")
    const status = searchParams.get("status") // "answered" | "unanswered" | "all"
    const temat = searchParams.get("temat")

    const where: Prisma.ContactFormWhereInput = {}

    // Filtrowanie wg źródła (/kontakt vs /reklama vs /ekspert/[slug])
    if (zrodlo && zrodlo !== "all") {
      if (zrodlo === "REKLAMA") {
        where.OR = [
          { zrodlo: "REKLAMA" },
          { zrodlo: null, wiadomosc: { contains: "[Zapytanie z Landing Page Reklama]" } },
        ]
      } else if (zrodlo === "EKSPERT") {
        where.OR = [
          { zrodlo: "EKSPERT" },
          { lawFirmId: { not: null } },
        ]
      } else if (zrodlo === "OGOLNE") {
        // Wszystkie zapytania ogólne (/kontakt + /reklama), bez wiadomości do ekspertów.
        // Warunek na zrodlo jawnie dopuszcza NULL (starsze rekordy bez ustawionego źródła).
        where.AND = [
          { lawFirmId: null },
          { OR: [{ zrodlo: { not: "EKSPERT" } }, { zrodlo: null }] },
        ]
      } else if (zrodlo === "KONTAKT") {
        where.AND = [
          {
            OR: [
              { zrodlo: "KONTAKT" },
              { zrodlo: null },
            ],
          },
          {
            NOT: {
              wiadomosc: { contains: "[Zapytanie z Landing Page Reklama]" },
            },
          },
          { lawFirmId: null },
        ]
      }
    }

    // Filtrowanie wg statusu odpowiedzi
    if (status === "unanswered") {
      where.odpowiedziano = false
    } else if (status === "answered") {
      where.odpowiedziano = true
    }

    // Filtrowanie wg tematu
    if (temat && temat !== "all" && Object.values(ContactSubject).includes(temat as ContactSubject)) {
      where.temat = temat as ContactSubject
    }

    // Wyszukiwanie tekstowe
    if (search) {
      const searchCondition: Prisma.ContactFormWhereInput[] = [
        { imieNazwisko: { contains: search } },
        { email: { contains: search } },
        { telefon: { contains: search } },
        { wiadomosc: { contains: search } },
        { lawFirm: { nazwa: { contains: search } } },
      ]

      if (where.OR) {
        where.AND = [
          ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
          { OR: searchCondition },
        ]
      } else {
        where.OR = searchCondition
      }
    }

    // Statystyki ogólne (niezależne od paginacji)
    const [items, total, unansweredCount, kontaktCount, reklamaCount, ekspertCount] = await Promise.all([
      prisma.contactForm.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          lawFirm: {
            select: {
              id: true,
              nazwa: true,
              slug: true,
            },
          },
        },
      }),
      prisma.contactForm.count({ where }),
      prisma.contactForm.count({ where: { odpowiedziano: false } }),
      prisma.contactForm.count({
        where: {
          lawFirmId: null,
          OR: [
            { zrodlo: "KONTAKT" },
            {
              zrodlo: null,
              NOT: { wiadomosc: { contains: "[Zapytanie z Landing Page Reklama]" } },
            },
          ],
        },
      }),
      prisma.contactForm.count({
        where: {
          OR: [
            { zrodlo: "REKLAMA" },
            { zrodlo: null, wiadomosc: { contains: "[Zapytanie z Landing Page Reklama]" } },
          ],
        },
      }),
      prisma.contactForm.count({
        where: {
          OR: [
            { zrodlo: "EKSPERT" },
            { lawFirmId: { not: null } },
          ],
        },
      }),
    ])

    return NextResponse.json({
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalAll: await prisma.contactForm.count(),
        unanswered: unansweredCount,
        kontaktCount,
        reklamaCount,
        ekspertCount,
      },
    })
  } catch (error) {
    console.error("Error fetching contact messages:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
