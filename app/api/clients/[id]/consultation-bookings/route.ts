import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id: clientId } = await params

  if (!session || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id }
  })

  if (!client || client.id !== clientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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
