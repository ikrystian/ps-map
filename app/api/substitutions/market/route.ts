import { getSubstitutionContext } from "@/lib/substitutions/access"
import { errorResponse } from "@/lib/substitutions/http"
import { loadMarket } from "@/lib/substitutions/read"
import { NextResponse } from "next/server"

/**
 * GET /api/substitutions/market — giełda: otwarte zlecenia innych pełnomocników,
 * zapytania skierowane do eksperta i statystyki nad listą.
 * Filtry (województwo, czynność, termin, chipy) liczy panel po stronie klienta.
 */
export async function GET() {
  try {
    const ctx = await getSubstitutionContext()
    if (!ctx.ok) return ctx.response
    return NextResponse.json(await loadMarket(ctx.firm, ctx.access))
  } catch (error) {
    return errorResponse(error, "Błąd pobierania giełdy zastępstw")
  }
}
