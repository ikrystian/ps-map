import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmailWithTemplate } from "@/lib/email"
import { EmailType } from "@prisma/client"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

export async function GET(req: NextRequest) {
  // Protect this route with a secret
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const expiredLawFirms = await prisma.lawFirm.findMany({
      where: {
        pakietSubskrypcji: {
          not: null
        },
        dataPakietuDo: {
          lt: now
        }
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    })

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    let processedCount = 0

    for (const lf of expiredLawFirms) {
      const packageType = lf.pakietSubskrypcji || ""
      const dataWygasnieciaStr = lf.dataPakietuDo 
        ? format(new Date(lf.dataPakietuDo), "dd.MM.yyyy") 
        : format(now, "dd.MM.yyyy")

      // 1. Send the expiration email
      const recipientEmail = lf.emailKontakt || lf.user?.email
      if (recipientEmail) {
        try {
          await sendEmailWithTemplate({
            to: recipientEmail,
            templateType: EmailType.SUBSKRYPCJA_KONIEC,
            variables: {
              "{kancelaria}": lf.nazwa,
              "{nazwaSubskrypcji}": packageType,
              "{dataWygasniecia}": dataWygasnieciaStr,
              "{linkDoPakietow}": `${baseUrl}/panel-eksperta/pakiet`
            }
          })
        } catch (emailError) {
          console.error(`Failed to send subscription expiration email to law firm ${lf.nazwa}:`, emailError)
        }
      }

      // 2. Remove the subscription package from the database
      await prisma.lawFirm.update({
        where: { id: lf.id },
        data: {
          pakietSubskrypcji: null,
          dataPakietuOd: null,
          dataPakietuDo: null
        }
      })

      processedCount++
    }

    return NextResponse.json({
      message: `Successfully processed ${processedCount} expired subscriptions.`
    })
  } catch (error) {
    console.error("Error in check-subscriptions cron:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
