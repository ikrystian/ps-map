import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

/**
 * Jedna seria numeracji faktur: FV/RRRR/MM/NNNNN (licznik w miesiącu).
 * Numer = największy istniejący w danym miesiącu + 1 (nie `count()`, który
 * dublował numery po usunięciu faktury); kolizję z równoległym żądaniem
 * łapie unikalny indeks, a zapis jest wtedy ponawiany.
 */
async function nextInvoiceNumber(now: Date): Promise<string> {
  const prefix = `FV/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/`
  const last = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  })
  const lastSeq = last ? parseInt(last.invoiceNumber.slice(prefix.length), 10) || 0 : 0
  return `${prefix}${String(lastSeq + 1).padStart(5, "0")}`
}

export async function createInvoiceWithNumber(
  data: Omit<Prisma.InvoiceUncheckedCreateInput, "invoiceNumber">,
  now: Date = new Date()
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.invoice.create({
        data: { ...data, invoiceNumber: await nextInvoiceNumber(now) },
      })
    } catch (error: any) {
      if (error?.code !== "P2002" || !String(error?.meta?.target ?? "").includes("invoiceNumber")) {
        throw error
      }
    }
  }
  throw new Error("Nie udało się nadać unikalnego numeru faktury")
}
