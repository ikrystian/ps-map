import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/promotion-configs - Fetch active promotion configs (PUBLIC)
export async function GET(request: NextRequest) {
  try {
    // Fetch only active promotion configs, ordered by kolejnosc
    const configs = await prisma.promotionConfig.findMany({
      where: {
        aktywna: true,
      },
      orderBy: {
        kolejnosc: "asc",
      },
    })

    // Parse features JSON for each config
    const configsWithParsedFeatures = configs.map((config) => ({
      ...config,
      features: JSON.parse(config.features),
    }))

    return NextResponse.json(configsWithParsedFeatures)
  } catch (error) {
    console.error("Error fetching promotion configs:", error)
    return NextResponse.json(
      { error: "Failed to fetch promotion configs" },
      { status: 500 }
    )
  }
}
