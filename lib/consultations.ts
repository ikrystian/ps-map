import { sendEmailWithTemplate } from "@/lib/email"
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
          tresc: `Twój wirtualny pokój z ${booking.lawFirm.nazwaFirmy} na dzień ${dateStr} jest już aktywny.${linkTresc}`,
          linkUrl: "/panel-klienta/consultacje",
          emailTemplateType: "LINK_KONSULTACJI",
          emailVariables: {
            '{odbiorca}': booking.client.user.name || booking.client.user.email,
            '{ekspert}': booking.lawFirm.nazwaFirmy,
            '{klient}': booking.client.user.name || booking.client.user.email,
            '{termin}': dateStr,
            '{linkDoSpotkania}': meetLink,
            '{linkDoPanelu}': `${process.env.URL || ''}/panel-klienta/konsultacje`,
          },
          force: true,
        })

        // Wyślij powiadomienie do eksperta
        await sendSystemNotification({
          userId: booking.lawFirm.userId,
          typ: "KONSULTACJA_ZAAKCEPTOWANA",
          tytul: "Twój link do konsultacji jest gotowy",
          tresc: `Twój wirtualny pokój z klientem ${booking.client.user.name} na dzień ${dateStr} jest już aktywny.${linkTresc}`,
          linkUrl: "/panel-eksperta/consultacje",
          emailTemplateType: "LINK_KONSULTACJI",
          emailVariables: {
            '{odbiorca}': booking.lawFirm.nazwaFirmy,
            '{ekspert}': booking.lawFirm.nazwaFirmy,
            '{klient}': booking.client.user.name || booking.client.user.email,
            '{termin}': dateStr,
            '{linkDoSpotkania}': meetLink,
            '{linkDoPanelu}': `${process.env.URL || ''}/panel-eksperta/konsultacje`,
          },
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
      await sendEmailWithTemplate({
        to: booking.client.user.email,
        templateType: "PRZYPOMNIENIE_KONSULTACJI",
        variables: {
          '{odbiorca}': booking.client.user.name || booking.client.user.email,
          '{ekspert}': booking.lawFirm.nazwaFirmy,
          '{klient}': booking.client.user.name || booking.client.user.email,
          '{termin}': formattedDate,
          '{linkDoSpotkania}': booking.googleMeetUrl || '',
          '{linkDoPanelu}': `${process.env.URL || ''}/panel-klienta/konsultacje`,
        },
        fallbackProvider: () => ({
          subject: `Przypomnienie o konsultacji z ${booking.lawFirm.nazwaFirmy}`,
          html: `<p>Witaj ${booking.client.user.name},</p><p>Przypominamy o nadchodzącej konsultacji z ekspertem ${booking.lawFirm.nazwaFirmy} w dniu ${formattedDate}.</p><p>Link do spotkania: <a href="${booking.googleMeetUrl}">${booking.googleMeetUrl}</a></p>`,
          text: `Witaj ${booking.client.user.name}, przypominamy o konsultacji z ${booking.lawFirm.nazwaFirmy} w dniu ${formattedDate}. Link: ${booking.googleMeetUrl}`,
        }),
      })
    } catch (error) {
      console.error(`Failed to send consultation reminder to client ${booking.client.user.email}:`, error)
    }

    // Send reminder to law firm
    try {
      await sendEmailWithTemplate({
        to: booking.lawFirm.user.email,
        templateType: "PRZYPOMNIENIE_KONSULTACJI",
        variables: {
          '{odbiorca}': booking.lawFirm.nazwaFirmy,
          '{ekspert}': booking.lawFirm.nazwaFirmy,
          '{klient}': booking.client.user.name || booking.client.user.email,
          '{termin}': formattedDate,
          '{linkDoSpotkania}': booking.googleMeetUrl || '',
          '{linkDoPanelu}': `${process.env.URL || ''}/panel-eksperta/konsultacje`,
        },
        fallbackProvider: () => ({
          subject: `Przypomnienie o konsultacji z ${booking.client.user.name}`,
          html: `<p>Witaj ${booking.lawFirm.nazwaFirmy},</p><p>Przypominamy o nadchodzącej konsultacji z klientem ${booking.client.user.name} w dniu ${formattedDate}.</p><p>Link do spotkania: <a href="${booking.googleMeetUrl}">${booking.googleMeetUrl}</a></p>`,
          text: `Witaj ${booking.lawFirm.nazwaFirmy}, przypominamy o konsultacji z klientem ${booking.client.user.name} w dniu ${formattedDate}. Link: ${booking.googleMeetUrl}`,
        }),
      })
    } catch (error) {
      console.error(`Failed to send consultation reminder to law firm ${booking.lawFirm.user.email}:`, error)
    }

    count++
  }

  return count
}
