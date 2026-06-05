import { sendConsultationReminders, generateUpcomingGoogleMeetLinks } from "@/lib/consultations"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  // Protect this route with a secret
  const authHeader = req.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const remindersCount = await sendConsultationReminders()
    const linksCount = await generateUpcomingGoogleMeetLinks()
    return NextResponse.json({ 
      message: `Sent ${remindersCount} reminders. Generated ${linksCount} Google Meet links.` 
    })
  } catch (error) {
    console.error("Error in cron job:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
