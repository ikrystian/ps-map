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
