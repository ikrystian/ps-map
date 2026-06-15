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
    if (!settingsObject.favicon) {
      settingsObject.favicon = {
        value: "/favicon.png",
        description: "Adres URL lub ścieżka do faviconu strony",
      }
    }
    if (!settingsObject.ogTitle) {
      settingsObject.ogTitle = {
        value: "Prosta Sprawa - Platforma łącząca klientów z ekspertami prawnymi",
        description: "Domyślny tytuł Open Graph dla strony głównej i stron publicznych",
      }
    }
    if (!settingsObject.ogDescription) {
      settingsObject.ogDescription = {
        value: "Znajdź prawnika lub eksperta prawnego w Twojej okolicy. Porównaj oferty i ceny usług prawnych.",
        description: "Domyślny opis Open Graph dla strony głównej i stron publicznych",
      }
    }
    if (!settingsObject.ogImage) {
      settingsObject.ogImage = {
        value: "/images/og-image.png",
        description: "Adres URL lub ścieżka do domyślnego obrazka Open Graph (zalecane 1200x630)",
      }
    }
    if (!settingsObject.homepageConsultedCategories) {
      settingsObject.homepageConsultedCategories = {
        value: "[]",
        description: "Lista ID kategorii (Category) wyświetlanych w sekcji Najczęściej Konsultowane na stronie głównej",
      }
    }
    if (!settingsObject.maxLawFirmCategories) {
      settingsObject.maxLawFirmCategories = {
        value: "10",
        description: "Maksymalna liczba kategorii, które może zaznaczyć ekspert",
      }
    }
    if (!settingsObject.maxLawFirmTags) {
      settingsObject.maxLawFirmTags = {
        value: "5",
        description: "Maksymalna liczba słów kluczowych dla ekspertów bez aktywnego pakietu",
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
    if (!settingsObject.autoGrantBusinessPackage) {
      settingsObject.autoGrantBusinessPackage = {
        value: "false",
        description: "Czy automatycznie przyznawać nowo zarejestrowanym ekspertom darmowy 3-miesięczny pakiet Biznes",
      }
    }
    if (!settingsObject.geographicHierarchy) {
      settingsObject.geographicHierarchy = {
        value: "voivodeships",
        description: "Hierarchia geograficzna używana w formularzach i filtrach: voivodeships (województwa), counties (powiaty), cities (miasta)",
      }
    }
    if (!settingsObject.promoteConsultedImmediately) {
      settingsObject.promoteConsultedImmediately = {
        value: "false",
        description: "Tryb testowy: promocje 'Najczęściej konsultowane kategorie' są aktywowane natychmiast (od teraz) zamiast od pierwszego dnia kolejnego miesiąca",
      }
    }

    // SMTP settings
    if (!settingsObject.emailServerHost) {
      settingsObject.emailServerHost = {
        value: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
        description: "Adres hosta serwera SMTP",
      }
    }
    if (!settingsObject.emailServerPort) {
      settingsObject.emailServerPort = {
        value: process.env.EMAIL_SERVER_PORT || "587",
        description: "Port serwera SMTP",
      }
    }
    if (!settingsObject.emailServerUser) {
      settingsObject.emailServerUser = {
        value: process.env.EMAIL_SERVER_USER || "",
        description: "Nazwa użytkownika konta SMTP",
      }
    }
    if (!settingsObject.emailServerPassword) {
      settingsObject.emailServerPassword = {
        value: process.env.EMAIL_SERVER_PASSWORD || "",
        description: "Hasło konta SMTP",
      }
    }
    if (!settingsObject.emailFrom) {
      settingsObject.emailFrom = {
        value: process.env.EMAIL_FROM || "noreply@prostasprawa.pl",
        description: "Adres email nadawcy",
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
