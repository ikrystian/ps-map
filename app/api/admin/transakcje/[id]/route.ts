import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateInvoiceForOrder } from "@/lib/invoice-generator"

// GET /api/admin/transakcje/[id] - Get single transaction (ADMIN only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
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
            nazwa: true,
            typ: true,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
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
      where: { id },
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
            nazwa: true,
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

    // If order was marked as paid, perform post-payment actions
    if (statusPlatnosci === "ZAPLACONE") {
      // If it's a points order, add points to law firm
      if (updatedOrder.orderType === "POINTS" && updatedOrder.liczbaPunktow) {
        await prisma.lawFirm.update({
          where: { id: updatedOrder.lawFirmId },
          data: {
            punktySaldo: {
              increment: updatedOrder.liczbaPunktow,
            },
          },
        })
      }

      // Generate invoice if it doesn't exist yet
      if (!updatedOrder.invoice) {
        await generateInvoiceForOrder(updatedOrder.id)
      } else {
        await prisma.invoice.update({
          where: { id: updatedOrder.invoice.id },
          data: {
            status: "PAID",
            paymentDate: new Date(),
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.order.delete({
      where: { id },
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
