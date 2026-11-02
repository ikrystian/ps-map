import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/bug-reports/[id] - Pełne szczegóły zgłoszenia wraz z historią odpowiedzi (ADMIN only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const bugReport = await prisma.bugReport.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            imie: true,
            nazwisko: true,
            numerTelefonu: true,
            lawFirm: {
              select: {
                nazwa: true,
                slug: true,
              },
            },
          },
        },
        replies: {
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!bugReport) {
      return NextResponse.json({ error: "Nie znaleziono zgłoszenia" }, { status: 404 })
    }

    return NextResponse.json(bugReport)
  } catch (error) {
    console.error("Error fetching bug report details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
