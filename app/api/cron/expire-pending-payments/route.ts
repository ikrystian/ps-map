import { verifyCronAuth } from "@/lib/cron-auth"
import { prisma } from "@/lib/prisma"
import { P24_PENDING_EXPIRY_HOURS, resolveP24Order } from "@/lib/przelewy24-resolve"
import { NextRequest, NextResponse } from "next/server"

// Porządkuje zamówienia P24, na które klient nigdy nie wrócił na stronę sukcesu
// (więc nikt nie wywołał /api/payments/przelewy24/check). Bez tego zadania takie
// zamówienia zostałyby w statusie OCZEKUJE na zawsze.
export async function GET(req: NextRequest) {
  const unauthorized = verifyCronAuth(req)
  if (unauthorized) return unauthorized

  try {
    const expiryThreshold = new Date(Date.now() - P24_PENDING_EXPIRY_HOURS * 60 * 60 * 1000)

    const staleOrders = await prisma.order.findMany({
      where: {
        metodaPlatnosci: "PRZELEWY24",
        statusPlatnosci: "OCZEKUJE",
        externalOrderId: { not: null },
        createdAt: { lt: expiryThreshold },
      },
      include: { invoice: true, subscriptionPlan: true },
    })

    let resolvedCount = 0
    for (const order of staleOrders) {
      try {
        const result = await resolveP24Order(order)
        if (result.status !== "OCZEKUJE") {
          resolvedCount++
        }
      } catch (err) {
        console.error(`Error resolving stale P24 order ${order.id}:`, err)
      }
    }

    return NextResponse.json({
      message: `Sprawdzono ${staleOrders.length} przeterminowanych zamówień P24, rozstrzygnięto ${resolvedCount}.`,
    })
  } catch (error) {
    console.error("Error in expire-pending-payments cron:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
