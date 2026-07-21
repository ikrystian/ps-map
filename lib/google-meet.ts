import { google } from "googleapis"

function generateMockMeetLink(id?: string) {
  if (id) {
    // Generate a deterministic meeting code based on booking ID
    const cleanId = id.replace(/[^a-z0-9]/gi, "").toLowerCase()
    const part1 = (cleanId.slice(0, 3) || "psm").padEnd(3, "a")
    const part2 = (cleanId.slice(3, 7) || "meet").padEnd(4, "b")
    const part3 = (cleanId.slice(7, 10) || "room").padEnd(3, "c")
    return `https://meet.google.com/${part1}-${part2}-${part3}`
  }
  const chars = "abcdefghijklmnopqrstuvwxyz"
  const rand = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `https://meet.google.com/${rand(3)}-${rand(4)}-${rand(3)}`
}

export async function createGoogleMeetLink(consultation: any) {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.warn("Google credentials not configured, generating a mock Google Meet link")
    return generateMockMeetLink(consultation?.id)
  }

  const lawFirmName = consultation?.lawFirm?.nazwa || consultation?.lawFirmName || "Ekspert"
  const proposedDateTime = consultation?.proposedDateTime || new Date().toISOString()

  // Create JWT client for service account authentication
  const jwtClient = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"],
    // If GOOGLE_ADMIN_EMAIL is set, impersonate that user (requires Domain-Wide Delegation)
    // Leave undefined/empty to use service account without impersonation
    subject: process.env.GOOGLE_ADMIN_EMAIL || undefined,
  })

  const calendar = google.calendar({ version: "v3", auth: jwtClient })

  const event = {
    summary: `Konsultacja prawna - ${lawFirmName}`,
    description: consultation?.description || "Konsultacja online",
    start: {
      dateTime: proposedDateTime,
      timeZone: "Europe/Warsaw",
    },
    end: {
      dateTime: new Date(new Date(proposedDateTime).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
      timeZone: "Europe/Warsaw",
    },
    conferenceData: {
      createRequest: {
        requestId: `consultation-${consultation?.id || Date.now()}`,
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
    },
  }

  try {
    // Use GOOGLE_CALENDAR_ID if configured, otherwise use "primary" if impersonating, or service account email
    const calendarId = process.env.GOOGLE_CALENDAR_ID || (process.env.GOOGLE_ADMIN_EMAIL ? "primary" : process.env.GOOGLE_CLIENT_EMAIL!)

    const createdEvent = await calendar.events.insert({
      calendarId,
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'none', // Don't send email notifications
    })

    const link = createdEvent.data.hangoutLink || createdEvent.data.conferenceData?.entryPoints?.[0]?.uri
    if (link) {
      return link
    }
    console.warn("Google Calendar event created, but no Meet link returned. Falling back to generated room link.")
    return generateMockMeetLink(consultation?.id)
  } catch (error: any) {
    console.error("Error creating Google Meet link via Calendar API:", error?.message || error)
    if (error?.message?.includes("Invalid conference type")) {
      console.warn("Note: Google Service Accounts require either GOOGLE_ADMIN_EMAIL (Domain-Wide Delegation) or a shared GOOGLE_CALENDAR_ID from a Google Workspace user to create native Meet links.")
    }
    return generateMockMeetLink(consultation?.id)
  }
}