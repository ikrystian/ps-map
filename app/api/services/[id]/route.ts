import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        lawFirm: {
          select: {
            id: true,
            nazwa: true,
          },
        },
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pobierz eksperta
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    // Sprawdź czy usługa należy do ekspercie
    const existingService = await prisma.service.findUnique({
      where: { id },
    })

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    if (existingService.lawFirmId !== lawFirm.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    // Aktualizuj usługę
    const service = await prisma.service.update({
      where: { id },
      data: {
        nazwaUslugi: body.nazwaUslugi,
        opisUslugi: body.opisUslugi,
        cenaOd: body.cenaOd || null,
        cenaDo: body.cenaDo || null,
        jednostka: body.jednostka,
        aktywna: body.aktywna !== undefined ? body.aktywna : true,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pobierz eksperta
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    // Sprawdź czy usługa należy do ekspercie
    const existingService = await prisma.service.findUnique({
      where: { id },
    })

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    if (existingService.lawFirmId !== lawFirm.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Usuń usługę
    await prisma.service.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
