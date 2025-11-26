import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createGoogleMeetLink } from "@/lib/google-meet"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const consultationId = params.id

  if (!session || !session.user || session.user.role !== 'CLIENT') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const consultation = await prisma.consultation.findUnique({
      where: {
        id: consultationId,
        clientId: session.user.id,
      },
      include: {
        client: {
          include: {
            user: true
          }
        },
        lawFirm: {
          include: {
            user: true
          }
        },
      }
    })

    if (!consultation || !consultation.price) {
      return NextResponse.json({ error: "Consultation not found or price not set" }, { status: 404 })
    }

    const client = await prisma.client.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    if (client.punktySaldo < consultation.price) {
      return NextResponse.json({ error: "Insufficient points" }, { status: 400 })
    }

    const googleMeetLink = await createGoogleMeetLink(consultation)

    if (!googleMeetLink) {
      return NextResponse.json({ error: "Could not create Google Meet link" }, { status: 500 })
    }

    const [, updatedConsultation] = await prisma.$transaction([
      prisma.client.update({
        where: {
          userId: session.user.id,
        },
        data: {
          punktySaldo: {
            decrement: consultation.price,
          },
        },
      }),
      prisma.consultation.update({
        where: {
          id: consultationId,
        },
        data: {
          paymentStatus: 'ZAPLACONE',
          status: 'PAID',
          googleMeetLink: googleMeetLink,
        },
      }),
    ])

    return NextResponse.json(updatedConsultation)
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ error: "Could not process payment" }, { status: 500 })
  }
}