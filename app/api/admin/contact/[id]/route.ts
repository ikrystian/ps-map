import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// PATCH /api/admin/contact/[id] - Zmiana statusu odpowiedziano
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existingMessage = await prisma.contactForm.findUnique({
      where: { id },
    })

    if (!existingMessage) {
      return NextResponse.json({ error: "Nie znaleziono wiadomości" }, { status: 404 })
    }

    const updated = await prisma.contactForm.update({
      where: { id },
      data: {
        odpowiedziano: typeof body.odpowiedziano === "boolean" ? body.odpowiedziano : !existingMessage.odpowiedziano,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating contact message status:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}

// DELETE /api/admin/contact/[id] - Usuwanie wiadomości kontaktowej
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 })
    }

    const { id } = await params

    const existingMessage = await prisma.contactForm.findUnique({
      where: { id },
    })

    if (!existingMessage) {
      return NextResponse.json({ error: "Nie znaleziono wiadomości" }, { status: 404 })
    }

    await prisma.contactForm.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: "Wiadomość usunięta" })
  } catch (error) {
    console.error("Error deleting contact message:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
