import { getSubstitutionContext } from "@/lib/substitutions/access"
import { errorResponse, readJson, scheduleTasks } from "@/lib/substitutions/http"
import { publishOrder } from "@/lib/substitutions/workflow"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/substitutions/[id]/publish — publikacja szkicu: na giełdę (mail do
 * pasujących prawników) albo jako zapytanie do konkretnej osoby (13 h na odpowiedź).
 * „Pilne” pobiera punkty w tej samej transakcji co nadanie numeru.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getSubstitutionContext()
    if (!ctx.ok) return ctx.response
    const { id } = await params

    const body = (await readJson(request)) as { oswiadczenie?: boolean }
    const result = await publishOrder(ctx, id, body)
    scheduleTasks(result.tasks)

    const order = result.order!
    return NextResponse.json({
      message: result.message,
      id: order.id,
      numer: order.numer,
      status: order.status,
      pilne: order.pilne,
      ofertyDo: order.ofertyDo?.toISOString() ?? null,
      zapytanieWazneDo: order.zapytanieWazneDo?.toISOString() ?? null,
    })
  } catch (error) {
    return errorResponse(error, "Błąd publikacji zlecenia")
  }
}
