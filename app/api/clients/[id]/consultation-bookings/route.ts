import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id: clientId } = await params

  if (!session || session.user.client?.id !== clientId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const bookings = await prisma.consultationBooking.findMany({
      where: { clientId: clientId },
      include: {
        lawFirm: true,
      },
      orderBy: { consultationDate: "desc" },
    })
    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching client consultation bookings:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
