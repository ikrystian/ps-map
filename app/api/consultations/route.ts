import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { sendSystemNotification } from "@/lib/notifications"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { lawFirmId, clientId, consultationDate, duration, price, topic, clientContact } = await req.json()

    const client = await prisma.client.findUnique({
      where: { userId: session.user.id }
    })

    if (!client) {
      return NextResponse.json({ error: "Nie znaleziono profilu klienta" }, { status: 404 })
    }

    if (client.id !== clientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const newBooking = await prisma.consultationBooking.create({
      data: {
        lawFirmId,
        clientId,
        consultationDate,
        duration,
        price,
        topic,
        clientContact,
        status: "PENDING",
        paymentStatus: "OCZEKUJE",
      },
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

    // Create notification for law firm
    await sendSystemNotification({
      userId: newBooking.lawFirm.userId,
      typ: "NOWA_KONSULTACJA",
      tytul: "Nowa prośba o konsultację",
      tresc: `${newBooking.client.user.name} wysłał prośbę o konsultację (${duration} min)`,
      linkUrl: "/panel-eksperta/konsultacje",
    })

    return NextResponse.json(newBooking, { status: 201 })
  } catch (error) {
    console.error("Error creating consultation booking:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
