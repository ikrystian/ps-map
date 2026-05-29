import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get the user's law firm
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        lawFirm: {
          select: { id: true }
        }
      },
    })

    if (!user?.lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    // Get the invoice with all related data
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        lawFirmId: user.lawFirm.id,
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            orderType: true,
            subscriptionPlan: {
              select: {
                nazwa: true,
              },
            },
          },
        },
        lawFirm: {
          select: {
            nazwa: true,
            nazwaFirmy: true,
            nip: true,
            adres: true,
            kodPocztowy: true,
            miasto: true,
            numerTelefonu: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
