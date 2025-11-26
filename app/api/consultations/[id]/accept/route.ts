import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import * as z from "zod"

const acceptSchema = z.object({
  proposedDateTime: z.string().datetime(),
  price: z.number().positive(),
})

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id: consultationId } = await params

  if (!session || !session.user || session.user.role !== 'LAW_FIRM') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const validation = acceptSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.flatten() }, { status: 400 })
  }

  const { proposedDateTime, price } = validation.data

  try {
    // Get the LawFirm record for this user
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm profile not found" }, { status: 404 })
    }

    const consultation = await prisma.consultation.update({
      where: {
        id: consultationId,
        lawFirmId: lawFirm.id,
      },
      data: {
        proposedDateTime: new Date(proposedDateTime),
        price,
        status: 'ACCEPTED',
      },
    })
    return NextResponse.json(consultation)
  } catch (error) {
    console.error("Error accepting consultation:", error)
    return NextResponse.json({ error: "Could not accept consultation" }, { status: 500 })
  }
}
