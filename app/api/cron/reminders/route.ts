import { verifyCronAuth } from "@/lib/cron-auth"
import { sendConsultationReminders, generateUpcomingGoogleMeetLinks } from "@/lib/consultations"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const unauthorized = verifyCronAuth(req)
  if (unauthorized) return unauthorized

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
