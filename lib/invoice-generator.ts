import { prisma } from "@/lib/prisma"
import { sendInvoiceToKsef } from "@/lib/ksef"

/**
 * Generates an invoice for a paid order
 * @param orderId - The ID of the order to generate invoice for
 * @returns The created invoice or null if order not found/already has invoice
 */
export async function generateInvoiceForOrder(orderId: string) {
  try {
    // Get the order with related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        invoice: true,
        lawFirm: {
          select: {
            nazwa: true,
            nazwaFirmy: true,
            nip: true,
            adres: true,
            kodPocztowy: true,
            miasto: true,
          },
        },
      },
    })

    if (!order) {
      console.error(`Order ${orderId} not found`)
      return null
    }

    // Point transactions do not need invoice generation
    if (order.metodaPlatnosci === "POINTS") {
      console.log(`Order ${orderId} is paid with points. Invoice generation skipped.`)
      return null
    }

    // Check if order is paid
    if (order.statusPlatnosci !== "ZAPLACONE") {
      console.error(`Order ${orderId} is not paid yet`)
      return null
    }

    // Check if invoice already exists
    if (order.invoice) {
      console.log(`Invoice already exists for order ${orderId}`)
      return order.invoice
    }

    if (!order.lawFirm) {
      console.error(`Law firm not found for order ${orderId}`)
      return null
    }

    // Generate invoice number (format: FV/YYYY/MM/XXXXX)
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')

    // Get the count of invoices in this month
    const startOfMonth = new Date(year, now.getMonth(), 1)
    const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59)

    const invoiceCount = await prisma.invoice.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    })

    const invoiceNumber = `FV/${year}/${month}/${String(invoiceCount + 1).padStart(5, '0')}`

    // Calculate amounts (prices already include VAT 23%)
    const grossAmount = order.kwota
    const vatRate = 23.0
    const netAmount = grossAmount / (1 + vatRate / 100)
    const vatAmount = grossAmount - netAmount

    // Create the invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        lawFirmId: order.lawFirmId,
        buyerName: order.lawFirm.nazwaFirmyFirmy || order.lawFirm.nazwaFirmy || '',
        buyerNIP: order.lawFirm.nip || undefined,
        buyerAddress: order.lawFirm.adres || '',
        buyerPostalCode: order.lawFirm.kodPocztowy || '',
        buyerCity: order.lawFirm.miasto || '',
        buyerCountry: 'Polska',
        netAmount,
        vatRate,
        vatAmount,
        grossAmount,
        status: 'PAID',
        issueDate: now,
        saleDate: now,
        paymentDate: order.zaplaconoData || now,
        dueDate: order.zaplaconoData || now, // Already paid
      },
    })

    console.log(`Invoice ${invoiceNumber} generated for order ${orderId}`)

    // Send the invoice to KSeF 2.0 in the background
    sendInvoiceToKsef(invoice.id).catch((err) => {
      console.error(`Failed to send invoice ${invoice.id} to KSeF:`, err)
    })

    return invoice
  } catch (error) {
    console.error(`Error generating invoice for order ${orderId}:`, error)
    return null
  }
}

/**
 * Marks an order as paid and generates an invoice
 * @param orderId - The ID of the order to mark as paid
 * @param transactionId - Optional external transaction ID
 * @returns The updated order with invoice
 */
export async function markOrderAsPaidAndGenerateInvoice(
  orderId: string,
  transactionId?: string
) {
  try {
    // Update order status to ZAPLACONE
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        statusPlatnosci: "ZAPLACONE",
        zaplaconoData: new Date(),
        ...(transactionId && { transactionId }),
      },
      include: {
        invoice: true,
      },
    })

    // If it's a points order, add points to law firm
    if (order.orderType === "POINTS" && order.liczbaPunktow) {
      await prisma.lawFirm.update({
        where: { id: order.lawFirmId },
        data: {
          punktySaldo: {
            increment: order.liczbaPunktow,
          },
        },
      })
    }

    // Generate invoice if it doesn't exist
    if (!order.invoice) {
      await generateInvoiceForOrder(orderId)
    } else {
      await prisma.invoice.update({
        where: { id: order.invoice.id },
        data: {
          status: "PAID",
          paymentDate: new Date(),
        },
      })
    }

    return order
  } catch (error) {
    console.error(`Error marking order ${orderId} as paid:`, error)
    throw error
  }
}
