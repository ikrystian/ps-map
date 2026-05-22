import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/users/[id]/notification-settings - Fetch notification settings for a specific user (ADMIN only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Fetch notification settings for the user
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: id },
    })

    // If settings don't exist, return default values
    if (!settings) {
      settings = {
        id: "",
        userId: id,
        emailNoweOferty: true,
        emailWiadomosci: true,
        emailStatusy: true,
        smsPilne: false,
        kontaktKlienci: true,
        kluczowe: true,
        wskazowkiPorady: false,
        ofertPromocje: false,
        przypomnienieWiadomosci: false,
        noweFunkcje: false,
        zmianyCenniki: false,
        zmianyRegulamin: false,
        kontaktDoradca: false,
        wyswietlanieAwatara: true,
        autoProsbOpinie: false,
        powiadomienieDzwiekowe: false,
        ustawieniaOgloszenia: false,
        powiadomieniaSmNowa: false,
        wiadomosciZbiorcze: false,
        urlop: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching notification settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch notification settings" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id]/notification-settings - Update notification settings for a specific user (ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Ensure mandatory fields are always true and marked as configured
    const updateData = {
      ...body,
      kontaktKlienci: true, // Always true - mandatory
      kluczowe: true, // Always true - mandatory
      isConfigured: true,
    }

    // Remove system fields
    delete updateData.id
    delete updateData.userId
    delete updateData.createdAt
    delete updateData.updatedAt

    // Update or create settings
    const settings = await prisma.notificationSettings.upsert({
      where: { userId: id },
      update: updateData,
      create: {
        userId: id,
        ...updateData,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating notification settings:", error)
    return NextResponse.json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    )
  }
}
