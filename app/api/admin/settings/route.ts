import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

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
    if (!settingsObject.showExpertTutorial) {
      settingsObject.showExpertTutorial = {
        value: "true",
        description: "Czy wyświetlać samouczek (krok po kroku) w panelu eksperta",
      }
    }
    if (!settingsObject.deleteReviewCostRating1) {
      settingsObject.deleteReviewCostRating1 = {
        value: "500",
        description: "Koszt usunięcia opinii z oceną 1★ w punktach",
      }
    }
    if (!settingsObject.deleteReviewCostRating2) {
      settingsObject.deleteReviewCostRating2 = {
        value: "300",
        description: "Koszt usunięcia opinii z oceną 2★ w punktach",
      }
    }
    if (!settingsObject.deleteReviewCostRating3) {
      settingsObject.deleteReviewCostRating3 = {
        value: "100",
        description: "Koszt usunięcia opinii z oceną 3★ w punktach",
      }
    }
    if (!settingsObject.autoApproveTestPayment) {
      settingsObject.autoApproveTestPayment = {
        value: "true",
        description: "Czy płatność testowa (TEST) ma być automatycznie akceptowana przez system (status ZAPLACONE)",
      }
    }
    if (!settingsObject.enablePaymentTest) {
      settingsObject.enablePaymentTest = {
        value: "true",
        description: "Czy płatność testowa (TEST) ma być dostępna jako metoda płatności",
      }
    }
    if (!settingsObject.enablePaymentPrzelewy24) {
      settingsObject.enablePaymentPrzelewy24 = {
        value: "true",
        description: "Czy płatność przez Przelewy24 ma być dostępna jako metoda płatności",
      }
    }
    if (!settingsObject.enablePaymentPayU) {
      settingsObject.enablePaymentPayU = {
        value: "true",
        description: "Czy płatność przez PayU ma być dostępna jako metoda płatności",
      }
    }
    if (!settingsObject.enablePaymentPrzelew) {
      settingsObject.enablePaymentPrzelew = {
        value: "true",
        description: "Czy płatność przelewem tradycyjnym ma być dostępna jako metoda płatności",
      }
    }
    if (!settingsObject.enablePaymentTpay) {
      settingsObject.enablePaymentTpay = {
        value: "true",
        description: "Czy płatność przez Tpay ma być dostępna jako metoda płatności",
      }
    }
    if (!settingsObject.enableUserSelectionOnLogin) {
      settingsObject.enableUserSelectionOnLogin = {
        value: "true",
        description: "Czy włączyć listę wyboru użytkowników na stronie logowania",
      }
    }
    if (!settingsObject.ksefEnabled) {
      settingsObject.ksefEnabled = {
        value: "false",
        description: "Czy włączyć automatyczne wystawianie faktur przez KSeF 2.0",
      }
    }
    if (!settingsObject.ksefNip) {
      settingsObject.ksefNip = {
        value: "1234567890",
        description: "NIP sprzedawcy (platformy) dla systemu KSeF",
      }
    }
    if (!settingsObject.ksefToken) {
      settingsObject.ksefToken = {
        value: "",
        description: "Token autoryzacyjny KSeF wygenerowany w Aplikacji Podatnika",
      }
    }
    if (!settingsObject.ksefEnv) {
      settingsObject.ksefEnv = {
        value: "test",
        description: "Środowisko KSeF: test (testowe/sandbox) lub prod (produkcyjne)",
      }
    }
    if (!settingsObject.showChatAssistant) {
      settingsObject.showChatAssistant = {
        value: "true",
        description: "Czy wyświetlać asystenta czatu (ChatAssistant) na stronie",
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
