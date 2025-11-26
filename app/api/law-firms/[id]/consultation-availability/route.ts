import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"

const prisma = new PrismaClient()

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.lawFirm?.id !== params.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const availability = await prisma.consultationAvailability.findMany({
      where: { lawFirmId: params.id },
      orderBy: { dayOfWeek: "asc" },
    })
    return NextResponse.json(availability)
  } catch (error) {
    console.error("Error fetching consultation availability:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.lawFirm?.id !== params.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { availability } = await req.json()

    await prisma.$transaction(async (tx) => {
      // Delete existing availability
      await tx.consultationAvailability.deleteMany({
        where: { lawFirmId: params.id },
      })

      // Create new availability
      if (availability && availability.length > 0) {
        await tx.consultationAvailability.createMany({
          data: availability.map((item: any) => ({
            lawFirmId: params.id,
            dayOfWeek: item.dayOfWeek,
            startTime: item.startTime,
            endTime: item.endTime,
            price15min: item.price15min,
            price30min: item.price30min,
          })),
        })
      }
    })

    return NextResponse.json({ message: "Availability updated successfully" })
  } catch (error) {
    console.error("Error updating consultation availability:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
