import { getSubstitutionContext } from "@/lib/substitutions/access"
import { errorResponse } from "@/lib/substitutions/http"
import { getMenuCounts } from "@/lib/substitutions/read"
import type { AccessResponse } from "@/lib/substitutions/types"
import { NextResponse } from "next/server"

/**
 * GET /api/substitutions/access — czy zalogowany ekspert widzi zastępstwa,
 * w jakiej roli i ile spraw czeka na niego (liczniki w menu).
 */
export async function GET() {
  try {
    const ctx = await getSubstitutionContext({ requireAccess: false })
    if (!ctx.ok) return ctx.response

    const liczniki = ctx.access.dostep ? await getMenuCounts(ctx.firm, ctx.access) : { gielda: 0, moje: 0, przyjete: 0 }
    const body: AccessResponse = { ...ctx.access, punkty: ctx.firm.punktySaldo, liczniki }
    return NextResponse.json(body)
  } catch (error) {
    return errorResponse(error, "Błąd sprawdzania dostępu do zastępstw")
  }
}
