import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"
import { createGoogleMeetLink } from "@/lib/google-meet"


const prisma = new PrismaClient()

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id: bookingId } = await params
  const { status, paymentStatus } = await req.json()

  if (!session?.user?.lawFirm) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const booking = await prisma.consultationBooking.findUnique({
      where: { id: bookingId },
      include: {
        lawFirm: {
          include: {
            user: true,
          },
        },
        client: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!booking || booking.lawFirmId !== session.user.lawFirm.id) {
      return NextResponse.json({ error: "Booking not found or access denied" }, { status: 404 })
    }

    const updateData: { status?: any; paymentStatus?: any, googleMeetUrl?: string } = {}

    if (status) {
      updateData.status = status
       if (status === "ACCEPTED") {
        const meetLink = await createGoogleMeetLink({
          id: booking.id,
          proposedDateTime: booking.consultationDate.toISOString(),
          description: booking.topic,
          lawFirm: booking.lawFirm,
          client: booking.client,
        });
        console.log(meetLink);
        updateData.googleMeetUrl = meetLink || undefined;
      }
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus
    }

    const updatedBooking = await prisma.consultationBooking.update({
      where: { id: bookingId },
      data: updateData,
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error updating consultation booking:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
