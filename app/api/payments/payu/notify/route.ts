import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { payuClient } from "@/lib/payu"

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text()
    const headers = request.headers

    // Verify signature
    if (!payuClient.verifyNotificationSignature(headers, bodyText)) {
      console.error("PayU Signature Verification Failed")
      return Response.json({ error: "Invalid signature" }, { status: 400 })
    }

    const body = JSON.parse(bodyText)
    const { order } = body

    if (!order) {
      return Response.json({ error: "Invalid body" }, { status: 400 })
    }

    const { extOrderId, status, orderId } = order

    // Find order
    const dbOrder = await prisma.order.findUnique({
      where: { id: extOrderId },
      include: {
        lawFirm: true,
        subscriptionPlan: true
      }
    })

    if (!dbOrder) {
      console.error("Order not found:", extOrderId)
      // Return 200 to stop PayU from retrying if order doesn't exist? 
      // Or 404? PayU expects 200 OK to acknowledge receipt.
      return Response.json({ message: "Order not found" }, { status: 200 })
    }

    if (status === 'COMPLETED' && dbOrder.statusPlatnosci !== 'ZAPLACONE') {
      // Update Order and LawFirm
      await prisma.$transaction(async (tx) => {
        // Update Order
        await tx.order.update({
          where: { id: dbOrder.id },
          data: {
            statusPlatnosci: 'ZAPLACONE',
            zaplaconoData: new Date(),
            transactionId: orderId // Ensure transaction ID is set
          }
        })

        // Handle Points
        if (dbOrder.orderType === 'POINTS') {
          await tx.lawFirm.update({
            where: { id: dbOrder.lawFirmId },
            data: {
              punktySaldo: {
                increment: dbOrder.liczbaPunktow || 0
              }
            }
          })
        }

        // Handle Subscription
        if (dbOrder.orderType === 'SUBSCRIPTION' && dbOrder.subscriptionPlan) {
          const now = new Date()
          // If already has active subscription, extend it? 
          // Or overwrite? Usually extend if same type, or overwrite if upgrade.
          // For simplicity, let's assume start from now or extend if future.

          let startDate = now
          if (dbOrder.lawFirm.dataPakietuDo && dbOrder.lawFirm.dataPakietuDo > now) {
            startDate = dbOrder.lawFirm.dataPakietuDo
          }

          const months = dbOrder.subscriptionPeriod || 12
          const endDate = new Date(startDate)
          endDate.setMonth(endDate.getMonth() + months)

          await tx.lawFirm.update({
            where: { id: dbOrder.lawFirmId },
            data: {
              pakietSubskrypcji: dbOrder.subscriptionPlan.typ,
              dataPakietuOd: startDate,
              dataPakietuDo: endDate,
              // Add bonus points from subscription if any
              punktySaldo: {
                increment: dbOrder.subscriptionPlan.punktyGratis || 0
              }
            }
          })
        }

        // Create Notification
        const notification = await tx.notification.create({
          data: {
            userId: dbOrder.lawFirm.userId,
            typ: "ZMIANA_STATUSU",
            tytul: "Płatność zakończona pomyślnie",
            tresc: dbOrder.orderType === 'POINTS'
              ? `Zakup punktów zakończony sukcesem. Dodano ${dbOrder.liczbaPunktow} pkt.`
              : `Subskrypcja ${dbOrder.subscriptionPlan?.nazwa} została aktywowana.`,
            linkUrl: dbOrder.orderType === 'POINTS' ? "/panel-kancelarii/punkty" : "/panel-kancelarii/pakiet"
          }
        })

        // Try to emit socket event (fire and forget inside transaction might be tricky if socket lib fails, but we catch error outside)
        // We can return notification to emit outside transaction if needed, but here we just want to ensure DB consistency.
      })

      // Emit socket event (outside transaction to avoid blocking)
      try {
        const { emitNewNotification } = await import("@/lib/socket")
        await emitNewNotification(dbOrder.lawFirm.userId, {
          typ: "ZMIANA_STATUSU",
          tytul: "Płatność zakończona pomyślnie",
          tresc: "Płatność została zaksięgowana."
        } as any)
      } catch (e) {
        console.error("Socket emit error:", e)
      }
    } else if (status === 'CANCELED') {
      await prisma.order.update({
        where: { id: dbOrder.id },
        data: {
          statusPlatnosci: 'ANULOWANE'
        }
      })
    }

    return Response.json({ status: "OK" })

  } catch (error) {
    console.error("PayU Notify Error:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
