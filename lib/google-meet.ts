import { google } from "googleapis"

function generateMockMeetLink() {
  const chars = "abcdefghijklmnopqrstuvwxyz"
  const rand = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `https://meet.google.com/${rand(3)}-${rand(4)}-${rand(3)}`
}

export async function createGoogleMeetLink(consultation: any) {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.warn("Google credentials not configured, generating a mock Google Meet link")
    return generateMockMeetLink()
  }

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
    summary: `Konsultacja prawna - ${consultation.lawFirm.nazwa}`,
    description: consultation.description,
    start: {
      dateTime: consultation.proposedDateTime,
      timeZone: "Europe/Warsaw",
    },
    end: {
      dateTime: new Date(new Date(consultation.proposedDateTime).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
      timeZone: "Europe/Warsaw",
    },
    conferenceData: {
      createRequest: {
        requestId: `consultation-${consultation.id}`,
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
    },
    // Note: Service accounts cannot add attendees without Domain-Wide Delegation
    // The meet link will be shared with both parties through the application
  }

  try {
    // Use "primary" calendar if impersonating a user, otherwise use service account's calendar
    const calendarId = process.env.GOOGLE_ADMIN_EMAIL ? "primary" : process.env.GOOGLE_CLIENT_EMAIL!

    const createdEvent = await calendar.events.insert({
      calendarId,
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'none', // Don't send email notifications
    })

    return createdEvent.data.hangoutLink || createdEvent.data.conferenceData?.entryPoints?.[0]?.uri || generateMockMeetLink()
  } catch (error) {
    console.error("Error creating Google Meet link, falling back to mock link:", error)
    return generateMockMeetLink()
  }
}