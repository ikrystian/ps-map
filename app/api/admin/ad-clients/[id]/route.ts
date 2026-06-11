import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/ad-clients/[id] - Pobierz klienta reklamowego
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const client = await prisma.adClient.findUnique({
      where: { id },
      include: {
        ads: {
          orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Nie znaleziono klienta" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error fetching ad client:", error)
    return NextResponse.json({ error: "Failed to fetch ad client" }, { status: 500 })
  }
}

// PUT /api/admin/ad-clients/[id] - Aktualizuj klienta reklamowego
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, contactName, contactEmail, contactPhone, notes, active } = body

    const existingClient = await prisma.adClient.findUnique({ where: { id } })
    if (!existingClient) {
      return NextResponse.json({ error: "Nie znaleziono klienta" }, { status: 404 })
    }

    const updatedClient = await prisma.adClient.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(contactName !== undefined && { contactName: contactName || null }),
        ...(contactEmail !== undefined && { contactEmail: contactEmail || null }),
        ...(contactPhone !== undefined && { contactPhone: contactPhone || null }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(active !== undefined && { active }),
      },
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error("Error updating ad client:", error)
    return NextResponse.json({ error: "Failed to update ad client" }, { status: 500 })
  }
}

// DELETE /api/admin/ad-clients/[id] - Usuń klienta reklamowego
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existingClient = await prisma.adClient.findUnique({ where: { id } })
    if (!existingClient) {
      return NextResponse.json({ error: "Nie znaleziono klienta" }, { status: 404 })
    }

    // Reklamy zostaną odpięte (clientId -> null) dzięki onDelete: SetNull
    await prisma.adClient.delete({ where: { id } })

    return NextResponse.json({ message: "Klient reklamowy został usunięty" })
  } catch (error) {
    console.error("Error deleting ad client:", error)
    return NextResponse.json({ error: "Failed to delete ad client" }, { status: 500 })
  }
}
