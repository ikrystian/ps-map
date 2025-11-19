import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    if (session.user.role !== "CLIENT") {
      return Response.json(
        { error: "Tylko klienci mogą dodawać kancelarie do ulubionych" },
        { status: 403 }
      )
    }

    const { id: lawFirmId } = await params

    // Sprawdź czy kancelaria istnieje
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { id: lawFirmId },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Kancelaria nie istnieje" },
        { status: 404 }
      )
    }

    // Pobierz dane klienta
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
    })

    if (!client) {
      return Response.json(
        { error: "Nie znaleziono profilu klienta" },
        { status: 404 }
      )
    }

    // Sprawdź czy już nie jest w ulubionych
    const existing = await prisma.favoriteLawFirm.findUnique({
      where: {
        clientId_lawFirmId: {
          clientId: client.id,
          lawFirmId: lawFirmId,
        },
      },
    })

    if (existing) {
      return Response.json(
        { error: "Kancelaria jest już w ulubionych" },
        { status: 400 }
      )
    }

    // Dodaj do ulubionych
    await prisma.favoriteLawFirm.create({
      data: {
        clientId: client.id,
        lawFirmId: lawFirmId,
      },
    })

    return Response.json({ success: true, message: "Dodano do ulubionych" })
  } catch (error) {
    console.error("Error adding to favorites:", error)
    return Response.json(
      { error: "Wystąpił błąd podczas dodawania do ulubionych" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    if (session.user.role !== "CLIENT") {
      return Response.json(
        { error: "Tylko klienci mogą usuwać kancelarie z ulubionych" },
        { status: 403 }
      )
    }

    const { id: lawFirmId } = await params

    // Pobierz dane klienta
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
    })

    if (!client) {
      return Response.json(
        { error: "Nie znaleziono profilu klienta" },
        { status: 404 }
      )
    }

    // Usuń z ulubionych
    await prisma.favoriteLawFirm.delete({
      where: {
        clientId_lawFirmId: {
          clientId: client.id,
          lawFirmId: lawFirmId,
        },
      },
    })

    return Response.json({ success: true, message: "Usunięto z ulubionych" })
  } catch (error) {
    console.error("Error removing from favorites:", error)
    return Response.json(
      { error: "Wystąpił błąd podczas usuwania z ulubionych" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json({ isFavorite: false })
    }

    if (session.user.role !== "CLIENT") {
      return Response.json({ isFavorite: false })
    }

    const { id: lawFirmId } = await params

    // Pobierz dane klienta
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
    })

    if (!client) {
      return Response.json({ isFavorite: false })
    }

    // Sprawdź czy jest w ulubionych
    const favorite = await prisma.favoriteLawFirm.findUnique({
      where: {
        clientId_lawFirmId: {
          clientId: client.id,
          lawFirmId: lawFirmId,
        },
      },
    })

    return Response.json({ isFavorite: !!favorite })
  } catch (error) {
    console.error("Error checking favorite status:", error)
    return Response.json({ isFavorite: false })
  }
}
