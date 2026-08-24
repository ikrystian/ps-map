import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

const fullInclude = {
  category: { select: { id: true, nazwa: true, slug: true } },
  client: {
    select: {
      id: true,
      imie: true,
      nazwisko: true,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  },
  booking: true,
  interests: {
    include: {
      lawFirm: {
        select: {
          id: true,
          nazwa: true,
          slug: true,
          logo: true,
          opis: true,
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
 * GET /api/consultation-requests/[id]
 * CLIENT   – wyłącznie własne zapytanie (z pełną listą zgłoszeń)
 * LAW_FIRM – gdy ma własne zgłoszenie albo zapytanie jest wciąż otwarte;
 *            widzi wtedy tylko swoje zgłoszenie, nie konkurencję
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 })
    }

    const consultationRequest = await prisma.consultationRequest.findUnique({
      where: { id },
      include: fullInclude,
    })

    if (!consultationRequest) {
      return NextResponse.json({ error: "Nie znaleziono zapytania" }, { status: 404 })
    }

    if (session.user.role === "CLIENT") {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })

      if (!client || consultationRequest.clientId !== client.id) {
        return NextResponse.json({ error: "Brak dostępu do tego zapytania" }, { status: 403 })
      }

      return NextResponse.json(consultationRequest)
    }

    if (session.user.role === "LAW_FIRM") {
      const lawFirm = await prisma.lawFirm.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })

      if (!lawFirm) {
        return NextResponse.json({ error: "Nie znaleziono profilu eksperta" }, { status: 404 })
      }

      const ownInterest = consultationRequest.interests.find((i) => i.lawFirmId === lawFirm.id)
      const acceptedByOther = consultationRequest.interests.some(
        (i) => i.status === "ZAAKCEPTOWANE" && i.lawFirmId !== lawFirm.id
      )
      const isOpen = ["NOWE", "ZGLOSZENIA_OTRZYMANE"].includes(consultationRequest.status)

      if (acceptedByOther || (!ownInterest && !isOpen)) {
        return NextResponse.json({ error: "Brak dostępu do tego zapytania" }, { status: 403 })
      }

      // Ekspert nie zna danych kontaktowych klienta dopóki jego zgłoszenie nie zostanie przyjęte
      const accepted = ownInterest?.status === "ZAAKCEPTOWANE"

      return NextResponse.json({
        ...consultationRequest,
        telefonKontakt: accepted ? consultationRequest.telefonKontakt : null,
        interests: ownInterest ? [ownInterest] : [],
        liczbaZgloszen: consultationRequest.interests.length,
      })
    }

    if (session.user.role === "ADMIN") {
      return NextResponse.json(consultationRequest)
    }

    return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 })
  } catch (error) {
    console.error("Error fetching consultation request:", error)
    return NextResponse.json({ error: "Błąd podczas pobierania zapytania" }, { status: 500 })
  }
}

/**
 * PATCH /api/consultation-requests/[id]
 * Klient może anulować lub zarchiwizować własne zapytanie. Whitelist pól – żadnego spreadu body.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 })
    }

    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    const existing = await prisma.consultationRequest.findUnique({
      where: { id },
      select: { id: true, clientId: true, status: true },
    })

    if (!existing) {
      return NextResponse.json({ error: "Nie znaleziono zapytania" }, { status: 404 })
    }

    if (!client || existing.clientId !== client.id) {
      return NextResponse.json({ error: "Brak dostępu do tego zapytania" }, { status: 403 })
    }

    const body = await request.json()
    const data: { status?: "ANULOWANA"; isArchived?: boolean; zamknieto?: Date } = {}

    if (body.status === "ANULOWANA") {
      if (existing.status === "UMOWIONA") {
        return NextResponse.json(
          { error: "Konsultacja jest już umówiona – anuluj ją z poziomu listy konsultacji" },
          { status: 400 }
        )
      }
      data.status = "ANULOWANA"
      data.zamknieto = new Date()
    }

    if (typeof body.isArchived === "boolean") {
      data.isArchived = body.isArchived
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Brak pól do aktualizacji" }, { status: 400 })
    }

    const updated = await prisma.consultationRequest.update({ where: { id }, data })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating consultation request:", error)
    return NextResponse.json({ error: "Błąd podczas aktualizacji zapytania" }, { status: 500 })
  }
}

/**
 * DELETE /api/consultation-requests/[id]
 * Usunięcie możliwe tylko dopóki żadne zgłoszenie nie zostało zaakceptowane.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 })
    }

    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    const existing = await prisma.consultationRequest.findUnique({
      where: { id },
      select: {
        id: true,
        clientId: true,
        bookingId: true,
        interests: { where: { status: "ZAAKCEPTOWANE" }, select: { id: true } },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Nie znaleziono zapytania" }, { status: 404 })
    }

    if (!client || existing.clientId !== client.id) {
      return NextResponse.json({ error: "Brak dostępu do tego zapytania" }, { status: 403 })
    }

    if (existing.bookingId || existing.interests.length > 0) {
      return NextResponse.json(
        { error: "Nie można usunąć zapytania z umówioną konsultacją" },
        { status: 400 }
      )
    }

    await prisma.consultationRequest.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting consultation request:", error)
    return NextResponse.json({ error: "Błąd podczas usuwania zapytania" }, { status: 500 })
  }
}
