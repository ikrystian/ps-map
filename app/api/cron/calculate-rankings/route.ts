import { NextRequest } from "next/server"
import { calculateRankings } from "@/lib/rankings"

export async function GET(request: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get("authorization")
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

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
