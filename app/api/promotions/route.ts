import { auth } from "@/lib/auth"
import { serverCache } from "@/lib/cache"
import { generatePromotionActivatedEmail } from "@/lib/email"
import { sendSystemNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import {
  getRecommendedCategoryScope,
  isEligibleForRecommendedPromotion,
} from "@/lib/recommended-promotion"
import { PromotionType } from "@prisma/client"
import { NextRequest } from "next/server"

// Koszty punktów za typy promocji
const PROMOTION_COSTS = {
  PODBICIE_OGLOSZENIA: 20, // pkt/dzień
  WYROZNIENIE: 50,         // pkt/tydzień
  TOP_LISTA: 100,          // pkt/tydzień
  STRONA_GLOWNA: 200,      // pkt/tydzień
}

// Sprawdza, czy boolowskie ustawienie globalne jest włączone ("true")
async function isSettingEnabled(key: string): Promise<boolean> {
  const setting = await prisma.settings.findUnique({ where: { key } })
  return setting?.value === "true"
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    // Sprawdź czy użytkownik jest ekspertem
    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Dostęp tylko dla ekspertów" },
        { status: 403 }
      )
    }

    // Pobierz ekspertów
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu eksperta" },
        { status: 404 }
      )
    }

    // Pobierz promocje eksperta
    const promotions = await prisma.promotion.findMany({
      where: {
        lawFirmId: lawFirm.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return Response.json(promotions)
  } catch (error) {
    console.error("Error fetching promotions:", error)
    return Response.json(
      { error: "Błąd podczas pobierania promocji" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    // Sprawdź czy użytkownik jest ekspertem
    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Dostęp tylko dla ekspertów" },
        { status: 403 }
      )
    }

    // Pobierz ekspertów
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu eksperta" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      typPromocji,
      czasTrwaniaDni,
      kategoriaPromocji,
      wojewodztwoPromocji,
      startPromocji,
      automatyczneOdnowienie,
    } = body

    const isMonthly = typPromocji === "POLECANI_PRAWNICY" || typPromocji === "NAJCZESCIEJ_KONSULTOWANE"

    // Walidacja
    if (!typPromocji || !startPromocji || (!isMonthly && !czasTrwaniaDni)) {
      return Response.json(
        { error: "Brak wymaganych pól" },
        { status: 400 }
      )
    }

    // Sprawdź czy typ promocji jest prawidłowy i pobierz konfigurację
    const config = await prisma.promotionConfig.findUnique({
      where: { type: typPromocji as PromotionType },
    })

    if (!config || !config.aktywna) {
      return Response.json(
        { error: "Nieprawidłowy lub nieaktywny typ promocji" },
        { status: 400 }
      )
    }

    // Oblicz koszt i daty
    let kosztPunktow = 0
    let start = new Date(startPromocji)
    let end = new Date(start)
    let finalCzasTrwaniaDni = czasTrwaniaDni

    if (isMonthly) {
      kosztPunktow = config.pointsPerMonth || 0

      const targetYear = start.getFullYear()
      const targetMonth = start.getMonth()

      // Granice wybranego miesiąca kalendarzowego (do limitów i sprawdzania wolnych miejsc)
      const monthStart = new Date(targetYear, targetMonth, 1, 0, 0, 0, 0)
      const monthEnd = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999)

      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()
      const isCurrentMonth = targetYear === currentYear && targetMonth === currentMonth

      // Tryb testowy: pozwól włączyć promocję miesięczną ("Najczęściej konsultowane",
      // "Polecani prawnicy i adwokaci") od razu (bieżący miesiąc)
      const immediateMonthly =
        isCurrentMonth &&
        (await isSettingEnabled("promoteConsultedImmediately"))

      if (immediateMonthly) {
        // Promocja aktywna natychmiast, do końca bieżącego miesiąca
        start = now
        end = monthEnd
        finalCzasTrwaniaDni = monthEnd.getDate()
      } else {
        // Zawsze zaczynamy od pierwszego dnia wybranego miesiąca
        start = monthStart
        end = monthEnd
        finalCzasTrwaniaDni = new Date(targetYear, targetMonth + 1, 0).getDate()

        // Walidacja obecnego miesiąca: nie wolno kupić na obecny lub przeszły miesiąc
        if (targetYear < currentYear || (targetYear === currentYear && targetMonth <= currentMonth)) {
          return Response.json(
            { error: "Nie można zakupić promocji na obecny lub przeszły miesiąc" },
            { status: 400 }
          )
        }
      }

      // Sprawdź limit 4 promowań w roku na eksperta (tylko z tych dwóch typów)
      const yearStart = new Date(targetYear, 0, 1, 0, 0, 0, 0)
      const yearEnd = new Date(targetYear, 11, 31, 23, 59, 59, 999)
      const annualPromotionsCount = await prisma.promotion.count({
        where: {
          lawFirmId: lawFirm.id,
          typPromocji: {
            in: ["POLECANI_PRAWNICY", "NAJCZESCIEJ_KONSULTOWANE"],
          },
          startPromocji: {
            gte: yearStart,
            lte: yearEnd,
          },
          aktywna: true,
        },
      })

      if (annualPromotionsCount >= 4) {
        return Response.json(
          { error: "Ekspert może zakupić maksymalnie 4 promowania w roku kalendarzowym" },
          { status: 400 }
        )
      }

      // Sprawdź limit 1 promowania danego typu w miesiącu na eksperta
      // (ekspert może mieć w miesiącu jedno "Polecani prawnicy" i jedno "Najczęściej konsultowane")
      const monthlyPromotionsCount = await prisma.promotion.count({
        where: {
          lawFirmId: lawFirm.id,
          typPromocji: typPromocji as PromotionType,
          startPromocji: {
            gte: monthStart,
            lte: monthEnd,
          },
          aktywna: true,
        },
      })

      if (monthlyPromotionsCount >= 1) {
        return Response.json(
          { error: "Ekspert może zakupić maksymalnie 1 promowanie danego typu w miesiącu kalendarzowym" },
          { status: 400 }
        )
      }

      // Sprawdź limit miejsc dla wybranej kategorii
      if (typPromocji === "POLECANI_PRAWNICY") {
        // Format dostępny tylko dla ekspertów z poddrzewa kategorii wskazanej
        // przez administratora (Ustawienia → homepageRecommendedCategory)
        const scope = await getRecommendedCategoryScope()

        if (!scope.parentId) {
          return Response.json(
            { error: "Format promowania jest niedostępny — administrator nie skonfigurował kategorii" },
            { status: 400 }
          )
        }

        if (!isEligibleForRecommendedPromotion(scope, lawFirm.expertiseCategoryId)) {
          return Response.json(
            { error: "Ten format promowania jest dostępny tylko dla ekspertów z wybranych kategorii" },
            { status: 403 }
          )
        }

        if (!kategoriaPromocji) {
          return Response.json(
            { error: "Kategoria jest wymagana dla tej promocji" },
            { status: 400 }
          )
        }

        if (!scope.categories.some((c) => c.nazwa === kategoriaPromocji)) {
          return Response.json(
            { error: "Nieprawidłowa kategoria dla tego formatu promowania" },
            { status: 400 }
          )
        }
        const activeSlotsCount = await prisma.promotion.count({
          where: {
            typPromocji: "POLECANI_PRAWNICY",
            kategoriaPromocji,
            startPromocji: {
              gte: monthStart,
              lte: monthEnd,
            },
            aktywna: true,
          },
        })
        if (activeSlotsCount >= 4) {
          return Response.json(
            { error: `Brak wolnych miejsc w miesiącu dla kategorii ${kategoriaPromocji} (maksymalnie 4)` },
            { status: 400 }
          )
        }
      } else if (typPromocji === "NAJCZESCIEJ_KONSULTOWANE") {
        if (!kategoriaPromocji) {
          return Response.json(
            { error: "Kategoria jest wymagana dla tej promocji" },
            { status: 400 }
          )
        }
        const activeSlotsCount = await prisma.promotion.count({
          where: {
            typPromocji: "NAJCZESCIEJ_KONSULTOWANE",
            kategoriaPromocji,
            startPromocji: {
              gte: monthStart,
              lte: monthEnd,
            },
            aktywna: true,
          },
        })
        if (activeSlotsCount >= 5) {
          return Response.json(
            { error: `Brak wolnych miejsc w miesiącu dla kategorii ${kategoriaPromocji} (maksymalnie 5)` },
            { status: 400 }
          )
        }
      }
    } else {
      if (typPromocji === "PODBICIE_OGLOSZENIA") {
        kosztPunktow = (config.pointsPerDay || 20) * czasTrwaniaDni
      } else {
        const weeks = Math.ceil(czasTrwaniaDni / 7)
        kosztPunktow = (config.pointsPerWeek || 50) * weeks
      }
      end.setDate(end.getDate() + czasTrwaniaDni)
    }

    // Sprawdź czy ekspert ma wystarczająco punktów
    if (lawFirm.punktySaldo < kosztPunktow) {
      return Response.json(
        { error: "Niewystarczająca liczba punktów" },
        { status: 400 }
      )
    }

    // Utwórz promocję i odejmij punkty w transakcji
    const [promotion, updatedLawFirm] = await prisma.$transaction([
      prisma.promotion.create({
        data: {
          lawFirmId: lawFirm.id,
          typPromocji: typPromocji as PromotionType,
          czasTrwaniaDni: finalCzasTrwaniaDni,
          kategoriaPromocji,
          wojewodztwoPromocji,
          startPromocji: start,
          koniecPromocji: end,
          kosztPunktow,
          automatyczneOdnowienie: automatyczneOdnowienie || false,
          aktywna: true,
        },
      }),
      prisma.lawFirm.update({
        where: { id: lawFirm.id },
        data: {
          punktySaldo: {
            decrement: kosztPunktow,
          },
        },
      }),
    ])

    // Odśwież cache promocji strony głównej, aby nowa promocja była od razu widoczna
    serverCache.delete("homepage:promotions")

    // Get promotion label for notification
    const promotionLabels = {
      PODBICIE_OGLOSZENIA: 'Podbicie ogłoszenia',
      WYROZNIENIE: 'Wyróżnienie profilu',
      TOP_LISTA: 'Top Lista',
      STRONA_GLOWNA: 'Strona Główna Premium',
      POLECANI_PRAWNICY: 'Polecani prawnicy i adwokaci',
      NAJCZESCIEJ_KONSULTOWANE: 'Najczęściej konsultowane kategorie',
    }

    const promotionLabel = promotionLabels[typPromocji as keyof typeof promotionLabels]

    // Get user email for sending notification
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    })

    let emailData;
    if (user?.email) {
      emailData = generatePromotionActivatedEmail(
        lawFirm.nazwa,
        typPromocji,
        promotionLabel,
        start,
        end,
        kosztPunktow
      )
    }

    // Create in-app notification and send email based on settings
    await sendSystemNotification({
      userId: session.user.id,
      typ: 'ZMIANA_STATUSU',
      tytul: 'Promocja została aktywowana',
      tresc: `Twoja promocja "${promotionLabel}" została pomyślnie aktywowana i jest już widoczna dla klientów.`,
      linkUrl: '/panel-eksperta/promowanie',
      emailSubject: emailData?.subject,
      emailHtml: emailData?.html,
      emailText: emailData?.text,
    })

    return Response.json(promotion, { status: 201 })
  } catch (error) {
    console.error("Error creating promotion:", error)
    return Response.json(
      { error: "Błąd podczas tworzenia promocji" },
      { status: 500 }
    )
  }
}
