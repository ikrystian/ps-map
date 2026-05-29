import { generateInvoiceForOrder } from "@/lib/invoice-generator"
import { prisma } from "@/lib/prisma"
import { p24Client } from "@/lib/przelewy24"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("P24 notification received:", body)

    const {
      merchantId,
      posId,
      sessionId,
      amount,
      originAmount,
      currency,
      orderId,
      methodId,
      statement,
      sign,
    } = body

    // Znajdź zamówienie po sessionId
    const order = await prisma.order.findFirst({
      where: {
        externalOrderId: sessionId,
      },
      include: {
        invoice: true,
      },
    })

    if (!order) {
      console.error("Order not found for sessionId:", sessionId)
      return Response.json(
        { error: "Nie znaleziono zamówienia" },
        { status: 404 }
      )
    }

    // Weryfikuj transakcję z Przelewy24
    const verification = await p24Client.verifyTransaction({
      sessionId,
      amount,
      orderId,
    })

    if (!verification.success) {
      console.error("P24 verification failed:", verification.error)
      return Response.json(
        { error: "Weryfikacja transakcji nie powiodła się" },
        { status: 400 }
      )
    }

    // Find order with subscription plan data
    const orderWithPlan = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        subscriptionPlan: true,
        lawFirm: true,
      },
    })

    // Zaktualizuj status zamówienia i obsłuż typ zamówienia
    const result = await prisma.$transaction(async (tx: any) => {
      // Zaktualizuj zamówienie
      await tx.order.update({
        where: { id: order.id },
        data: {
          statusPlatnosci: "ZAPLACONE",
          zaplaconoData: new Date(),
          transactionId: String(orderId),
        },
      })

      // Handle Points
      if (orderWithPlan?.orderType === 'POINTS') {
        const updatedFirm = await tx.lawFirm.update({
          where: { id: order.lawFirmId },
          data: {
            punktySaldo: {
              increment: order.liczbaPunktow || 0,
            },
          },
        })

        await tx.pointTransaction.create({
          data: {
            lawFirmId: order.lawFirmId,
            amount: order.liczbaPunktow || 0,
            balanceAfter: updatedFirm.punktySaldo,
            type: "POINTS_PURCHASE",
            description: `Zakup punktów (Zamówienie ${order.orderNumber})`
          }
        })
      }

      // Handle Subscription
      if (orderWithPlan?.orderType === 'SUBSCRIPTION' && orderWithPlan.subscriptionPlan) {
        const now = new Date()
        let startDate = now
        if (orderWithPlan.lawFirm.dataPakietuDo && orderWithPlan.lawFirm.dataPakietuDo > now) {
          startDate = orderWithPlan.lawFirm.dataPakietuDo
        }

        const months = orderWithPlan.subscriptionPeriod || 12
        const endDate = new Date(startDate)
        endDate.setMonth(endDate.getMonth() + months)

        const updatedFirm = await tx.lawFirm.update({
          where: { id: order.lawFirmId },
          data: {
            pakietSubskrypcji: orderWithPlan.subscriptionPlan.typ,
            dataPakietuOd: startDate,
            dataPakietuDo: endDate,
            punktySaldo: {
              increment: orderWithPlan.subscriptionPlan.punktyGratis || 0,
            },
          },
        })

        if (orderWithPlan.subscriptionPlan.punktyGratis && orderWithPlan.subscriptionPlan.punktyGratis > 0) {
          await tx.pointTransaction.create({
            data: {
              lawFirmId: order.lawFirmId,
              amount: orderWithPlan.subscriptionPlan.punktyGratis,
              balanceAfter: updatedFirm.punktySaldo,
              type: "SUBSCRIPTION_BONUS",
              description: `Bonus punktów za pakiet ${orderWithPlan.subscriptionPlan.nazwa}`
            }
          })
        }
      }

      // Pobierz zaktualizowaną kancelarię
      const lawFirm = await tx.lawFirm.findUnique({
        where: { id: order.lawFirmId },
      })

      // Utwórz powiadomienie o zmianie statusu płatności
      const isSubscription = orderWithPlan?.orderType === 'SUBSCRIPTION'
      const notification = await tx.notification.create({
        data: {
          userId: lawFirm.userId,
          typ: "ZMIANA_STATUSU",
          tytul: "Płatność zakończona pomyślnie",
          tresc: isSubscription
            ? `Subskrypcja ${orderWithPlan?.subscriptionPlan?.nazwa} została aktywowana.`
            : `Twoja płatność została przetworzona. Dodano ${order.liczbaPunktow || 0} punktów do konta.`,
          linkUrl: isSubscription ? "/panel-eksperta/pakiet" : "/panel-eksperta/punkty",
        },
      })

      return { lawFirm, notification }
    })

    // Emit notification via Socket.IO
    const { emitNewNotification } = await import("@/lib/socket")
    await emitNewNotification(
      result.lawFirm.userId,
      result.notification
    )

    // Generate or update invoice
    try {
      if (!order.invoice) {
        await generateInvoiceForOrder(order.id)
      } else {
        await prisma.invoice.update({
          where: { id: order.invoice.id },
          data: {
            status: "PAID",
            paymentDate: new Date(),
          },
        })
      }
    } catch (invoiceErr) {
      console.error("Error generating/updating invoice in P24 notify:", invoiceErr)
    }

    console.log("Payment verified and order updated:", order.id)

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error processing P24 notification:", error)
    return Response.json(
      { error: "Błąd podczas przetwarzania notyfikacji" },
      { status: 500 }
    )
  }
}
