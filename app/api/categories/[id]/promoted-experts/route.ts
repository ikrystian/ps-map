import { getOrSetCached } from "@/lib/cache"
import { getCategoryPromotedLawFirms } from "@/lib/promotions"
import { NextRequest, NextResponse } from "next/server"

// GET /api/categories/[id]/promoted-experts - Eksperci z aktywną promocją
// PROMOCJA_KATEGORII dla danej kategorii (slider pod opisem kategorii)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "12")

    const experts = await getOrSetCached(
      `category:${id}:promoted-experts`,
      () => getCategoryPromotedLawFirms(id, limit),
      300 // 5 minut
    )

    return NextResponse.json({ experts })
  } catch (error) {
    console.error("Error fetching category promoted experts:", error)
    return NextResponse.json(
      { error: "Failed to fetch promoted experts" },
      { status: 500 }
    )
  }
}
