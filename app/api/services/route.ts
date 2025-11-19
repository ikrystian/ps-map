import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const searchParams = request.nextUrl.searchParams
    const lawFirmId = searchParams.get("lawFirmId")

    if (lawFirmId) {
      // Pobierz usługi określonej kancelarii (publiczne)
      const services = await prisma.service.findMany({
        where: {
          lawFirmId,
          aktywna: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return NextResponse.json(services)
    }

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Pobierz kancelarię
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    // Pobierz wszystkie usługi kancelarii
    const services = await prisma.service.findMany({
      where: {
        lawFirmId: lawFirm.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pobierz kancelarię
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    const body = await request.json()

    // Walidacja
    if (!body.nazwaUslugi || !body.opisUslugi || !body.jednostka) {
      return NextResponse.json(
        { error: "Missing required fields: nazwaUslugi, opisUslugi, jednostka" },
        { status: 400 }
      )
    }

    // Utwórz usługę
    const service = await prisma.service.create({
      data: {
        lawFirmId: lawFirm.id,
        nazwaUslugi: body.nazwaUslugi,
        opisUslugi: body.opisUslugi,
        cenaOd: body.cenaOd || null,
        cenaDo: body.cenaDo || null,
        jednostka: body.jednostka,
        aktywna: body.aktywna !== undefined ? body.aktywna : true,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
