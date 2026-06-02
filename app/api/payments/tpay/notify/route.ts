import { generateInvoiceForOrder } from "@/lib/invoice-generator"
import { prisma } from "@/lib/prisma"
import { tpayClient } from "@/lib/tpay"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text()
    const headers = request.headers

    console.log("Tpay notification body:", bodyText)

    // Verify signature
    const isValid = await tpayClient.verifyNotificationSignature(headers, bodyText)
    if (!isValid) {
      console.error("Tpay signature verification failed")
      return new Response("FALSE invalid signature", { status: 400 })
    }

    const body = JSON.parse(bodyText)
    const { tr_id, tr_status } = body

    // Find order by transactionId or externalOrderId matching tr_id
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { transactionId: tr_id },
          { externalOrderId: tr_id }
        ]
      },
      include: {
        invoice: true,
      },
    })

    if (!order) {
      console.error("Order not found for Tpay tr_id:", tr_id)
      return new Response("FALSE order not found", { status: 200 })
    }

    // If already paid, return TRUE
    if (order.statusPlatnosci === "ZAPLACONE") {
      return new Response("TRUE", { status: 200 })
    }

    // Process only if payment status from Tpay is success (tr_status === "TRUE")
    if (tr_status === "TRUE") {
      // Find order with subscription plan data
      const orderWithPlan = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          subscriptionPlan: true,
          lawFirm: true,
        },
      })

      // Run transactional updates
      const result = await prisma.$transaction(async (tx: any) => {
        // Update Order
        await tx.order.update({
          where: { id: order.id },
          data: {
            statusPlatnosci: "ZAPLACONE",
            zaplaconoData: new Date(),
          },
        })

        // Handle Points
        if (orderWithPlan?.orderType === "POINTS") {
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
        if (orderWithPlan?.orderType === "SUBSCRIPTION" && orderWithPlan.subscriptionPlan) {
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

        // Get updated law firm
        const lawFirm = await tx.lawFirm.findUnique({
          where: { id: order.lawFirmId },
        })

        // Create notification
        const isSubscription = orderWithPlan?.orderType === "SUBSCRIPTION"
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

      // Emit socket notification
      try {
        const { emitNewNotification } = await import("@/lib/socket")
        await emitNewNotification(
          result.lawFirm.userId,
          result.notification
        )
      } catch (socketErr) {
        console.error("Socket emit error in Tpay notify:", socketErr)
      }

      // Generate invoice
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
        console.error("Error generating/updating invoice in Tpay notify:", invoiceErr)
      }

      console.log("Tpay payment verified and order updated:", order.id)
    }

    return new Response("TRUE", { status: 200 })
  } catch (error) {
    console.error("Error processing Tpay notification:", error)
    return new Response("FALSE error", { status: 500 })
  }
}
