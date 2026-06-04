import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendInvoiceToKsef } from "@/lib/ksef"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Niezalogowany" }, { status: 401 })
    }

    const { id } = await params

    // Fetch the invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        lawFirm: {
          select: {
            id: true,
            userId: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: "Faktura nie została znaleziona" }, { status: 404 })
    }

    // Authorization: User must be an ADMIN or the owner of the law firm associated with the invoice
    const isAdmin = session.user.role === "ADMIN"
    const isOwner = session.user.role === "LAW_FIRM" && invoice.lawFirm.userId === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 })
    }

    // Trigger KSeF transmission (forcing API call attempt or mock flow depending on configuration)
    const success = await sendInvoiceToKsef(id, false)

    // Fetch the updated invoice to return new status details
    const updatedInvoice = await prisma.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        ksefStatus: true,
        ksefNumber: true,
        ksefReferenceNumber: true,
        ksefDiagnostics: true
      }
    })

    return NextResponse.json({
      success,
      invoice: updatedInvoice
    })
  } catch (error: any) {
    console.error("Error retrying KSeF submission:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd serwera podczas wysyłania do KSeF" },
      { status: 500 }
    )
  }
}
