import { NextRequest, NextResponse } from "next/server"
import { processScheduledEmails } from "@/lib/scheduled-emails"

export async function GET(req: NextRequest) {
  // Protect this route with a secret
  const authHeader = req.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const results = await processScheduledEmails()
    return NextResponse.json({
      message: `Processed ${results.total} scheduled emails.`,
      sent: results.sent,
      failed: results.failed
    })
  } catch (error) {
    console.error("Error in scheduled emails cron:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
