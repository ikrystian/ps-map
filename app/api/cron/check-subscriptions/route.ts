import { verifyCronAuth } from "@/lib/cron-auth"
import { checkExpiredSubscriptions } from "@/lib/subscriptions"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const unauthorized = verifyCronAuth(req)
  if (unauthorized) return unauthorized

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
