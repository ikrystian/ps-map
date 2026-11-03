import { getSubstitutionContext } from "@/lib/substitutions/access"
import { errorResponse, readJson } from "@/lib/substitutions/http"
import { listOwnerOrders } from "@/lib/substitutions/read"
import { createDraft, parseOrderInput } from "@/lib/substitutions/workflow"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/substitutions — „Moje zlecenia”: zlecenia zastępstw dodane przez eksperta.
 */
export async function GET() {
  try {
    const ctx = await getSubstitutionContext()
    if (!ctx.ok) return ctx.response
    return NextResponse.json({ zlecenia: await listOwnerOrders(ctx.firm) })
  } catch (error) {
    return errorResponse(error, "Błąd pobierania moich zleceń")
  }
}

/**
 * POST /api/substitutions — nowy szkic zlecenia (kreator zapisuje go przy przejściu do kroku 2).
 */
export async function POST(request: NextRequest) {
  try {
    const ctx = await getSubstitutionContext()
    if (!ctx.ok) return ctx.response

    const rl = rateLimit(`substitution-draft:${ctx.userId}:${getClientIp(request)}`, { limit: 30, windowMs: 60 * 60 * 1000 })
    if (!rl.success) return tooManyRequestsResponse(rl.retryAfterSeconds)

    const input = parseOrderInput(await readJson(request))
    const draft = await createDraft(ctx, input)
    return NextResponse.json(draft, { status: 201 })
  } catch (error) {
    return errorResponse(error, "Błąd tworzenia szkicu zlecenia")
  }
}
