import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"

// Dummy function for Google Meet link generation
const generateGoogleMeetLink = async (booking: any) => {
    // In a real application, you would use the Google Calendar API here
    // For now, we'll return a placeholder link
    console.log("Generating Google Meet link for booking:", booking.id);
    return `https://meet.google.com/fake-${booking.id}`;
};


const prisma = new PrismaClient()

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const { id: bookingId } = params
  const { status, paymentStatus } = await req.json()

  if (!session?.user?.lawFirm) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const booking = await prisma.consultationBooking.findUnique({
      where: { id: bookingId },
    })

    if (!booking || booking.lawFirmId !== session.user.lawFirm.id) {
      return NextResponse.json({ error: "Booking not found or access denied" }, { status: 404 })
    }

    const updateData: { status?: any; paymentStatus?: any, googleMeetUrl?: string } = {}

    if (status) {
      updateData.status = status
       if (status === "ACCEPTED") {
        const meetLink = await generateGoogleMeetLink(booking);
        updateData.googleMeetUrl = meetLink;
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
