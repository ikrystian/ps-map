import { verifyCronAuth } from "@/lib/cron-auth"
import { deactivateExpiredPromotions, renewExpiredPromotions } from "@/lib/promotions"
import { NextRequest, NextResponse } from "next/server"

/**
 * Cron Job: Automatyczne odnowienie promocji
 *
 * Ten endpoint powinien być wywoływany codziennie (np. o 00:00)
 * przez zewnętrzny serwis cron (np. Vercel Cron, cron-job.org)
 *
 * Przykładowa konfiguracja w vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/renew-promotions",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const unauthorized = verifyCronAuth(request)
    if (unauthorized) return unauthorized

    console.log("[CRON] Starting promotion renewal and deactivation process...")

    // Najpierw zdezaktywuj wygasłe promocje bez autoodnowienia
    const deactivatedIds = await deactivateExpiredPromotions()

    // Odnów wygasłe promocje z autoodnowieniem
    const results = await renewExpiredPromotions()

    console.log("[CRON] Promotion renewal completed:", {
      deactivated: deactivatedIds.length,
      renewed: results.renewed.length,
      failed: results.failed.length,
    })

    return NextResponse.json({
      success: true,
      message: "Promotion renewal completed",
      deactivated: deactivatedIds.length,
      renewed: results.renewed.length,
      failed: results.failed.length,
      details: results,
    })
  } catch (error) {
    console.error("[CRON] Error renewing promotions:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to renew promotions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
