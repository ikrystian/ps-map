import { getOrSetCached } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // ?hasExperts=true — tylko województwa, w których działa aktywny ekspert (F-055)
    const hasExperts = new URL(request.url).searchParams.get("hasExperts") === "true"
    const voivodeships = await getOrSetCached(
      hasExperts ? "voivodeships:hasExperts" : "voivodeships:all",
      async () => {
        return await prisma.voivodeship.findMany({
          where: hasExperts
            ? {
                OR: [
                  { users: { some: { lawFirm: { is: { aktywna: true } } } } },
                  { lawFirmVoivodeships: { some: { lawFirm: { aktywna: true } } } },
                ],
              }
            : undefined,
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

