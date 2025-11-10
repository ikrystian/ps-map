import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const voivodeships = await prisma.voivodeship.findMany({
      orderBy: {
        nazwa: "asc",
      },
    })

    return NextResponse.json(voivodeships)
  } catch (error) {
    console.error("Error fetching voivodeships:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
