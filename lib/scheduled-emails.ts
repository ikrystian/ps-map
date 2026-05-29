import { sendEmail, sendEmailWithTemplate } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { ScheduledEmailStatus } from "@prisma/client"

interface ProcessEmailsResult {
  total: number
  sent: number
  failed: number
}

/**
 * Przetwarza zaplanowane wiadomości e-mail o statusie PENDING,
 * dla których zaplanowany czas minął.
 */
export async function processScheduledEmails(): Promise<ProcessEmailsResult> {
  const now = new Date()
  const emailsToSend = await prisma.scheduledEmail.findMany({
    where: {
      status: ScheduledEmailStatus.PENDING,
      scheduledAt: {
        lte: now
      }
    }
  })

  let successCount = 0
  let failedCount = 0

  for (const email of emailsToSend) {
    try {
      let sent = false

      if (email.templateType) {
        const vars = email.variables ? JSON.parse(email.variables) : {}
        sent = await sendEmailWithTemplate({
          to: email.to,
          templateType: email.templateType,
          variables: vars
        })
      } else {
        sent = await sendEmail({
          to: email.to,
          subject: email.subject,
          html: email.html || email.content || "",
          text: email.content || ""
        })
      }

      if (sent) {
        await prisma.scheduledEmail.update({
          where: { id: email.id },
          data: {
            status: ScheduledEmailStatus.SENT,
            sentAt: new Date(),
            updatedAt: new Date()
          }
        })
        successCount++
      } else {
        await prisma.scheduledEmail.update({
          where: { id: email.id },
          data: {
            status: ScheduledEmailStatus.FAILED,
            errorMessage: "Email sender returned false",
            updatedAt: new Date()
          }
        })
        failedCount++
      }
    } catch (error) {
      console.error(`Error sending scheduled email ${email.id}:`, error)
      try {
        await prisma.scheduledEmail.update({
          where: { id: email.id },
          data: {
            status: ScheduledEmailStatus.FAILED,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
            updatedAt: new Date()
          }
        })
      } catch (dbError) {
        console.error(`Failed to update status for scheduled email ${email.id}:`, dbError)
      }
      failedCount++
    }
  }

  return {
    total: emailsToSend.length,
    sent: successCount,
    failed: failedCount
  }
}
