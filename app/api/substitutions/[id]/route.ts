import { getSubstitutionContext } from "@/lib/substitutions/access"
import { errorResponse, readJson, scheduleTasks } from "@/lib/substitutions/http"
import { getOrderView } from "@/lib/substitutions/read"
import { deleteDraft, parseOrderInput, updateOrder } from "@/lib/substitutions/workflow"
import { NextRequest, NextResponse } from "next/server"

type Params = { params: Promise<{ id: string }> }

/**
 * GET /api/substitutions/[id] — zlecenie oczami oglądającego:
 * `owner` (zlecający, wszystko), `substitute` (wybrany zastępca, z danymi sprawy),
 * `request` (zapytanie do mnie) albo `market` (tylko pola publiczne).
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const ctx = await getSubstitutionContext()
    if (!ctx.ok) return ctx.response
    const { id } = await params

    const view = await getOrderView(ctx.firm, ctx.access, id)
    if (!view) return NextResponse.json({ error: "Nie znaleziono zlecenia" }, { status: 404 })
    return NextResponse.json(view)
  } catch (error) {
    return errorResponse(error, "Błąd pobierania zlecenia")
  }
}

/** PATCH /api/substitutions/[id] — zapis szkicu albo zmiana zlecenia (zlecający). */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const ctx = await getSubstitutionContext()
    if (!ctx.ok) return ctx.response
    const { id } = await params

    const input = parseOrderInput(await readJson(request))
    const result = await updateOrder(ctx, id, input)
    scheduleTasks(result.tasks)
    return NextResponse.json({ message: result.message, id })
  } catch (error) {
    return errorResponse(error, "Błąd zapisu zlecenia")
  }
}

/** DELETE /api/substitutions/[id] — usunięcie szkicu (opublikowane zlecenie się anuluje). */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const ctx = await getSubstitutionContext()
    if (!ctx.ok) return ctx.response
    const { id } = await params

    const result = await deleteDraft(ctx, id)
    return NextResponse.json({ message: result.message })
  } catch (error) {
    return errorResponse(error, "Błąd usuwania szkicu")
  }
}
