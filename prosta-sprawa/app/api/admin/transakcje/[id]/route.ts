import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/transakcje/[id] - Get single transaction (ADMIN only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        lawFirm: {
          select: {
            id: true,
            nazwa: true,
            nazwaFirmy: true,
            emailKontakt: true,
            nip: true,
          },
        },
        subscriptionPlan: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        invoice: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Nie znaleziono transakcji" },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: "Błąd podczas pobierania transakcji" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/transakcje/[id] - Update transaction (ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { statusPlatnosci, metodaPlatnosci, kwota, transactionId, externalOrderId } = body

    // Prepare update data
    const updateData: any = {}

    if (statusPlatnosci) {
      updateData.statusPlatnosci = statusPlatnosci

      // If status changed to ZAPLACONE, set the payment date
      if (statusPlatnosci === "ZAPLACONE") {
        updateData.zaplaconoData = new Date()
      }
    }

    if (metodaPlatnosci) {
      updateData.metodaPlatnosci = metodaPlatnosci
    }

    if (kwota !== undefined) {
      updateData.kwota = parseFloat(kwota)
    }

    if (transactionId !== undefined) {
      updateData.transactionId = transactionId
    }

    if (externalOrderId !== undefined) {
      updateData.externalOrderId = externalOrderId
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        lawFirm: {
          select: {
            id: true,
            nazwa: true,
            nazwaFirmy: true,
            emailKontakt: true,
          },
        },
        subscriptionPlan: {
          select: {
            id: true,
            name: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
          },
        },
      },
    })

    // If order was marked as paid and it's a points order, add points to law firm
    if (statusPlatnosci === "ZAPLACONE" && updatedOrder.orderType === "POINTS" && updatedOrder.liczbaPunktow) {
      const lawFirm = await prisma.lawFirm.findUnique({
        where: { id: updatedOrder.lawFirmId },
      })

      if (lawFirm) {
        await prisma.lawFirm.update({
          where: { id: updatedOrder.lawFirmId },
          data: {
            punkty: (lawFirm.punkty || 0) + updatedOrder.liczbaPunktow,
          },
        })
      }
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { error: "Błąd podczas aktualizacji transakcji" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/transakcje/[id] - Delete transaction (ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.order.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Transakcja została usunięta" })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json(
      { error: "Błąd podczas usuwania transakcji" },
      { status: 500 }
    )
  }
}
