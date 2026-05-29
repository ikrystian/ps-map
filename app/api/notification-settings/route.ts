import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

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

    // Pobierz użytkownika wraz z ustawieniami powiadomień
    const userWithSettings = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { notificationSettings: true },
    })

    if (!userWithSettings) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    let settings = userWithSettings.notificationSettings

    // Jeśli nie istnieją, utwórz domyślne
    if (!settings) {
      try {
        settings = await prisma.notificationSettings.create({
          data: {
            userId: session.user.id,
          },
        })
      } catch (createError: any) {
        // Obsługa sytuacji, gdy ustawienia zostały utworzone równolegle (P2002)
        if (createError.code === "P2002") {
          settings = await prisma.notificationSettings.findUnique({
            where: { userId: session.user.id },
          })
        } else {
          throw createError
        }
      }
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

    // Upewnij się, że obowiązkowe pola są zawsze true i oznaczone jako skonfigurowane
    const updateData = {
      ...body,
      kontaktKlienci: true, // Zawsze true - obowiązkowe
      kluczowe: true, // Zawsze true - obowiązkowe
      isConfigured: true,
    }

    // Usuń pola systemowe
    delete updateData.id
    delete updateData.userId
    delete updateData.createdAt
    delete updateData.updatedAt

    // Sprawdź czy użytkownik istnieje
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

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
