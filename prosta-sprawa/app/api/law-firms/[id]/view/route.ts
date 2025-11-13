import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get current date info
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1 // 1-12

    // Update or create stats entry
    await prisma.$transaction(async (tx) => {
      // Increment total profile views on law firm
      await tx.lawFirm.update({
        where: { id },
        data: {
          wyswietleniaProfilu: { increment: 1 },
        },
      })

      // Update monthly stats
      await tx.lawFirmStats.upsert({
        where: {
          lawFirmId_year_month: {
            lawFirmId: id,
            year,
            month,
          },
        },
        update: {
          profileViews: { increment: 1 },
        },
        create: {
          lawFirmId: id,
          year,
          month,
          profileViews: 1,
        },
      })
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error tracking profile view:", error)
    return Response.json(
      { error: "Błąd podczas śledzenia wyświetlenia" },
      { status: 500 }
    )
  }
}
