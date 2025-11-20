import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Pobierz publiczne ustawienia
export async function GET(request: NextRequest) {
  try {
    // Pobierz ustawienia
    const settings = await prisma.settings.findMany()

    // Konwertuj na obiekt klucz-wartość
    const settingsObject = settings.reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    // Dodaj domyślne wartości, jeśli nie istnieją
    if (!settingsObject.maxLawFirmCategories) {
      settingsObject.maxLawFirmCategories = "10"
    }

    return NextResponse.json(settingsObject, { status: 200 })
  } catch (error) {
    console.error("Error fetching settings:", error)
    // Zwróć domyślne wartości w przypadku błędu
    return NextResponse.json(
      {
        maxLawFirmCategories: "10",
      },
      { status: 200 }
    )
  }
}
