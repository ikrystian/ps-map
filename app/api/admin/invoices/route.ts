import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/invoices - Fetch all invoices in the system (ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      include: {
        order: {
          include: {
            subscriptionPlan: true,
          },
        },
        lawFirm: {
          select: {
            id: true,
            nazwa: true,
          },
        },
      },
      orderBy: {
        issueDate: "desc",
      },
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania faktur" },
      { status: 500 }
    )
  }
}
