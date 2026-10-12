import { auth } from "@/lib/auth"
import { generateInvoiceForOrder, resolveInvoiceBuyer } from "@/lib/invoice-generator"
import { creditPointsForOrder } from "@/lib/points-ledger"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

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
            nip: true,
            user: {
              select: {
                email: true,
                imie: true,
                nazwisko: true,
                adres: true,
                kodPocztowy: true,
                miasto: true,
                companyData: {
                  select: {
                    COMPANY_name: true,
                    COMPANY_nip: true,
                    COMPANY_residenceAddress: true,
                    COMPANY_workingAddress: true,
                  },
                },
              },
            },
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

    // Jeżeli ekspert ma uzupełnione dane firmy (Biała lista MF), do wyświetlenia
    // w panelu admina używamy tych danych zamiast surowych pól nazwa/nip z LawFirm.
    const buyer = resolveInvoiceBuyer(order.lawFirm)

    return NextResponse.json({ ...order, buyer })
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

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const before = await tx.order.findUnique({
        where: { id },
        select: { statusPlatnosci: true, zaplaconoData: true },
      })
      if (!before) return null

      const updated = await tx.order.update({
        where: { id },
        data: updateData,
        include: {
          lawFirm: {
            select: {
              id: true,
              nazwa: true,
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

      // Punkty z zamówienia uznajemy tylko raz: przy pierwszym przejściu na ZAPLACONE.
      // Ponowne zapisanie tego statusu (albo powrót z ZWROT/OCZEKUJE, gdy zamówienie
      // było już opłacone — `zaplaconoData` zostaje) nie może doliczyć punktów drugi raz.
      const firstPayment =
        statusPlatnosci === "ZAPLACONE" &&
        before.statusPlatnosci !== "ZAPLACONE" &&
        !before.zaplaconoData
      if (firstPayment && updated.orderType === "POINTS") {
        await creditPointsForOrder(tx, updated)
      }

      return updated
    })

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Nie znaleziono transakcji" },
        { status: 404 }
      )
    }

    // If order was marked as paid, perform post-payment actions
    if (statusPlatnosci === "ZAPLACONE") {
      // Generate invoice if it doesn't exist yet (skip for points)
      if (updatedOrder.metodaPlatnosci !== "POINTS") {
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
