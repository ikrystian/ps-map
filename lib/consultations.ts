import { sendEmail } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { createGoogleMeetLink } from "./google-meet"
import { sendSystemNotification } from "./notifications"

/**
 * Generuje linki Google Meet dla zaakceptowanych konsultacji na 5 minut przed ich rozpoczęciem.
 */
export async function generateUpcomingGoogleMeetLinks(): Promise<number> {
  const now = new Date()
  // Generujemy linki dla spotkań rozpoczynających się w ciągu najbliższych 30 minut
  // oraz tych, które już się rozpoczęły, ale wciąż trwają lub rozpoczęły się niedawno (do 60 minut wstecz)
  const startTime = new Date(now.getTime() - 60 * 60 * 1000)
  const targetTime = new Date(now.getTime() + 30 * 60 * 1000)

  const upcomingBookings = await prisma.consultationBooking.findMany({
    where: {
      status: "ACCEPTED",
      googleMeetUrl: null,
      consultationDate: {
        gte: startTime,
        lte: targetTime,
      },
    },
    include: {
      client: { include: { user: true } },
      lawFirm: { include: { user: true } },
    },
  })

  let count = 0

  for (const booking of upcomingBookings) {
    try {
      const meetLink = await createGoogleMeetLink({
        id: booking.id,
        proposedDateTime: booking.consultationDate.toISOString(),
        description: booking.topic,
        lawFirm: booking.lawFirm,
        client: booking.client,
      })

      if (meetLink) {
        await prisma.consultationBooking.update({
          where: { id: booking.id },
          data: { googleMeetUrl: meetLink },
        })

        const dateStr = new Date(booking.consultationDate).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
        const linkTresc = ` Link do spotkania Google Meet: ${meetLink}`;

        // Wyślij powiadomienie do klienta
        await sendSystemNotification({
          userId: booking.client.userId,
          typ: "KONSULTACJA_ZAAKCEPTOWANA",
          tytul: "Twój link do konsultacji jest gotowy",
          tresc: `Twój wirtualny pokój z ${booking.lawFirm.nazwa} na dzień ${dateStr} jest już aktywny.${linkTresc}`,
          linkUrl: "/panel-klienta/consultacje",
          emailHtml: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #0da192;">Twój link do konsultacji jest gotowy!</h2>
              <p>Dzień dobry,</p>
              <p>Za chwilę rozpoczyna się Twoja konsultacja z <strong>${booking.lawFirm.nazwa}</strong>.</p>
              <p><strong>Termin spotkania:</strong> ${dateStr}</p>
              <p><strong>Link do spotkania (Google Meet):</strong><br/>
              <a href="${meetLink}" style="display: inline-block; padding: 10px 20px; background-color: #0da192; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px; font-weight: bold;">Dołącz do Google Meet</a></p>
              <p style="font-size: 12px; color: #666;">Spotkanie wideo jest ważne przez 1 godzinę.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #999;">Wiadomość wygenerowana automatycznie przez portal Prosta Sprawa.</p>
            </div>
          `,
          force: true,
        })

        // Wyślij powiadomienie do eksperta
        await sendSystemNotification({
          userId: booking.lawFirm.userId,
          typ: "KONSULTACJA_ZAAKCEPTOWANA",
          tytul: "Twój link do konsultacji jest gotowy",
          tresc: `Twój wirtualny pokój z klientem ${booking.client.user.name} na dzień ${dateStr} jest już aktywny.${linkTresc}`,
          linkUrl: "/panel-eksperta/consultacje",
          emailHtml: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #0da192;">Twój link do konsultacji jest gotowy!</h2>
              <p>Dzień dobry,</p>
              <p>Za chwilę rozpoczyna się Twoja konsultacja z klientem <strong>${booking.client.user.name}</strong>.</p>
              <p><strong>Termin spotkania:</strong> ${dateStr}</p>
              <p><strong>Link do spotkania (Google Meet):</strong><br/>
              <a href="${meetLink}" style="display: inline-block; padding: 10px 20px; background-color: #0da192; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px; font-weight: bold;">Dołącz do Google Meet</a></p>
              <p style="font-size: 12px; color: #666;">Spotkanie wideo jest ważne przez 1 godzinę.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #999;">Wiadomość wygenerowana automatycznie przez portal Prosta Sprawa.</p>
            </div>
          `,
          force: true,
        })

        count++
      }
    } catch (error) {
      console.error(`Error generating meet link for booking ${booking.id}:`, error)
    }
  }

  return count
}

/**
 * Pobiera zaplanowane i opłacone konsultacje rozpoczynające się w ciągu najbliższej godziny,
 * a następnie wysyła przypomnienia e-mail do klientów oraz eksperta.
 */
export async function sendConsultationReminders(): Promise<number> {
  const now = new Date()
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

  const upcomingConsultations = await prisma.consultationBooking.findMany({
    where: {
      status: "ACCEPTED",
      paymentStatus: "ZAPLACONE",
      consultationDate: {
        gte: now,
        lte: oneHourFromNow,
      },
    },
    include: {
      client: { include: { user: true } },
      lawFirm: { include: { user: true } },
    },
  })

  let count = 0

  for (const booking of upcomingConsultations) {
    const formattedDate = format(new Date(booking.consultationDate), "PPP p", { locale: pl })

    // Send reminder to client
    try {
      await sendEmail({
        to: booking.client.user.email,
        subject: `Przypomnienie o konsultacji z ${booking.lawFirm.nazwa}`,
        html: `<p>Witaj ${booking.client.user.name},</p><p>Przypominamy o nadchodzącej konsultacji z ekspertem ${booking.lawFirm.nazwa} w dniu ${formattedDate}.</p><p>Link do spotkania: <a href="${booking.googleMeetUrl}">${booking.googleMeetUrl}</a></p>`,
      })
    } catch (error) {
      console.error(`Failed to send consultation reminder to client ${booking.client.user.email}:`, error)
    }

    // Send reminder to law firm
    try {
      await sendEmail({
        to: booking.lawFirm.user.email,
        subject: `Przypomnienie o konsultacji z ${booking.client.user.name}`,
        html: `<p>Witaj ${booking.lawFirm.nazwa},</p><p>Przypominamy o nadchodzącej konsultacji z klientem ${booking.client.user.name} w dniu ${formattedDate}.</p><p>Link do spotkania: <a href="${booking.googleMeetUrl}">${booking.googleMeetUrl}</a></p>`,
      })
    } catch (error) {
      console.error(`Failed to send consultation reminder to law firm ${booking.lawFirm.user.email}:`, error)
    }

    count++
  }

  return count
}
