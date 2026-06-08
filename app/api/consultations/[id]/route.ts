import { auth } from "@/auth"
import { sendSystemNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id: bookingId } = await params
  const { status, paymentStatus, isArchived } = await req.json()

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

    const updateData: { status?: any; paymentStatus?: any; googleMeetUrl?: string; isArchived?: boolean } = {}

    if (isArchived !== undefined) {
      updateData.isArchived = isArchived
    }

    if (status) {
      updateData.status = status
      if (status === "ACCEPTED") {
        const dateStr = new Date(booking.consultationDate).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });

        // Create notification for client
        await sendSystemNotification({
          userId: booking.client.userId,
          typ: "KONSULTACJA_ZAAKCEPTOWANA",
          tytul: "Konsultacja zaakceptowana",
          tresc: `${booking.lawFirm.nazwa} zaakceptowała Twoją prośbę o konsultację na dzień ${dateStr}. Link do spotkania pojawi się na 5 minut przed planowaną godziną.`,
          linkUrl: "/panel-klienta/konsultacje",
          emailTemplateType: "KONSULTACJA_ZAAKCEPTOWANA",
          emailVariables: {
            '{klient}': booking.client.user.name || booking.client.user.email,
            '{ekspert}': booking.lawFirm.nazwa,
            '{termin}': dateStr,
            '{linkDoPanelu}': `${process.env.URL || ''}/panel-klienta/konsultacje`,
          },
          force: true,
        })

        // Create notification for expert (law firm)
        await sendSystemNotification({
          userId: booking.lawFirm.userId,
          typ: "KONSULTACJA_ZAAKCEPTOWANA",
          tytul: "Zaakceptowano konsultację",
          tresc: `Zaakceptowałeś konsultację z klientem ${booking.client.user.name} na dzień ${dateStr}. Link do spotkania pojawi się na 5 minut przed planowaną godziną.`,
          linkUrl: "/panel-eksperta/konsultacje",
          emailTemplateType: "KONSULTACJA_ZAAKCEPTOWANA_EKSPERT",
          emailVariables: {
            '{ekspert}': booking.lawFirm.nazwa,
            '{klient}': booking.client.user.name || booking.client.user.email,
            '{termin}': dateStr,
            '{linkDoPanelu}': `${process.env.URL || ''}/panel-eksperta/konsultacje`,
          },
          force: true,
        })
      } else if (status === "REJECTED") {
        // Create notification for client
        await sendSystemNotification({
          userId: booking.client.userId,
          typ: "KONSULTACJA_ODRZUCONA",
          tytul: "Konsultacja odrzucona",
          tresc: `${booking.lawFirm.nazwa} odrzuciła Twoją prośbę o konsultację`,
          linkUrl: "/panel-klienta/konsultacje",
          emailTemplateType: "KONSULTACJA_ODRZUCONA",
          emailVariables: {
            '{klient}': booking.client.user.name || booking.client.user.email,
            '{ekspert}': booking.lawFirm.nazwa,
            '{linkDoPanelu}': `${process.env.URL || ''}/panel-klienta/konsultacje`,
          },
        })
      }
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus

      // Create notification for client when marked as paid
      if (paymentStatus === "ZAPLACONE") {
        await sendSystemNotification({
          userId: booking.client.userId,
          typ: "KONSULTACJA_ZAPLACONA",
          tytul: "Płatność potwierdzona",
          tresc: `${booking.lawFirm.nazwa} potwierdziła płatność za konsultację`,
          linkUrl: "/panel-klienta/konsultacje",
          emailTemplateType: "KONSULTACJA_ZAPLACONA",
          emailVariables: {
            '{klient}': booking.client.user.name || booking.client.user.email,
            '{ekspert}': booking.lawFirm.nazwa,
            '{linkDoPanelu}': `${process.env.URL || ''}/panel-klienta/konsultacje`,
          },
        })
      }
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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id: bookingId } = await params

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const booking = await prisma.consultationBooking.findUnique({
      where: { id: bookingId },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        lawFirm: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check if user is the law firm or the client
    const isLawFirm = session.user.lawFirm?.id === booking.lawFirmId
    const isClient = session.user.client?.id === booking.clientId

    if (!isLawFirm && !isClient) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Create notification for the other party
    if (isClient) {
      // Client deleted - notify law firm
      await sendSystemNotification({
        userId: booking.lawFirm.userId,
        typ: "KONSULTACJA_ANULOWANA",
        tytul: "Konsultacja anulowana",
        tresc: `${booking.client.user.name} anulował konsultację`,
        linkUrl: "/panel-eksperta/konsultacje",
        emailTemplateType: "KONSULTACJA_ANULOWANA",
        emailVariables: {
          '{odbiorca}': booking.lawFirm.nazwa,
          '{inicjator}': booking.client.user.name || booking.client.user.email,
          '{linkDoPanelu}': `${process.env.URL || ''}/panel-eksperta/konsultacje`,
        },
      })
    } else if (isLawFirm) {
      // Law firm deleted - notify client
      await sendSystemNotification({
        userId: booking.client.userId,
        typ: "KONSULTACJA_ANULOWANA",
        tytul: "Konsultacja anulowana",
        tresc: `${booking.lawFirm.nazwa} anulowała konsultację`,
        linkUrl: "/panel-klienta/konsultacje",
        emailTemplateType: "KONSULTACJA_ANULOWANA",
        emailVariables: {
          '{odbiorca}': booking.client.user.name || booking.client.user.email,
          '{inicjator}': booking.lawFirm.nazwa,
          '{linkDoPanelu}': `${process.env.URL || ''}/panel-klienta/konsultacje`,
        },
      })
    }

    await prisma.consultationBooking.delete({
      where: { id: bookingId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting consultation booking:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
