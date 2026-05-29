import { checkExpiredSubscriptions } from "@/lib/subscriptions"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  // Protect this route with a secret
  const authHeader = req.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const processedCount = await checkExpiredSubscriptions()
    return NextResponse.json({
      message: `Successfully processed ${processedCount} expired subscriptions.`
    })
  } catch (error) {
    console.error("Error in check-subscriptions cron:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
