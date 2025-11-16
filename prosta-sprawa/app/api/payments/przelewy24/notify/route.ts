import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { p24Client } from "@/lib/przelewy24"

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

    // Zaktualizuj status zamówienia i dodaj punkty
    const result = await prisma.$transaction(async (tx) => {
      // Zaktualizuj zamówienie
      await tx.order.update({
        where: { id: order.id },
        data: {
          statusPlatnosci: "ZAPLACONE",
          zaplaconoData: new Date(),
        },
      })

      // Dodaj punkty do kancelarii
      const lawFirm = await tx.lawFirm.update({
        where: { id: order.lawFirmId },
        data: {
          punktySaldo: {
            increment: order.liczbaPunktow || 0,
          },
        },
      })

      // Utwórz powiadomienie o zmianie statusu płatności
      const notification = await tx.notification.create({
        data: {
          userId: lawFirm.userId,
          typ: "ZMIANA_STATUSU",
          tytul: "Płatność zakończona pomyślnie",
          tresc: `Twoja płatność została przetworzona. Dodano ${order.liczbaPunktow || 0} punktów do konta.`,
          linkUrl: "/panel-kancelarii/punkty",
        },
      })

      // Emit real-time notification via Socket.IO (after transaction)
      return { lawFirm, notification }
    })

    // Emit notification via Socket.IO
    const { emitNewNotification } = await import("@/lib/socket")
    await emitNewNotification(
      result.lawFirm.userId,
      result.notification
    )

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
