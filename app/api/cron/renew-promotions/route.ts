import { NextRequest, NextResponse } from "next/server"
import { renewExpiredPromotions, deactivateExpiredPromotions } from "@/lib/promotions"

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
    // Weryfikacja autoryzacji (opcjonalne, ale zalecane)
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

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
