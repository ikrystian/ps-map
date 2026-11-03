import { getSubstitutionContext } from "@/lib/substitutions/access"
import { errorResponse, readJson, scheduleTasks } from "@/lib/substitutions/http"
import { submitOffer, withdrawOffer } from "@/lib/substitutions/workflow"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { NextRequest, NextResponse } from "next/server"

type Params = { params: Promise<{ id: string }> }

/**
 * POST /api/substitutions/[id]/offers — zgłoszenie do zlecenia (oferta ze stawką)
 * albo przyjęcie zlecenia w trybie „pierwszy, kto przyjmie”.
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const ctx = await getSubstitutionContext()
    if (!ctx.ok) return ctx.response
    const { id } = await params

    const rl = rateLimit(`substitution-offer:${ctx.userId}:${getClientIp(request)}`, { limit: 60, windowMs: 60 * 60 * 1000 })
    if (!rl.success) return tooManyRequestsResponse(rl.retryAfterSeconds)

    const result = await submitOffer(ctx, id, await readJson(request))
    scheduleTasks(result.tasks)
    return NextResponse.json({ message: result.message })
  } catch (error) {
    return errorResponse(error, "Błąd zgłoszenia do zlecenia")
  }
}

/** DELETE /api/substitutions/[id]/offers — wycofanie własnej oferty przed wyborem. */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const ctx = await getSubstitutionContext()
    if (!ctx.ok) return ctx.response
    const { id } = await params

    const result = await withdrawOffer(ctx, id)
    return NextResponse.json({ message: result.message })
  } catch (error) {
    return errorResponse(error, "Błąd wycofania oferty")
  }
}
