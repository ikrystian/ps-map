import { getSubstitutionContext } from "@/lib/substitutions/access"
import { errorResponse } from "@/lib/substitutions/http"
import { listTrusted } from "@/lib/substitutions/read"
import { NextResponse } from "next/server"

/**
 * GET /api/substitutions/trusted — zastępcy, z którymi ekspert już współpracował
 * (lista do „Najpierw zapytaj konkretną osobę” w kreatorze).
 */
export async function GET() {
  try {
    const ctx = await getSubstitutionContext()
    if (!ctx.ok) return ctx.response
    return NextResponse.json({ zaufani: await listTrusted(ctx.firm) })
  } catch (error) {
    return errorResponse(error, "Błąd pobierania zaufanych zastępców")
  }
}
