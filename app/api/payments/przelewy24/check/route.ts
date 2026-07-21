import { auth } from "@/lib/auth"
import { generateInvoiceForOrder } from "@/lib/invoice-generator"
import { prisma } from "@/lib/prisma"
import { p24Client } from "@/lib/przelewy24"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json({ error: "Musisz być zalogowany" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return Response.json({ error: "Brak ID zamówienia" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        lawFirm: { include: { user: true } },
        invoice: true,
        subscriptionPlan: true,
      },
    })

    if (!order) {
      return Response.json({ error: "Nie znaleziono zamówienia" }, { status: 404 })
    }

    if (order.lawFirm.userId !== session.user.id) {
      return Response.json({ error: "Brak dostępu" }, { status: 403 })
    }

    if (order.statusPlatnosci === "ZAPLACONE") {
      return Response.json({ status: "ZAPLACONE" })
    }

    if (!order.externalOrderId) {
      return Response.json({ status: "OCZEKUJE", error: "Brak sessionId" })
    }

    // Pobierz status transakcji z P24
    const txResult = await p24Client.getTransactionBySessionId(order.externalOrderId)

    if (txResult.error || !txResult.data) {
      console.error("P24 getTransaction error:", txResult.error)
      return Response.json({ status: "OCZEKUJE", error: txResult.error })
    }

    const p24Tx = txResult.data

    // Status P24: 0 - brak wpłaty, 1 - przedpłata (wymaga verify), 2 - wykonana, 3 - zwrócona
    if (p24Tx.status === 3) {
      // Zwrot trzeba odzwierciedlić w statusie zamówienia — inaczej strona sukcesu
      // zapętla się w "OCZEKUJE" mimo że środki wróciły do klienta
      const updated = await prisma.order.updateMany({
        where: { id: order.id, statusPlatnosci: { not: "ZWROT" } },
        data: { statusPlatnosci: "ZWROT" },
      })

      if (updated.count > 0) {
        const lawFirm = await prisma.lawFirm.findUnique({ where: { id: order.lawFirmId } })
        if (lawFirm) {
          const notification = await prisma.notification.create({
            data: {
              userId: lawFirm.userId,
              typ: "ZMIANA_STATUSU",
              tytul: "Płatność zwrócona",
              tresc: `Płatność za zamówienie ${order.orderNumber} została zwrócona.`,
              linkUrl: "/panel-eksperta/punkty",
            },
          })

          try {
            const { emitNewNotification } = await import("@/lib/socket")
            await emitNewNotification(lawFirm.userId, notification)
          } catch (e) {
            console.error("Socket emit error:", e)
          }
        }
      }

      return Response.json({ status: "ZWROT" })
    }

    if (p24Tx.status !== 1 && p24Tx.status !== 2) {
      return Response.json({ status: "OCZEKUJE" })
    }

    // Kwota wpłaty musi zgadzać się z kwotą zamówienia
    const expectedAmount = Math.round(order.kwota * 100)
    if (p24Tx.amount !== expectedAmount) {
      console.error(
        `P24 amount mismatch for order ${order.id}: expected ${expectedAmount}, got ${p24Tx.amount}`
      )
      return Response.json({ status: "OCZEKUJE", error: "Nieprawidłowa kwota transakcji" })
    }

    // Przedpłatę (status 1) trzeba potwierdzić przez transaction/verify — bez tego środki wrócą do klienta
    if (p24Tx.status === 1) {
      const verification = await p24Client.verifyTransaction({
        sessionId: order.externalOrderId,
        amount: p24Tx.amount,
        orderId: p24Tx.orderId,
      })

      if (!verification.success) {
        console.error("P24 check verification failed:", verification.error)
        return Response.json({ status: "OCZEKUJE", error: verification.error })
      }
    }

    // Zaktualizuj zamówienie i obsłuż typ
    const result = await prisma.$transaction(async (tx: any) => {
      // Warunkowy update chroni przed podwójnym doładowaniem (wyścig z notyfikacją P24)
      const updated = await tx.order.updateMany({
        where: { id: order.id, statusPlatnosci: { not: "ZAPLACONE" } },
        data: {
          statusPlatnosci: "ZAPLACONE",
          zaplaconoData: new Date(),
          transactionId: String(p24Tx.orderId),
        },
      })

      if (updated.count === 0) {
        return null
      }

      if (order.orderType === "POINTS") {
        const updatedFirm = await tx.lawFirm.update({
          where: { id: order.lawFirmId },
          data: { punktySaldo: { increment: order.liczbaPunktow || 0 } },
        })

        await tx.pointTransaction.create({
          data: {
            lawFirmId: order.lawFirmId,
            amount: order.liczbaPunktow || 0,
            balanceAfter: updatedFirm.punktySaldo,
            type: "POINTS_PURCHASE",
            description: `Zakup punktów (Zamówienie ${order.orderNumber})`,
          },
        })
      }

      if (order.orderType === "SUBSCRIPTION" && order.subscriptionPlan) {
        const now = new Date()
        let startDate = now
        const lawFirm = await tx.lawFirm.findUnique({ where: { id: order.lawFirmId } })
        if (lawFirm.dataPakietuDo && lawFirm.dataPakietuDo > now) {
          startDate = lawFirm.dataPakietuDo
        }

        const months = order.subscriptionPeriod || 12
        const endDate = new Date(startDate)
        endDate.setMonth(endDate.getMonth() + months)

        const updatedFirm = await tx.lawFirm.update({
          where: { id: order.lawFirmId },
          data: {
            pakietSubskrypcji: order.subscriptionPlan.typ,
            dataPakietuOd: startDate,
            dataPakietuDo: endDate,
            punktySaldo: { increment: order.subscriptionPlan.punktyGratis || 0 },
          },
        })

        if (order.subscriptionPlan.punktyGratis && order.subscriptionPlan.punktyGratis > 0) {
          await tx.pointTransaction.create({
            data: {
              lawFirmId: order.lawFirmId,
              amount: order.subscriptionPlan.punktyGratis,
              balanceAfter: updatedFirm.punktySaldo,
              type: "SUBSCRIPTION_BONUS",
              description: `Bonus punktów za pakiet ${order.subscriptionPlan.nazwa}`,
            },
          })
        }
      }

      const lawFirm = await tx.lawFirm.findUnique({ where: { id: order.lawFirmId } })

      const isSubscription = order.orderType === "SUBSCRIPTION"
      const notification = await tx.notification.create({
        data: {
          userId: lawFirm.userId,
          typ: "ZMIANA_STATUSU",
          tytul: "Płatność zakończona pomyślnie",
          tresc: isSubscription
            ? `Subskrypcja ${order.subscriptionPlan?.nazwa} została aktywowana.`
            : `Twoja płatność została przetworzona. Dodano ${order.liczbaPunktow || 0} punktów do konta.`,
          linkUrl: isSubscription ? "/panel-eksperta/pakiet" : "/panel-eksperta/punkty",
        },
      })

      return { lawFirm, notification }
    })

    // Notyfikacja P24 zdążyła przetworzyć zamówienie równolegle — status jest już ZAPLACONE
    if (!result) {
      return Response.json({ status: "ZAPLACONE" })
    }

    try {
      const { emitNewNotification } = await import("@/lib/socket")
      await emitNewNotification(result.lawFirm.userId, result.notification)
    } catch (e) {
      console.error("Socket emit error:", e)
    }

    try {
      if (!order.invoice) {
        await generateInvoiceForOrder(order.id)
      } else {
        await prisma.invoice.update({
          where: { id: order.invoice.id },
          data: { status: "PAID", paymentDate: new Date() },
        })
      }
    } catch (invoiceErr) {
      console.error("Error generating/updating invoice in P24 check:", invoiceErr)
    }

    return Response.json({ status: "ZAPLACONE" })
  } catch (error) {
    console.error("Error checking P24 payment status:", error)
    return Response.json({ error: "Błąd podczas sprawdzania statusu płatności" }, { status: 500 })
  }
}
