import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"

const prisma = new PrismaClient()

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const { id: clientId } = params

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
