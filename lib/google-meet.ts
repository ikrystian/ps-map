import { google } from "googleapis"

export async function createGoogleMeetLink(consultation: any) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  })

  const calendar = google.calendar({ version: "v3", auth })

  const event = {
    summary: `Konsultacja prawna - ${consultation.lawFirm.nazwa}`,
    description: consultation.description,
    start: {
      dateTime: consultation.proposedDateTime,
      timeZone: "Europe/Warsaw",
    },
    end: {
      dateTime: new Date(new Date(consultation.proposedDateTime).getTime() + 60 * 60 * 1000).toISOString(),
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
    attendees: [
      { email: consultation.client.user.email },
      { email: consultation.lawFirm.user.email },
    ],
  }

  try {
    const createdEvent = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
    })

    return createdEvent.data.hangoutLink
  } catch (error) {
    console.error("Error creating Google Meet link:", error)
    return null
  }
}