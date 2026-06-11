import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import fs from "fs"
import { NextRequest, NextResponse } from "next/server"
import path from "path"

function logErrorToFile(context: string, error: any) {
  try {
    const logDir = path.join(process.cwd(), "logs")
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
    const logPath = path.join(logDir, "api-cases-errors.log")
    const timestamp = new Date().toISOString()
    const errMsg = error instanceof Error ? error.message : String(error)
    const errStack = error instanceof Error ? error.stack : ""
    const logEntry = `[${timestamp}] Context: ${context}\nError: ${errMsg}\nStack: ${errStack}\n${"=".repeat(80)}\n`
    fs.appendFileSync(logPath, logEntry, "utf8")
  } catch (e) {
    console.error("Failed to write to log file", e)
  }
}


export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Pobierz sprawę z wszystkimi powiązanymi danymi
    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        category: true,
        voivodeship: true,
        city: true,
        client: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
        offers: {
          include: {
            lawFirm: {
              select: {
                id: true,
                nazwa: true,
                nazwaFirmy: true,
                logo: true,
                miasto: true,
                voivodeship: true,
                emailKontakt: true,
                numerTelefonu: true,
                numerTelefonu2: true,
                adres: true,
                kodPocztowy: true,
                stronaWww: true,
                imieKontakt: true,
                nazwiskoKontakt: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            receiver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Dodaj _count dla ofert
    const caseDataWithCount = {
      ...caseData,
      _count: {
        offers: caseData.offers.length,
      },
    }

    // Sprawdź uprawnienia
    if (session.user.role === "CLIENT") {
      // Klient może zobaczyć tylko swoje sprawy
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
      })

      if (!client || caseData.clientId !== client.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (session.user.role === "LAW_FIRM") {
      // Ekspert może zobaczyć sprawy z odpowiednim statusem
      // lub sprawy, do których złożyła ofertę
      const lawFirm = await prisma.lawFirm.findUnique({
        where: { userId: session.user.id },
      })

      if (!lawFirm) {
        return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
      }

      const hasOffer = caseData.offers.some((offer: any) => offer.lawFirmId === lawFirm.id)
      const isAvailable = ["NOWA", "OFERTY_OTRZYMANE"].includes(caseData.status)

      // Sprawdź czy istnieje zaakceptowana oferta od innej eksperta
      const acceptedOffer = caseData.offers.find((offer: any) => offer.status === "ZAAKCEPTOWANA")
      const hasAcceptedOfferFromOther = acceptedOffer && acceptedOffer.lawFirmId !== lawFirm.id

      // Jeśli istnieje zaakceptowana oferta od innej eksperta, odmów dostępu
      if (hasAcceptedOfferFromOther) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      // Dozwolony dostęp jeśli:
      // - ekspert złożyła ofertę do tej sprawy, lub
      // - sprawa ma status NOWA lub OFERTY_OTRZYMANE (i nie ma zaakceptowanej oferty od innej eksperta)
      if (!hasOffer && !isAvailable) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Parse załączniki jeśli są w JSON
    const parsedCase = {
      ...caseDataWithCount,
      zalaczniki: caseDataWithCount.zalaczniki && typeof caseDataWithCount.zalaczniki === 'string' && caseDataWithCount.zalaczniki.trim()
        ? JSON.parse(caseDataWithCount.zalaczniki)
        : [],
    }

    return NextResponse.json(parsedCase)
  } catch (error) {
    logErrorToFile("GET /api/cases/[id]", error)
    console.error("Error fetching case:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Sprawdź, czy sprawa istnieje
    const existingCase = await prisma.case.findUnique({
      where: { id },
    })

    if (!existingCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Sprawdź uprawnienia
    if (session.user.role === "CLIENT") {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
      })

      if (!client || existingCase.clientId !== client.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Aktualizuj sprawę
    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      include: {
        category: true,
        voivodeship: true,
      },
    })

    return NextResponse.json(updatedCase)
  } catch (error) {
    logErrorToFile("PUT /api/cases/[id]", error)
    console.error("Error updating case:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Sprawdź, czy sprawa istnieje
    const existingCase = await prisma.case.findUnique({
      where: { id },
    })

    if (!existingCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Sprawdź uprawnienia
    if (session.user.role === "CLIENT") {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
      })

      if (!client || existingCase.clientId !== client.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Usuń sprawę
    await prisma.case.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Case deleted successfully" })
  } catch (error) {
    logErrorToFile("DELETE /api/cases/[id]", error)
    console.error("Error deleting case:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
