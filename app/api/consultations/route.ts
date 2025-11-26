import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"
import * as z from "zod"

const consultationSchema = z.object({
  lawFirmId: z.string(),
  description: z.string().min(1),
  dateRanges: z.string(), // JSON string
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== 'CLIENT') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const validation = consultationSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.formErrors }, { status: 400 })
  }

  const { lawFirmId, description, dateRanges } = validation.data

  try {
    const consultation = await prisma.consultation.create({
      data: {
        clientId: session.user.id,
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
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const consultations = await prisma.consultation.findMany({
      where: {
        OR: [
          { clientId: session.user.id },
          { lawFirmId: session.user.id },
        ],
      },
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