import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import * as z from "zod"

const consultationSchema = z.object({
  lawFirmId: z.string(),
  description: z.string().min(1),
  dateRanges: z.string(), // JSON string
})

export async function POST(req: Request) {
  const session = await auth()

  if (!session || !session.user || session.user.role !== 'CLIENT') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const validation = consultationSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.flatten() }, { status: 400 })
  }

  const { lawFirmId, description, dateRanges } = validation.data

  try {
    // Get the Client record for this user
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
    })

    if (!client) {
      return NextResponse.json({ error: "Client profile not found" }, { status: 404 })
    }

    const consultation = await prisma.consultation.create({
      data: {
        clientId: client.id,
        lawFirmId,
        description,
        dateRanges,
      },
    })
    return NextResponse.json(consultation, { status: 201 })
  } catch (error) {
    console.error("Error creating consultation:", error)
    return NextResponse.json({ error: "Could not create consultation" }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth()

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Build query based on user role
    let whereClause: any = {}

    if (session.user.role === 'CLIENT') {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
      })
      if (client) {
        whereClause.clientId = client.id
      }
    } else if (session.user.role === 'LAW_FIRM') {
      const lawFirm = await prisma.lawFirm.findUnique({
        where: { userId: session.user.id },
      })
      if (lawFirm) {
        whereClause.lawFirmId = lawFirm.id
      }
    }

    const consultations = await prisma.consultation.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            imie: true,
            nazwisko: true,
          }
        },
        lawFirm: {
          select: {
            nazwa: true,
          }
        }
      }
    })
    return NextResponse.json(consultations)
  } catch (error) {
    console.error("Error fetching consultations:", error)
    return NextResponse.json({ error: "Could not fetch consultations" }, { status: 500 })
  }
}
