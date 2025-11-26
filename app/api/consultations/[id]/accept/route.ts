import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"
import * as z from "zod"

const acceptSchema = z.object({
  proposedDateTime: z.string().datetime(),
  price: z.number().positive(),
})

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const consultationId = params.id

  if (!session || !session.user || session.user.role !== 'LAW_FIRM') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const validation = acceptSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.formErrors }, { status: 400 })
  }

  const { proposedDateTime, price } = validation.data

  try {
    const consultation = await prisma.consultation.update({
      where: {
        id: consultationId,
        lawFirmId: session.user.id,
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