import { auth } from "@/lib/auth"
import { generateInvoicePdf, invoicePdfPath } from "@/lib/invoice-pdf"
import { prisma } from "@/lib/prisma"
import { existsSync } from "fs"
import { readFile } from "fs/promises"
import { NextRequest, NextResponse } from "next/server"

/**
 * Pobranie finalnego pliku PDF faktury (z numerem KSeF i kodem QR).
 *
 * Dokument istnieje dopiero po zaakceptowaniu faktury przez KSeF — wcześniej
 * endpoint zwraca 409 z informacją, że faktura oczekuje na rejestrację.
 * Plik jest serwowany wyłącznie właścicielowi kancelarii lub adminowi
 * (katalog .invoices nie jest dostępny publicznie).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Niezalogowany" }, { status: 401 })
    }

    const { id } = await params

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        invoiceNumber: true,
        ksefStatus: true,
        ksefNumber: true,
        lawFirm: {
          select: { userId: true },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Faktura nie została znaleziona" }, { status: 404 })
    }

    const isAdmin = session.user.role === "ADMIN"
    const isOwner = session.user.role === "LAW_FIRM" && invoice.lawFirm.userId === session.user.id
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 })
    }

    if (invoice.ksefStatus !== "ACCEPTED" || !invoice.ksefNumber) {
      return NextResponse.json(
        {
          error:
            "Faktura oczekuje na rejestrację w KSeF. Plik PDF będzie dostępny po nadaniu numeru KSeF.",
          ksefStatus: invoice.ksefStatus,
        },
        { status: 409 }
      )
    }

    // Plik generowany jest po akceptacji przez KSeF; jeśli go brak (np. restart
    // przed wygenerowaniem albo starsza faktura), generujemy na żądanie.
    let filePath = invoicePdfPath(invoice.invoiceNumber)
    if (!existsSync(filePath)) {
      filePath = await generateInvoicePdf(invoice.id)
    }

    const pdfBuffer = await readFile(filePath)
    const fileName = `Faktura-${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    console.error("Error serving invoice PDF:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas generowania pliku PDF" },
      { status: 500 }
    )
  }
}
