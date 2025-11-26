import { prisma } from "@/lib/prisma"
import { sendEmail, generateConsultationReminderEmail } from "@/lib/email"

export async function sendConsultationReminders() {
  const now = new Date()
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

  const upcomingConsultations = await prisma.consultation.findMany({
    where: {
      proposedDateTime: {
        gte: now,
        lte: oneHourFromNow,
      },
      status: 'PAID',
    },
    include: {
      client: {
        include: {
          user: true,
        },
      },
      lawFirm: {
        include: {
          user: true,
        },
      },
    },
  })

  for (const consultation of upcomingConsultations) {
    // Send reminder to client
    const clientEmail = generateConsultationReminderEmail(consultation.client.imie, consultation, false)
    await sendEmail({
      to: consultation.client.user.email,
      ...clientEmail,
    })

    // Send reminder to law firm
    const lawFirmEmail = generateConsultationReminderEmail(consultation.lawFirm.nazwa, consultation, true)
    await sendEmail({
      to: consultation.lawFirm.user.email,
      ...lawFirmEmail,
    })
  }
}