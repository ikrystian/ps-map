import { getSubstitutionContext } from "@/lib/substitutions/access"
import { errorResponse } from "@/lib/substitutions/http"
import { listAcceptedOrders } from "@/lib/substitutions/read"
import { NextResponse } from "next/server"

/**
 * GET /api/substitutions/accepted — „Przyjęte”: zastępstwa, w których ekspert
 * jest wybranym zastępcą, z odsłoniętymi danymi sprawy.
 */
export async function GET() {
  try {
    const ctx = await getSubstitutionContext()
    if (!ctx.ok) return ctx.response
    return NextResponse.json({ zlecenia: await listAcceptedOrders(ctx.firm) })
  } catch (error) {
    return errorResponse(error, "Błąd pobierania przyjętych zastępstw")
  }
}
