import { sendEmailWithTemplate } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { EmailType } from "@prisma/client"
import { format } from "date-fns"

/**
 * Sprawdza ekspertów z aktywnym pakietem subskrypcji, które wygasły,
 * dezaktywuje pakiety i wysyła powiadomienia e-mail.
 */
export async function checkExpiredSubscriptions(): Promise<number> {
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
    const recipientEmail = lf.user?.email
    if (recipientEmail) {
      try {
        await sendEmailWithTemplate({
          to: recipientEmail,
          templateType: EmailType.SUBSKRYPCJA_KONIEC,
          variables: {
            "{ekspert}": lf.nazwa,
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

  return processedCount
}
