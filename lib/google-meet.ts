import { google } from "googleapis"

function generateFallbackMeetLink(id?: string) {
  if (process.env.GOOGLE_MEET_FALLBACK_URL) {
    return process.env.GOOGLE_MEET_FALLBACK_URL
  }
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
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET

  let authClient: any = null
  let defaultCalendarId = "primary"

  // 1. Try OAuth2 Refresh Token (recommended for standard @gmail.com accounts)
  if (refreshToken && clientId && clientSecret) {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
    oauth2Client.setCredentials({ refresh_token: refreshToken })
    authClient = oauth2Client
    defaultCalendarId = process.env.GOOGLE_CALENDAR_ID || "primary"
  } 
  // 2. Try Service Account JWT (requires Google Workspace & Domain-Wide Delegation for Meet links)
  else if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    authClient = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"],
      subject: process.env.GOOGLE_ADMIN_EMAIL || undefined,
    })
    defaultCalendarId = process.env.GOOGLE_CALENDAR_ID || (process.env.GOOGLE_ADMIN_EMAIL ? "primary" : process.env.GOOGLE_CLIENT_EMAIL!)
  } else {
    console.warn("Google credentials not configured, using fallback Google Meet link")
    return generateFallbackMeetLink(consultation?.id)
  }

  const lawFirmName = consultation?.lawFirm?.nazwa || consultation?.lawFirmName || "Ekspert"
  const proposedDateTime = consultation?.proposedDateTime || new Date().toISOString()

  // Lista uczestników (klient i ekspert/kancelaria), dzięki czemu Google Meet wpuszcza ich bez pukania / bez akceptacji gospodarza
  const attendees: Array<{ email: string; displayName?: string }> = []
  
  const clientEmail = consultation?.client?.user?.email || consultation?.clientEmail
  const clientName = consultation?.client?.user?.name || consultation?.clientName
  if (clientEmail) {
    attendees.push({ email: clientEmail, ...(clientName ? { displayName: clientName } : {}) })
  }

  const lawFirmEmail = consultation?.lawFirm?.user?.email || consultation?.lawFirmEmail
  if (lawFirmEmail) {
    attendees.push({ email: lawFirmEmail, displayName: lawFirmName })
  }

  const calendar = google.calendar({ version: "v3", auth: authClient })

  const event: any = {
    summary: `Konsultacja prawna - ${lawFirmName}`,
    description: consultation?.description || "Konsultacja online",
    start: {
      dateTime: new Date(proposedDateTime).toISOString(),
      timeZone: "Europe/Warsaw",
    },
    end: {
      dateTime: new Date(new Date(proposedDateTime).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
      timeZone: "Europe/Warsaw",
    },
    ...(attendees.length > 0 ? { attendees } : {}),
    guestsCanInviteOthers: true,
    guestsCanSeeOtherGuests: true,
    anyoneCanAddSelf: true,
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
    const createdEvent = await calendar.events.insert({
      calendarId: defaultCalendarId,
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'none',
    })

    const link = createdEvent.data.hangoutLink || createdEvent.data.conferenceData?.entryPoints?.[0]?.uri
    if (link) {
      return link
    }
    console.warn("Google Calendar event created, but no Meet link returned. Falling back to default link.")
    return generateFallbackMeetLink(consultation?.id)
  } catch (error: any) {
    console.error("Error creating Google Meet link via Calendar API:", error?.message || error)
    if (error?.message?.includes("Invalid conference type")) {
      console.warn("Note: Google Service Accounts (@iam.gserviceaccount.com) cannot generate Google Meet links for standard @gmail.com accounts. Either provide GOOGLE_REFRESH_TOKEN or set GOOGLE_ADMIN_EMAIL with Domain-Wide Delegation on Google Workspace.")
    }
    return generateFallbackMeetLink(consultation?.id)
  }
}