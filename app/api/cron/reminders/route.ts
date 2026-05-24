import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { sendEmail } from "@/lib/email"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  // Protect this route with a secret
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
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

    for (const booking of upcomingConsultations) {
      const formattedDate = format(new Date(booking.consultationDate), "PPP p", { locale: pl })

      // Send reminder to client
      await sendEmail({
        to: booking.client.user.email,
        subject: `Przypomnienie o konsultacji z ${booking.lawFirm.nazwa}`,
        html: `<p>Witaj ${booking.client.user.name},</p><p>Przypominamy o nadchodzącej konsultacji z kancelarią ${booking.lawFirm.nazwa} w dniu ${formattedDate}.</p><p>Link do spotkania: <a href="${booking.googleMeetUrl}">${booking.googleMeetUrl}</a></p>`,
      })

      // Send reminder to law firm
      await sendEmail({
        to: booking.lawFirm.user.email,
        subject: `Przypomnienie o konsultacji z ${booking.client.user.name}`,
        html: `<p>Witaj ${booking.lawFirm.nazwa},</p><p>Przypominamy o nadchodzącej konsultacji z klientem ${booking.client.user.name} w dniu ${formattedDate}.</p><p>Link do spotkania: <a href="${booking.googleMeetUrl}">${booking.googleMeetUrl}</a></p>`,
      })
    }

    return NextResponse.json({ message: `Sent ${upcomingConsultations.length} reminders.` })
  } catch (error) {
    console.error("Error in cron job:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
