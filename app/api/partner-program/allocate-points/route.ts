import { verifyCronAuth } from "@/lib/cron-auth"
import { allocateMonthlyPoints } from "@/lib/partner-program"
import { NextRequest } from "next/server"

/**
 * POST /api/partner-program/allocate-points
 * Przyznaj miesięczne punkty wszystkim aktywnym partnerom
 *
 * Ten endpoint powinien być wywoływany przez zadanie CRON raz w miesiącu.
 * Wymaga sekretu CRON (nagłówek `Authorization: Bearer <CRON_SECRET>`
 * lub `x-cron-secret: <CRON_SECRET>`).
 */
export async function POST(request: NextRequest) {
  try {
    const unauthorized = verifyCronAuth(request)
    if (unauthorized) return unauthorized

    // Pobierz parametry z body (opcjonalne - domyślnie bieżący miesiąc)
    const body = await request.json().catch(() => ({}))
    const now = new Date()
    const year = body.year || now.getFullYear()
    const month = body.month || now.getMonth() + 1 // JavaScript months are 0-indexed

    // Walidacja parametrów
    if (month < 1 || month > 12) {
      return Response.json(
        { error: "Nieprawidłowy miesiąc (1-12)" },
        { status: 400 }
      )
    }

    console.log(`[CRON] Allocating partner points for ${year}-${month.toString().padStart(2, '0')}`)

    // Przyznaj punkty
    const results = await allocateMonthlyPoints(year, month)

    console.log(`[CRON] Partner points allocation completed:`, {
      total: results.total,
      success: results.success,
      failed: results.failed,
      totalPointsAllocated: results.totalPointsAllocated
    })

    return Response.json({
      success: true,
      message: `Przyznano punkty za ${year}-${month.toString().padStart(2, '0')}`,
      year,
      month,
      results: {
        totalPartners: results.total,
        successful: results.success,
        failed: results.failed,
        totalPointsAllocated: results.totalPointsAllocated,
        details: results.details
      }
    })

  } catch (error: any) {
    console.error("[CRON] Error allocating partner points:", error)
    return Response.json(
      {
        error: "Błąd podczas przyznawania punktów",
        message: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/partner-program/allocate-points
 * Informacje o endpoincie CRON
 */
export async function GET(request: NextRequest) {
  return Response.json({
    info: "Endpoint do automatycznego przyznawania miesięcznych punktów partnerom",
    usage: {
      method: "POST",
      headers: {
        "x-cron-secret": "Wymagany sekret CRON_SECRET (lub nagłówek Authorization: Bearer <CRON_SECRET>)"
      },
      body: {
        year: "Rok (opcjonalny, domyślnie bieżący)",
        month: "Miesiąc 1-12 (opcjonalny, domyślnie bieżący)"
      }
    },
    cronSetup: {
      vercel: "Dodaj Vercel Cron Job w vercel.json",
      example: "curl -X POST https://your-domain.com/api/partner-program/allocate-points -H 'x-cron-secret: YOUR_SECRET'"
    }
  })
}
