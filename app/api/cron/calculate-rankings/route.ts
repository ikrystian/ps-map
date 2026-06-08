import { verifyCronAuth } from "@/lib/cron-auth"
import { calculateRankings } from "@/lib/rankings"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const unauthorized = verifyCronAuth(request)
    if (unauthorized) return unauthorized

    const count = await calculateRankings()

    return Response.json({
      success: true,
      message: `Updated rankings for ${count} law firms`,
      totalFirms: count,
    })
  } catch (error) {
    console.error("Error calculating rankings:", error)
    return Response.json(
      { error: "Błąd podczas obliczania rankingów" },
      { status: 500 }
    )
  }
}
