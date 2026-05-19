import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const voivodeshipId = searchParams.get("voivodeshipId")
    const search = searchParams.get("search")

    const where: any = {}
    if (voivodeshipId) {
      where.voivodeshipId = voivodeshipId
    }
    if (search) {
      where.nazwa = { contains: search, mode: "insensitive" }
    }

    const cities = await prisma.city.findMany({
      where,
      include: {
        voivodeship: true,
      },
      orderBy: {
        nazwa: "asc",
      },
    })

    return NextResponse.json(cities)
  } catch (error) {
    console.error("Error fetching cities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
