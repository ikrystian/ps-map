import { generateInvoiceForOrder } from "@/lib/invoice-generator"
import { prisma } from "@/lib/prisma"
import { p24Client } from "@/lib/przelewy24"

// P24 nie ma osobnego kodu statusu dla "odrzucona" — w polu `status` zwracanym
// przez transaction/by/sessionId zarówno "płatność wciąż w toku", jak i
// "płatność nigdy nie doszła do skutku" wyglądają identycznie (status 0).
// Jedyny sygnał, jaki mamy, to czas: jeśli zamówienie czeka dłużej niż ten próg,
// uznajemy płatność za odrzuconą. Próg musi być na tyle duży, by nie anulować
// zamówień opłacanych wolnymi kanałami (np. tradycyjny przelew bankowy,
// który potrafi się księgować kilka dni roboczych).
export const P24_PENDING_EXPIRY_HOURS = 72

export type P24ResolutionStatus = "ZAPLACONE" | "OCZEKUJE" | "ZWROT" | "ANULOWANE"

interface ResolvableOrder {
  id: string
  lawFirmId: string
  externalOrderId: string | null
  statusPlatnosci: string
  kwota: number
  liczbaPunktow: number | null
  orderType: string
  orderNumber: string | null
  subscriptionPeriod: number | null
  createdAt: Date
  invoice: { id: string } | null
  subscriptionPlan: {
    typ: string
    punktyGratis: number | null
    nazwa: string
  } | null
}

async function notifyStatusChange(params: {
  lawFirmId: string
  tytul: string
  tresc: string
  linkUrl: string
}) {
  const lawFirm = await prisma.lawFirm.findUnique({ where: { id: params.lawFirmId } })
  if (!lawFirm) return

  const notification = await prisma.notification.create({
    data: {
      userId: lawFirm.userId,
      typ: "ZMIANA_STATUSU",
      tytul: params.tytul,
      tresc: params.tresc,
      linkUrl: params.linkUrl,
    },
  })

  try {
    const { emitNewNotification } = await import("@/lib/socket")
    await emitNewNotification(lawFirm.userId, notification)
  } catch (e) {
    console.error("Socket emit error:", e)
  }
}

async function markAsRefunded(order: ResolvableOrder) {
  const updated = await prisma.order.updateMany({
    where: { id: order.id, statusPlatnosci: { not: "ZWROT" } },
    data: { statusPlatnosci: "ZWROT" },
  })

  if (updated.count > 0) {
    await notifyStatusChange({
      lawFirmId: order.lawFirmId,
      tytul: "Płatność zwrócona",
      tresc: `Płatność za zamówienie ${order.orderNumber} została zwrócona.`,
      linkUrl: "/panel-eksperta/punkty",
    })
  }
}

async function markAsCanceled(order: ResolvableOrder) {
  const updated = await prisma.order.updateMany({
    where: {
      id: order.id,
      statusPlatnosci: { notIn: ["ZAPLACONE", "ZWROT", "ANULOWANE"] },
    },
    data: { statusPlatnosci: "ANULOWANE" },
  })

  if (updated.count > 0) {
    await notifyStatusChange({
      lawFirmId: order.lawFirmId,
      tytul: "Płatność odrzucona",
      tresc: `Płatność za zamówienie ${order.orderNumber} nie została zaksięgowana w wyznaczonym czasie i zamówienie zostało anulowane. Możesz spróbować dokonać zakupu ponownie.`,
      linkUrl: "/panel-eksperta/punkty",
    })
  }
}

async function markAsPaid(order: ResolvableOrder, transactionId: string) {
  const result = await prisma.$transaction(async (tx: any) => {
    // Warunkowy update chroni przed podwójnym doładowaniem (wyścig z notyfikacją P24)
    const updated = await tx.order.updateMany({
      where: { id: order.id, statusPlatnosci: { not: "ZAPLACONE" } },
      data: {
        statusPlatnosci: "ZAPLACONE",
        zaplaconoData: new Date(),
        transactionId,
      },
    })

    if (updated.count === 0) return null

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

  if (!result) return

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
    console.error("Error generating/updating invoice in P24 resolution:", invoiceErr)
  }
}

/**
 * Rozstrzyga bieżący status zamówienia opłacanego przez Przelewy24 na podstawie
 * stanu transakcji po stronie P24. Używane zarówno przy powrocie klienta na stronę
 * sukcesu (weryfikacja "na żądanie"), jak i w zadaniu CRON porządkującym porzucone
 * płatności — dzięki temu logika księgowania punktów/subskrypcji i próg przedawnienia
 * nie mogą się rozjechać między tymi dwoma ścieżkami.
 */
export async function resolveP24Order(
  order: ResolvableOrder
): Promise<{ status: P24ResolutionStatus; error?: string }> {
  if (order.statusPlatnosci === "ZAPLACONE") return { status: "ZAPLACONE" }
  if (order.statusPlatnosci === "ZWROT") return { status: "ZWROT" }
  if (order.statusPlatnosci === "ANULOWANE") return { status: "ANULOWANE" }

  if (!order.externalOrderId) {
    return { status: "OCZEKUJE", error: "Brak sessionId" }
  }

  const hoursSinceCreated = (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60)
  const isExpired = hoursSinceCreated >= P24_PENDING_EXPIRY_HOURS

  // Pobierz status transakcji z P24
  const txResult = await p24Client.getTransactionBySessionId(order.externalOrderId)

  if (txResult.error || !txResult.data) {
    console.error("P24 getTransaction error:", txResult.error)
    if (isExpired) {
      await markAsCanceled(order)
      return { status: "ANULOWANE" }
    }
    return { status: "OCZEKUJE", error: txResult.error }
  }

  const p24Tx = txResult.data

  // Status P24: 0 - brak wpłaty, 1 - przedpłata (wymaga verify), 2 - wykonana, 3 - zwrócona
  if (p24Tx.status === 3) {
    await markAsRefunded(order)
    return { status: "ZWROT" }
  }

  if (p24Tx.status !== 1 && p24Tx.status !== 2) {
    if (isExpired) {
      await markAsCanceled(order)
      return { status: "ANULOWANE" }
    }
    return { status: "OCZEKUJE" }
  }

  // Kwota wpłaty musi zgadzać się z kwotą zamówienia
  const expectedAmount = Math.round(order.kwota * 100)
  if (p24Tx.amount !== expectedAmount) {
    console.error(
      `P24 amount mismatch for order ${order.id}: expected ${expectedAmount}, got ${p24Tx.amount}`
    )
    return { status: "OCZEKUJE", error: "Nieprawidłowa kwota transakcji" }
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
      return { status: "OCZEKUJE", error: verification.error }
    }
  }

  await markAsPaid(order, String(p24Tx.orderId))
  return { status: "ZAPLACONE" }
}
