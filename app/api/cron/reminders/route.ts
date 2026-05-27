import { NextRequest, NextResponse } from "next/server"
import { sendConsultationReminders } from "@/lib/consultations"

export async function GET(req: NextRequest) {
  // Protect this route with a secret
  const authHeader = req.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const count = await sendConsultationReminders()
    return NextResponse.json({ message: `Sent ${count} reminders.` })
  } catch (error) {
    console.error("Error in cron job:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
