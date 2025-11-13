import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/admin/newsletter - List all newsletter subscribers
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const subscribers = await prisma.newsletter.findMany({
      orderBy: { dataZapisu: "desc" }
    })

    return NextResponse.json(subscribers)
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
