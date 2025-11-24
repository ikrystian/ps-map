/**
 * System Promocji - Helper Functions
 *
 * Funkcje pomocnicze do zarządzania i sprawdzania aktywnych promocji kancelarii
 */

import { prisma } from "@/lib/prisma"
import {
  sendEmail,
  generatePromotionRenewedEmail,
  generatePromotionRenewalFailedEmail,
} from "@/lib/email"

// ============================================================================
// TYPY
// ============================================================================

export interface ActivePromotion {
  id: string
  typPromocji: "PODBICIE_OGLOSZENIA" | "WYROZNIENIE" | "TOP_LISTA" | "STRONA_GLOWNA"
  kategoriaPromocji: string | null
  wojewodztwoPromocji: string | null
  startPromocji: Date
  koniecPromocji: Date
}

export interface PromotionBoost {
  hasBoost: boolean
  boostMultiplier: number
  promotionTypes: ("PODBICIE_OGLOSZENIA" | "WYROZNIENIE" | "TOP_LISTA" | "STRONA_GLOWNA")[]
}

// ============================================================================
// GŁÓWNE FUNKCJE
// ============================================================================

/**
 * Pobiera wszystkie aktywne promocje dla kancelarii
 */
export async function getActiveLawFirmPromotions(
  lawFirmId: string
): Promise<ActivePromotion[]> {
  const now = new Date()

  const promotions = await prisma.promotion.findMany({
    where: {
      lawFirmId,
      aktywna: true,
      startPromocji: {
        lte: now,
      },
      koniecPromocji: {
        gte: now,
      },
    },
    select: {
      id: true,
      typPromocji: true,
      kategoriaPromocji: true,
      wojewodztwoPromocji: true,
      startPromocji: true,
      koniecPromocji: true,
    },
  })

  return promotions
}

/**
 * Sprawdza czy kancelaria ma aktywną promocję danego typu
 */
export async function hasActivePromotion(
  lawFirmId: string,
  promotionType: "PODBICIE_OGLOSZENIA" | "WYROZNIENIE" | "TOP_LISTA" | "STRONA_GLOWNA"
): Promise<boolean> {
  const promotions = await getActiveLawFirmPromotions(lawFirmId)
  return promotions.some((p) => p.typPromocji === promotionType)
}

/**
 * Sprawdza czy kancelaria ma aktywną promocję dla danej kategorii
 */
export async function hasActiveCategoryPromotion(
  lawFirmId: string,
  categoryId: string | null
): Promise<boolean> {
  const now = new Date()

  const promotion = await prisma.promotion.findFirst({
    where: {
      lawFirmId,
      aktywna: true,
      startPromocji: {
        lte: now,
      },
      koniecPromocji: {
        gte: now,
      },
      OR: [
        { kategoriaPromocji: categoryId },
        { kategoriaPromocji: null }, // Promocja dla wszystkich kategorii
      ],
    },
  })

  return !!promotion
}

/**
 * Sprawdza czy kancelaria ma aktywną promocję dla danego województwa
 */
export async function hasActiveVoivodeshipPromotion(
  lawFirmId: string,
  voivodeshipId: string | null
): Promise<boolean> {
  const now = new Date()

  const promotion = await prisma.promotion.findFirst({
    where: {
      lawFirmId,
      aktywna: true,
      startPromocji: {
        lte: now,
      },
      koniecPromocji: {
        gte: now,
      },
      OR: [
        { wojewodztwoPromocji: voivodeshipId },
        { wojewodztwoPromocji: null }, // Promocja dla wszystkich województw
      ],
    },
  })

  return !!promotion
}

/**
 * Oblicza boost rankingu dla kancelarii na podstawie aktywnych promocji
 *
 * Zwraca mnożnik, który należy zastosować do pozycji w rankingu:
 * - PODBICIE_OGLOSZENIA: 1.5x
 * - WYROZNIENIE: 2x
 * - TOP_LISTA: 3x
 * - STRONA_GLOWNA: 5x
 *
 * Jeśli kancelaria ma wiele promocji, stosowany jest najwyższy mnożnik
 */
export async function calculatePromotionBoost(
  lawFirmId: string,
  categoryId?: string | null,
  voivodeshipId?: string | null
): Promise<PromotionBoost> {
  const promotions = await getActiveLawFirmPromotions(lawFirmId)

  // Filtruj promocje według kategorii i województwa jeśli podane
  const relevantPromotions = promotions.filter((promo) => {
    // Sprawdź kategorię
    if (categoryId && promo.kategoriaPromocji) {
      if (promo.kategoriaPromocji !== categoryId) {
        return false
      }
    }

    // Sprawdź województwo
    if (voivodeshipId && promo.wojewodztwoPromocji) {
      if (promo.wojewodztwoPromocji !== voivodeshipId) {
        return false
      }
    }

    return true
  })

  if (relevantPromotions.length === 0) {
    return {
      hasBoost: false,
      boostMultiplier: 1,
      promotionTypes: [],
    }
  }

  // Mapowanie typów promocji na mnożniki
  const boostMultipliers: Record<string, number> = {
    PODBICIE_OGLOSZENIA: 1.5,
    WYROZNIENIE: 2,
    TOP_LISTA: 3,
    STRONA_GLOWNA: 5,
  }

  // Znajdź najwyższy mnożnik
  let maxMultiplier = 1
  const promotionTypes: ("PODBICIE_OGLOSZENIA" | "WYROZNIENIE" | "TOP_LISTA" | "STRONA_GLOWNA")[] = []

  for (const promo of relevantPromotions) {
    const multiplier = boostMultipliers[promo.typPromocji]
    if (multiplier > maxMultiplier) {
      maxMultiplier = multiplier
    }
    promotionTypes.push(promo.typPromocji as "PODBICIE_OGLOSZENIA" | "WYROZNIENIE" | "TOP_LISTA" | "STRONA_GLOWNA")
  }

  return {
    hasBoost: true,
    boostMultiplier: maxMultiplier,
    promotionTypes,
  }
}

/**
 * Pobiera kancelarie z aktywną promocją STRONA_GLOWNA
 * (do wyświetlenia na stronie głównej)
 */
export async function getFeaturedLawFirms(limit: number = 5) {
  const now = new Date()

  const promotions = await prisma.promotion.findMany({
    where: {
      typPromocji: "STRONA_GLOWNA",
      aktywna: true,
      startPromocji: {
        lte: now,
      },
      koniecPromocji: {
        gte: now,
      },
    },
    include: {
      lawFirm: {
        include: {
          voivodeship: true,
          categories: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: {
      startPromocji: "desc",
    },
    take: limit,
  })

  return promotions.map((p: any) => p.lawFirm)
}

/**
 * Pobiera kancelarie z aktywną promocją TOP_LISTA
 * (do wyświetlenia w sekcji "Top Kancelarie")
 */
export async function getTopLawFirms(limit: number = 10) {
  const now = new Date()

  const promotions = await prisma.promotion.findMany({
    where: {
      typPromocji: "TOP_LISTA",
      aktywna: true,
      startPromocji: {
        lte: now,
      },
      koniecPromocji: {
        gte: now,
      },
    },
    include: {
      lawFirm: {
        include: {
          voivodeship: true,
          categories: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: {
      startPromocji: "desc",
    },
    take: limit,
  })

  return promotions.map((p: any) => p.lawFirm)
}

/**
 * Sprawdza czy kancelaria powinna być wyróżniona wizualnie
 */
export async function shouldHighlightLawFirm(lawFirmId: string): Promise<boolean> {
  return await hasActivePromotion(lawFirmId, "WYROZNIENIE")
}

/**
 * Pobiera typ wyróżnienia dla kancelarii (jeśli ma aktywną promocję)
 */
export async function getLawFirmHighlightType(
  lawFirmId: string
): Promise<"PODBICIE_OGLOSZENIA" | "WYROZNIENIE" | "TOP_LISTA" | "STRONA_GLOWNA" | null> {
  const promotions = await getActiveLawFirmPromotions(lawFirmId)

  // Priorytet: STRONA_GLOWNA > TOP_LISTA > WYROZNIENIE > PODBICIE_OGLOSZENIA
  const priority: ("PODBICIE_OGLOSZENIA" | "WYROZNIENIE" | "TOP_LISTA" | "STRONA_GLOWNA")[] = [
    "STRONA_GLOWNA",
    "TOP_LISTA",
    "WYROZNIENIE",
    "PODBICIE_OGLOSZENIA",
  ]

  for (const type of priority) {
    if (promotions.some((p) => p.typPromocji === type)) {
      return type
    }
  }

  return null
}

// ============================================================================
// FUNKCJE POMOCNICZE DO ODNOWIENIA
// ============================================================================

/**
 * Automatycznie odnawia promocje, które się zakończyły i mają włączone auto-odnowienie
 * (Ta funkcja powinna być wywoływana przez cron job)
 */
export async function renewExpiredPromotions() {
  const now = new Date()

  // Znajdź promocje do odnowienia
  const expiredPromotions = await prisma.promotion.findMany({
    where: {
      aktywna: true,
      automatyczneOdnowienie: true,
      koniecPromocji: {
        lt: now,
      },
    },
    include: {
      lawFirm: true,
    },
  })

  const results = {
    renewed: [] as string[],
    failed: [] as { id: string; reason: string }[],
  }

  for (const promotion of expiredPromotions) {
    try {
      // Sprawdź czy kancelaria ma wystarczająco punktów
      if (promotion.lawFirm.punktySaldo < promotion.kosztPunktow) {
        // Dezaktywuj promocję i wyłącz auto-odnowienie
        await prisma.promotion.update({
          where: { id: promotion.id },
          data: {
            aktywna: false,
            automatyczneOdnowienie: false,
          },
        })

        results.failed.push({
          id: promotion.id,
          reason: "Niewystarczająca liczba punktów",
        })

        // Get promotion label
        const promotionLabels = {
          PODBICIE_OGLOSZENIA: 'Podbicie ogłoszenia',
          WYROZNIENIE: 'Wyróżnienie profilu',
          TOP_LISTA: 'Top Lista',
          STRONA_GLOWNA: 'Strona Główna Premium',
        }
        const promotionLabel = promotionLabels[promotion.typPromocji as keyof typeof promotionLabels]

        // Create in-app notification
        await prisma.notification.create({
          data: {
            userId: promotion.lawFirm.userId,
            typ: 'ZMIANA_STATUSU',
            tytul: 'Nie udało się odnowić promocji',
            tresc: `Promocja "${promotionLabel}" nie została odnowiona z powodu niewystarczającej liczby punktów. Potrzebujesz ${promotion.kosztPunktow} punktów, masz ${promotion.lawFirm.punktySaldo} punktów.`,
            linkUrl: '/panel-kancelarii/punkty',
          },
        })

        // Get user email
        const user = await prisma.user.findUnique({
          where: { id: promotion.lawFirm.userId },
          select: { email: true },
        })

        // Send email notification
        if (user?.email) {
          const emailData = generatePromotionRenewalFailedEmail(
            promotion.lawFirm.nazwa,
            promotionLabel,
            promotion.kosztPunktow,
            promotion.lawFirm.punktySaldo
          )

          sendEmail({
            to: user.email,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
          }).catch((error) => {
            console.error('Error sending promotion renewal failure email:', error)
          })
        }

        continue
      }

      // Oblicz nowe daty
      const newStart = new Date()
      const newEnd = new Date(newStart)
      newEnd.setDate(newEnd.getDate() + promotion.czasTrwaniaDni)

      // Utwórz nową promocję i odejmij punkty
      await prisma.$transaction([
        prisma.promotion.create({
          data: {
            lawFirmId: promotion.lawFirmId,
            typPromocji: promotion.typPromocji,
            czasTrwaniaDni: promotion.czasTrwaniaDni,
            kategoriaPromocji: promotion.kategoriaPromocji,
            wojewodztwoPromocji: promotion.wojewodztwoPromocji,
            startPromocji: newStart,
            koniecPromocji: newEnd,
            kosztPunktow: promotion.kosztPunktow,
            automatyczneOdnowienie: true,
            aktywna: true,
          },
        }),
        prisma.lawFirm.update({
          where: { id: promotion.lawFirmId },
          data: {
            punktySaldo: {
              decrement: promotion.kosztPunktow,
            },
          },
        }),
        // Dezaktywuj starą promocję
        prisma.promotion.update({
          where: { id: promotion.id },
          data: {
            aktywna: false,
          },
        }),
      ])

      results.renewed.push(promotion.id)

      // Get promotion label
      const promotionLabels = {
        PODBICIE_OGLOSZENIA: 'Podbicie ogłoszenia',
        WYROZNIENIE: 'Wyróżnienie profilu',
        TOP_LISTA: 'Top Lista',
        STRONA_GLOWNA: 'Strona Główna Premium',
      }
      const promotionLabel = promotionLabels[promotion.typPromocji as keyof typeof promotionLabels]

      // Get updated law firm balance
      const updatedLawFirm = await prisma.lawFirm.findUnique({
        where: { id: promotion.lawFirmId },
        select: { punktySaldo: true },
      })

      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId: promotion.lawFirm.userId,
          typ: 'ZMIANA_STATUSU',
          tytul: 'Promocja została odnowiona',
          tresc: `Twoja promocja "${promotionLabel}" została automatycznie odnowiona. Koszt: ${promotion.kosztPunktow} punktów. Pozostałe punkty: ${updatedLawFirm?.punktySaldo || 0}.`,
          linkUrl: '/panel-kancelarii/promowanie',
        },
      })

      // Get user email
      const user = await prisma.user.findUnique({
        where: { id: promotion.lawFirm.userId },
        select: { email: true },
      })

      // Send email notification
      if (user?.email) {
        const emailData = generatePromotionRenewedEmail(
          promotion.lawFirm.nazwa,
          promotionLabel,
          newEnd,
          promotion.kosztPunktow,
          updatedLawFirm?.punktySaldo || 0
        )

        sendEmail({
          to: user.email,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        }).catch((error) => {
          console.error('Error sending promotion renewal email:', error)
        })
      }
    } catch (error) {
      console.error(`Error renewing promotion ${promotion.id}:`, error)
      results.failed.push({
        id: promotion.id,
        reason: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  return results
}
