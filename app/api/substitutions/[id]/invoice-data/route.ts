import { getSubstitutionContext } from "@/lib/substitutions/access"
import { errorResponse } from "@/lib/substitutions/http"
import { invoiceData } from "@/lib/substitutions/service"
import { SubstitutionError, loadOrder } from "@/lib/substitutions/workflow"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/substitutions/[id]/invoice-data — dane drugiej strony zamkniętego
 * zlecenia do faktury (nazwa kancelarii, NIP, adres). Rozliczenie idzie poza platformą.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getSubstitutionContext()
    if (!ctx.ok) return ctx.response
    const { id } = await params

    const order = await loadOrder(id)
    if (order.status !== "ZAMKNIETE") throw new SubstitutionError(409, "Dane do faktury są dostępne po zamknięciu zlecenia")

    if (order.zastepcaId === ctx.firm.id) {
      return NextResponse.json({ rola: "zlecajacy", dane: invoiceData(order.zlecajacy) })
    }
    if (order.zlecajacyId === ctx.firm.id && order.zastepca) {
      return NextResponse.json({ rola: "zastepca", dane: invoiceData(order.zastepca) })
    }
    throw new SubstitutionError(403, "Brak dostępu do danych tego zlecenia")
  } catch (error) {
    return errorResponse(error, "Błąd pobierania danych do faktury")
  }
}
