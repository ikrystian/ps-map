import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmailWithTemplate, sendEmail } from "@/lib/email"
import { EmailType, ScheduledEmailStatus } from "@prisma/client"

export async function GET(req: NextRequest) {
  // Protect this route with a secret
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
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
        await prisma.scheduledEmail.update({
          where: { id: email.id },
          data: {
            status: ScheduledEmailStatus.FAILED,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
            updatedAt: new Date()
          }
        })
        failedCount++
      }
    }

    return NextResponse.json({
      message: `Processed ${emailsToSend.length} scheduled emails.`,
      sent: successCount,
      failed: failedCount
    })
  } catch (error) {
    console.error("Error in scheduled emails cron:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
