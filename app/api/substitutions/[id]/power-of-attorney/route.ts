import { getSubstitutionContext } from "@/lib/substitutions/access"
import { buildPowerOfAttorney } from "@/lib/substitutions/documents"
import { contentDisposition } from "@/lib/substitutions/files"
import { errorResponse } from "@/lib/substitutions/http"
import { SubstitutionError, loadOrder } from "@/lib/substitutions/workflow"
import type { SubstitutionStatus } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

const SUBSTITUTE_CAN_READ: SubstitutionStatus[] = ["PRZYDZIELONE", "POTWIERDZONE", "WYKONANE", "ZAMKNIETE"]

/**
 * GET /api/substitutions/[id]/power-of-attorney — wzór pełnomocnictwa substytucyjnego
 * (dla aplikanta: upoważnienia) z danymi zlecenia, do pobrania jako .doc.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getSubstitutionContext()
    if (!ctx.ok) return ctx.response
    const { id } = await params

    const order = await loadOrder(id)
    const allowed =
      order.zlecajacyId === ctx.firm.id ||
      (order.zastepcaId === ctx.firm.id && SUBSTITUTE_CAN_READ.includes(order.status))
    if (!allowed) throw new SubstitutionError(403, "Brak dostępu do tego dokumentu")

    const { filename, content } = buildPowerOfAttorney(order)
    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/msword; charset=utf-8",
        "Content-Disposition": contentDisposition(filename, false),
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    return errorResponse(error, "Błąd generowania wzoru pełnomocnictwa")
  }
}
