import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/ad-clients - Pobierz wszystkich klientów reklamowych (ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clients = await prisma.adClient.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { ads: true } },
        ads: {
          select: {
            id: true,
            impressions: true,
            clicks: true,
            active: true,
          },
        },
      },
    })

    return NextResponse.json({ clients })
  } catch (error) {
    console.error("Error fetching ad clients:", error)
    return NextResponse.json({ error: "Failed to fetch ad clients" }, { status: 500 })
  }
}

// POST /api/admin/ad-clients - Dodaj nowego klienta reklamowego (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, contactName, contactEmail, contactPhone, notes, active } = body

    if (!name) {
      return NextResponse.json({ error: "Nazwa klienta jest wymagana" }, { status: 400 })
    }

    const client = await prisma.adClient.create({
      data: {
        name,
        contactName: contactName || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        notes: notes || null,
        active: active !== undefined ? active : true,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error("Error creating ad client:", error)
    return NextResponse.json({ error: "Failed to create ad client" }, { status: 500 })
  }
}
