import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/notification-settings - Pobierz ustawienia powiadomień
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Pobierz lub utwórz ustawienia
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: session.user.id },
    })

    // Jeśli nie istnieją, utwórz domyślne
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          userId: session.user.id,
        },
      })
    }

    return Response.json(settings)
  } catch (error) {
    console.error("Error fetching notification settings:", error)
    return Response.json(
      { error: "Failed to fetch notification settings" },
      { status: 500 }
    )
  }
}

// PUT /api/notification-settings - Aktualizuj ustawienia powiadomień
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Upewnij się, że obowiązkowe pola są zawsze true
    const updateData = {
      ...body,
      kontaktKlienci: true, // Zawsze true - obowiązkowe
      kluczowe: true, // Zawsze true - obowiązkowe
    }

    // Usuń pola systemowe
    delete updateData.id
    delete updateData.userId
    delete updateData.createdAt
    delete updateData.updatedAt

    // Aktualizuj lub utwórz ustawienia
    const settings = await prisma.notificationSettings.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: {
        userId: session.user.id,
        ...updateData,
      },
    })

    return Response.json(settings)
  } catch (error) {
    console.error("Error updating notification settings:", error)
    return Response.json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    )
  }
}
