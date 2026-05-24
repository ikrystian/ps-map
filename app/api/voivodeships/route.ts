import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrSetCached } from "@/lib/cache"

export async function GET() {
  try {
    const voivodeships = await getOrSetCached(
      "voivodeships:all",
      async () => {
        return await prisma.voivodeship.findMany({
          orderBy: {
            nazwa: "asc",
          },
        })
      },
      86400 // Cache for 24 hours
    )

    return NextResponse.json(voivodeships)
  } catch (error) {
    console.error("Error fetching voivodeships:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

