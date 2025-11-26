import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { slug: params.slug },
      include: {
        user: true,
        voivodeship: true,
        categories: { include: { category: true } },
        reviews: { include: { client: { include: { user: true } } } },
        consultationAvailabilities: true,
      },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    return NextResponse.json(lawFirm)
  } catch (error) {
    console.error("Error fetching law firm:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
