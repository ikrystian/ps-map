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

    const isAdmin = session.user.role === "ADMIN"

    // Get the user's law firm (admins may fetch any invoice and have no law firm)
    let lawFirmId: string | undefined
    if (!isAdmin) {
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

      lawFirmId = user.lawFirm.id
    }

    // Get the invoice with all related data
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        ...(lawFirmId ? { lawFirmId } : {}),
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
            nip: true,
            user: {
              select: {
                adres: true,
                kodPocztowy: true,
                miasto: true,
                numerTelefonu: true,
              },
            },
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Spłaszcz dane adresowe kancelarii (przeniesione do modelu User)
    return NextResponse.json({
      ...invoice,
      lawFirm: {
        ...invoice.lawFirm,
        adres: invoice.lawFirm.user?.adres ?? "",
        kodPocztowy: invoice.lawFirm.user?.kodPocztowy ?? "",
        miasto: invoice.lawFirm.user?.miasto ?? "",
        numerTelefonu: invoice.lawFirm.user?.numerTelefonu ?? "",
      },
    })
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
