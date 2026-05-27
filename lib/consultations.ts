import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

/**
 * Pobiera zaplanowane i opłacone konsultacje rozpoczynające się w ciągu najbliższej godziny,
 * a następnie wysyła przypomnienia e-mail do klientów oraz kancelarii.
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
        html: `<p>Witaj ${booking.client.user.name},</p><p>Przypominamy o nadchodzącej konsultacji z kancelarią ${booking.lawFirm.nazwa} w dniu ${formattedDate}.</p><p>Link do spotkania: <a href="${booking.googleMeetUrl}">${booking.googleMeetUrl}</a></p>`,
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
