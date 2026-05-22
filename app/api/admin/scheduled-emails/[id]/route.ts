import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ScheduledEmailStatus } from "@prisma/client"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const email = await prisma.scheduledEmail.findUnique({
      where: { id }
    })

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 })
    }

    // Jeśli status jest PENDING, anuluj go (zmień na CANCELLED)
    // W przeciwnym razie usuń go z bazy danych
    if (email.status === ScheduledEmailStatus.PENDING) {
      const updated = await prisma.scheduledEmail.update({
        where: { id },
        data: {
          status: ScheduledEmailStatus.CANCELLED,
          updatedAt: new Date()
        }
      })
      return NextResponse.json({ message: "Email cancelled successfully", email: updated })
    } else {
      await prisma.scheduledEmail.delete({
        where: { id }
      })
      return NextResponse.json({ message: "Email deleted successfully" })
    }
  } catch (error) {
    console.error("Error cancelling scheduled email:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
