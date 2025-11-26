import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id: lawFirmId } = params

  if (!lawFirmId) {
    return NextResponse.json({ error: "Law firm ID is required" }, { status: 400 })
  }

  try {
    const bookings = await prisma.consultationBooking.findMany({
      where: {
        lawFirmId: lawFirmId,
        // We only need to block slots that are pending or accepted
        status: {
          in: ["PENDING", "ACCEPTED"],
        },
      },
      select: {
        consultationDate: true,
      },
    })
    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching consultation bookings:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
