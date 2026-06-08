import { verifyCronAuth } from "@/lib/cron-auth"
import { processScheduledEmails } from "@/lib/scheduled-emails"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const unauthorized = verifyCronAuth(req)
  if (unauthorized) return unauthorized

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
