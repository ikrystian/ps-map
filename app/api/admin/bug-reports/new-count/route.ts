import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/admin/bug-reports/new-count - Liczba nowych (nierozpatrzonych) zgłoszeń błędów do licznika w menu (ADMIN only)
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const count = await prisma.bugReport.count({ where: { status: "NOWE" } })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error counting new bug reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
