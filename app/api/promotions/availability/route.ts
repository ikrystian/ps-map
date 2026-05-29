import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PromotionType } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const startPromocji = searchParams.get("startPromocji")
    const kategoriaPromocji = searchParams.get("kategoriaPromocji")

    if (!type || !startPromocji || !kategoriaPromocji) {
      return NextResponse.json(
        { error: "Brak wymaganych parametrów (type, startPromocji, kategoriaPromocji)" },
        { status: 400 }
      )
    }

    if (type !== "POLECANI_PRAWNICY" && type !== "NAJCZESCIEJ_KONSULTOWANE") {
      return NextResponse.json(
        { error: "Nieprawidłowy typ promocji dla tego zapytania" },
        { status: 400 }
      )
    }

    const start = new Date(startPromocji)
    const targetYear = start.getFullYear()
    const targetMonth = start.getMonth()

    const monthStart = new Date(targetYear, targetMonth, 1, 0, 0, 0, 0)
    const monthEnd = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999)

    const maxSlots = type === "POLECANI_PRAWNICY" ? 4 : 5

    // Oblicz zajęte miejsca
    const occupiedSlots = await prisma.promotion.count({
      where: {
        typPromocji: type as PromotionType,
        kategoriaPromocji,
        startPromocji: {
          gte: monthStart,
          lte: monthEnd,
        },
        aktywna: true,
      },
    })

    const availableSlots = Math.max(0, maxSlots - occupiedSlots)

    return NextResponse.json({
      totalSlots: maxSlots,
      occupiedSlots,
      availableSlots,
    })
  } catch (error) {
    console.error("Error checking promotion availability:", error)
    return NextResponse.json(
      { error: "Błąd podczas sprawdzania dostępności miejsc" },
      { status: 500 }
    )
  }
}
