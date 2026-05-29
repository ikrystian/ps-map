import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params

  if (!session || session.user.lawFirm?.id !== id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const availability = await prisma.consultationAvailability.findMany({
      where: { lawFirmId: id },
      orderBy: { dayOfWeek: "asc" },
    })
    return NextResponse.json(availability)
  } catch (error) {
    console.error("Error fetching consultation availability:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params

  if (!session || session.user.lawFirm?.id !== id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { availability } = await req.json()

    await prisma.$transaction(async (tx) => {
      // Delete existing availability
      await tx.consultationAvailability.deleteMany({
        where: { lawFirmId: id },
      })

      // Create new availability
      if (availability && availability.length > 0) {
        await tx.consultationAvailability.createMany({
          data: availability.map((item: any) => ({
            lawFirmId: id,
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
