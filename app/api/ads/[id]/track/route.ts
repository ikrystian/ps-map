import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// POST /api/ads/[id]/track - Śledzenie wyświetleń (impression) lub kliknięć (click)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") // "impression" lub "click"

    if (!type || (type !== "impression" && type !== "click")) {
      return NextResponse.json({ error: "Invalid tracking type" }, { status: 400 })
    }

    const data: any = {}
    if (type === "impression") {
      data.impressions = { increment: 1 }
    } else {
      data.clicks = { increment: 1 }
    }

    const updatedAd = await prisma.advertisement.update({
      where: { id },
      data
    })

    return NextResponse.json({ success: true, impressions: updatedAd.impressions, clicks: updatedAd.clicks })
  } catch (error) {
    console.error("Error tracking ad stat:", error)
    return NextResponse.json(
      { error: "Failed to track statistics" },
      { status: 500 }
    )
  }
}
