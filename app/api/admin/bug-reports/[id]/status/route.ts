import { auth } from "@/lib/auth"
import { sendSystemNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { emitNewNotification } from "@/lib/socket"
import { NextRequest, NextResponse } from "next/server"

const BUG_REPORT_REWARD_POINTS = 20

// PATCH /api/admin/bug-reports/[id]/status - Akceptacja/odrzucenie zgłoszenia błędu (ADMIN only)
export async function PATCH(
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
    const { status, adminNotatka } = body

    if (status !== "ZAAKCEPTOWANE" && status !== "ODRZUCONE") {
      return NextResponse.json({ error: "Nieprawidłowy status" }, { status: 400 })
    }

    const bugReport = await prisma.bugReport.findUnique({ where: { id } })

    if (!bugReport) {
      return NextResponse.json({ error: "Nie znaleziono zgłoszenia" }, { status: 404 })
    }

    if (bugReport.status !== "NOWE") {
      return NextResponse.json(
        { error: "To zgłoszenie zostało już rozpatrzone" },
        { status: 409 }
      )
    }

    let pointsAwarded = false

    await prisma.$transaction(async (tx) => {
      await tx.bugReport.update({
        where: { id },
        data: {
          status,
          adminNotatka: adminNotatka || null,
        },
      })

      if (status === "ZAAKCEPTOWANE") {
        const lawFirm = await tx.lawFirm.findUnique({
          where: { userId: bugReport.userId },
          select: { id: true, punktySaldo: true },
        })

        if (lawFirm) {
          const newBalance = lawFirm.punktySaldo + BUG_REPORT_REWARD_POINTS
          await tx.lawFirm.update({
            where: { id: lawFirm.id },
            data: { punktySaldo: newBalance },
          })
          await tx.pointTransaction.create({
            data: {
              lawFirmId: lawFirm.id,
              amount: BUG_REPORT_REWARD_POINTS,
              balanceAfter: newBalance,
              type: "BUG_REPORT_REWARD",
              description: "Nagroda za zaakceptowane zgłoszenie błędu",
            },
          })
          await tx.bugReport.update({
            where: { id },
            data: { punktyPrzyznane: true },
          })
          pointsAwarded = true
        }
      }
    })

    try {
      const { notification } = await sendSystemNotification({
        userId: bugReport.userId,
        typ: "SYSTEM",
        tytul: status === "ZAAKCEPTOWANE" ? "Zgłoszenie błędu zaakceptowane" : "Zgłoszenie błędu odrzucone",
        tresc:
          status === "ZAAKCEPTOWANE"
            ? `Twoje zgłoszenie błędu zostało zaakceptowane.${pointsAwarded ? ` Otrzymujesz ${BUG_REPORT_REWARD_POINTS} punktów.` : ""}`
            : `Twoje zgłoszenie błędu zostało odrzucone.${adminNotatka ? ` Powód: ${adminNotatka}` : ""}`,
        linkUrl: "/panel-eksperta",
        force: true,
      })

      if (notification) {
        await emitNewNotification(bugReport.userId, notification)
      }
    } catch (err) {
      console.error(`Błąd wysyłania powiadomienia o statusie zgłoszenia błędu do użytkownika ${bugReport.userId}:`, err)
    }

    return NextResponse.json({ success: true, pointsAwarded })
  } catch (error) {
    console.error("Error updating bug report status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
