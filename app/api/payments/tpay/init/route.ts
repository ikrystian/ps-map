import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { tpayClient } from "@/lib/tpay"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return Response.json(
        { error: "Brak ID zamówienia" },
        { status: 400 }
      )
    }

    // Pobierz zamówienie
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        lawFirm: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!order) {
      return Response.json(
        { error: "Nie znaleziono zamówienia" },
        { status: 404 }
      )
    }

    // Sprawdź czy zamówienie należy do zalogowanego użytkownika
    if (order.lawFirm.userId !== session.user.id) {
      return Response.json(
        { error: "Brak dostępu do zamówienia" },
        { status: 403 }
      )
    }

    // Sprawdź czy zamówienie nie zostało już opłacone
    if (order.statusPlatnosci === "ZAPLACONE") {
      return Response.json(
        { error: "Zamówienie zostało już opłacone" },
        { status: 400 }
      )
    }

    // Przygotuj dane dla Tpay
    const description = order.orderType === "POINTS"
      ? `Zakup punktów: ${order.pakietPunktow} (${order.liczbaPunktow} pkt)`
      : `Aktywacja subskrypcji pakietu`

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const urlReturn = `${baseUrl}/panel-eksperta/checkout/success?orderId=${order.id}`
    const urlError = `${baseUrl}/panel-eksperta/checkout/failure?orderId=${order.id}`
    const urlStatus = `${baseUrl}/api/payments/tpay/notify`

    // Check if Tpay credentials are placeholders or missing (mock simulation mode)
    const isMockMode = !process.env.TPAY_CLIENT_ID ||
      process.env.TPAY_CLIENT_ID === "your-tpay-client-id" ||
      !process.env.TPAY_CLIENT_SECRET ||
      process.env.TPAY_CLIENT_SECRET === "your-tpay-client-secret"

    if (isMockMode) {
      console.warn("Tpay placeholder credentials detected. Simulating payment success.")

      // Update order status to paid (simulate payment webhook immediately for local testing)
      await prisma.$transaction(async (tx: any) => {
        await tx.order.update({
          where: { id: orderId },
          data: {
            statusPlatnosci: "ZAPLACONE",
            zaplaconoData: new Date(),
            externalOrderId: `MOCK-TPAY-${Date.now()}`,
            transactionId: `MOCK-TPAY-${Date.now()}`,
          },
        })

        // Handle Points
        if (order.orderType === "POINTS") {
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
              description: `Zakup punktów (Zamówienie ${order.orderNumber}) [Symulacja Tpay]`
            }
          })
        }

        // Handle Subscription
        if (order.orderType === "SUBSCRIPTION") {
          // Find subscription details
          const orderWithPlan = await tx.order.findUnique({
            where: { id: order.id },
            include: {
              subscriptionPlan: true,
              lawFirm: true,
            },
          })

          if (orderWithPlan?.subscriptionPlan) {
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
                  description: `Bonus punktów za pakiet ${orderWithPlan.subscriptionPlan.nazwa} [Symulacja Tpay]`
                }
              })
            }
          }
        }
      })

      // Generate invoice
      try {
        const { generateInvoiceForOrder } = await import("@/lib/invoice-generator")
        await generateInvoiceForOrder(order.id)
      } catch (invoiceErr) {
        console.error("Error generating invoice in simulated Tpay checkout:", invoiceErr)
      }

      return Response.json({
        success: true,
        redirectUrl: `${baseUrl}/panel-eksperta/checkout/success?orderId=${order.id}&mock=true`,
      })
    }

    // Utwórz transakcję w Tpay
    const result = await tpayClient.createTransaction({
      amount: order.kwota,
      description,
      payer: {
        email: order.lawFirm.user.email || "",
        name: order.lawFirm.nazwa || "Ekspert",
      },
      callbacks: {
        notification: {
          url: urlStatus,
        },
        payerUrls: {
          success: urlReturn,
          error: urlError,
        },
      },
    })

    if (!result.transactionPaymentUrl || !result.transactionId) {
      console.error("Tpay registration failed:", result)
      return Response.json(
        { error: result.error || "Nie udało się zainicjować płatności Tpay" },
        { status: 500 }
      )
    }

    // Zaktualizuj zamówienie
    await prisma.order.update({
      where: { id: orderId },
      data: {
        externalOrderId: result.transactionId,
        transactionId: result.transactionId,
      },
    })

    return Response.json({
      success: true,
      redirectUrl: result.transactionPaymentUrl,
      transactionId: result.transactionId,
    })
  } catch (error) {
    console.error("Error initializing Tpay payment:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Błąd podczas inicjalizacji płatności" },
      { status: 500 }
    )
  }
}
