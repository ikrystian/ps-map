import type { Booking } from "./types"

function toIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

function escapeIcs(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n")
}

/** Plik .ics otwierany przez systemowy kalendarz; działa bez uprawnień do kalendarza. */
export function buildBookingCalendarFile(booking: Booking, clientName: string) {
  const start = new Date(booking.consultationDate)
  const end = new Date(start.getTime() + booking.duration * 60 * 1000)
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Prosta Sprawa//Ekspert//PL",
    "BEGIN:VEVENT",
    `UID:${booking.id}@prostasprawa.pl`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcs(`Konsultacja: ${clientName}`)}`,
    `DESCRIPTION:${escapeIcs(booking.topic)}`,
    ...(booking.googleMeetUrl ? [`URL:${booking.googleMeetUrl}`, `LOCATION:${escapeIcs(booking.googleMeetUrl)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ]
  return {
    blob: new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" }),
    filename: `konsultacja-${start.toISOString().slice(0, 10)}.ics`,
  }
}
