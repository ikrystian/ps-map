import { USER_CONTACT_SELECT, flattenLawFirmUser } from "@/lib/law-firm-user"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            ...USER_CONTACT_SELECT,
          },
        },
        categories: { include: { category: true } },
        reviews: { include: { client: { include: { user: true } } } },
        consultationAvailabilities: true,
        expertiseCategory: { select: { id: true, nazwa: true } },
      },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    return NextResponse.json(flattenLawFirmUser(lawFirm))
  } catch (error) {
    console.error("Error fetching law firm:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
