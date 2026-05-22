import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET - Pobierz ustawienia
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Nieautoryzowany dostęp" },
        { status: 401 }
      )
    }

    // Pobierz wszystkie ustawienia
    const settings = await prisma.settings.findMany()

    // Konwertuj na obiekt klucz-wartość
    const settingsObject = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = {
        value: setting.value,
        description: setting.description,
      }
      return acc
    }, {} as Record<string, { value: string; description: string | null }>)

    // Dodaj domyślne wartości, jeśli nie istnieją
    if (!settingsObject.maxLawFirmCategories) {
      settingsObject.maxLawFirmCategories = {
        value: "10",
        description: "Maksymalna liczba kategorii, które może zaznaczyć kancelaria",
      }
    }
    if (!settingsObject.maxLawFirmTags) {
      settingsObject.maxLawFirmTags = {
        value: "5",
        description: "Maksymalna liczba słów kluczowych dla kancelarii bez aktywnego pakietu",
      }
    }

    return NextResponse.json(settingsObject, { status: 200 })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania ustawień" },
      { status: 500 }
    )
  }
}

// PUT - Zaktualizuj ustawienia
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Nieautoryzowany dostęp" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Nieprawidłowe dane" },
        { status: 400 }
      )
    }

    // Przygotuj obietnice dla każdego ustawienia
    const updatePromises = Object.entries(settings).map(([key, data]) => {
      const { value, description } = data as { value: string; description?: string }

      return prisma.settings.upsert({
        where: { key },
        update: {
          value,
          description: description || null,
        },
        create: {
          key,
          value,
          description: description || null,
        },
      })
    })

    // Zaktualizuj wszystkie ustawienia w transakcji dla lepszej wydajności
    await prisma.$transaction(updatePromises)

    return NextResponse.json(
      { message: "Ustawienia zostały zaktualizowane" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas aktualizacji ustawień" },
      { status: 500 }
    )
  }
}
