import { getSubstitutionContext } from "@/lib/substitutions/access"
import { errorResponse, readJson, scheduleTasks } from "@/lib/substitutions/http"
import { parseAction, performAction } from "@/lib/substitutions/workflow"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/substitutions/[id]/actions — przejścia w cyklu zlecenia:
 * zlecający: cancel, archive, select, unassign, remind, complete, problem;
 * zastępca: confirm, resign, on-site, report, invoice;
 * zapytany: respond. Uprawnienia i dozwolone statusy sprawdza lib/substitutions/workflow.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getSubstitutionContext()
    if (!ctx.ok) return ctx.response
    const { id } = await params

    const action = parseAction(await readJson(request))
    const result = await performAction(ctx, id, action)
    scheduleTasks(result.tasks)
    return NextResponse.json({ message: result.message })
  } catch (error) {
    return errorResponse(error, "Błąd akcji na zleceniu zastępstwa")
  }
}
