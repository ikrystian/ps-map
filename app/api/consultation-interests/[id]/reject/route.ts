import { auth } from "@/lib/auth"
import { sendSystemNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/consultation-interests/[id]/reject
 * Klient odrzuca pojedyncze zgłoszenie – zapytanie pozostaje otwarte dla pozostałych ekspertów.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 })
    }

    if (session.user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Tylko klient może odrzucić zgłoszenie" },
        { status: 403 }
      )
    }

    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
      select: { id: true, imie: true, nazwisko: true },
    })

    if (!client) {
      return NextResponse.json({ error: "Nie znaleziono profilu klienta" }, { status: 404 })
    }

    const interest = await prisma.consultationInterest.findUnique({
      where: { id },
      include: {
        request: { select: { id: true, clientId: true, temat: true } },
        lawFirm: { select: { nazwa: true, userId: true } },
      },
    })

    if (!interest) {
      return NextResponse.json({ error: "Nie znaleziono zgłoszenia" }, { status: 404 })
    }

    if (interest.request.clientId !== client.id) {
      return NextResponse.json({ error: "Brak dostępu do tego zgłoszenia" }, { status: 403 })
    }

    if (interest.status !== "ZLOZONE") {
      return NextResponse.json(
        { error: "To zgłoszenie zostało już rozpatrzone" },
        { status: 400 }
      )
    }

    const updated = await prisma.consultationInterest.update({
      where: { id },
      data: { status: "ODRZUCONE", odrzuconeData: new Date() },
    })

    const baseUrl = process.env.NEXTAUTH_URL || process.env.URL || "http://localhost:3000"

    try {
      const { notification } = await sendSystemNotification({
        userId: interest.lawFirm.userId,
        typ: "ZMIANA_STATUSU",
        tytul: "Zgłoszenie do konsultacji odrzucone",
        tresc: `Klient nie wybrał Twojego zgłoszenia do konsultacji "${interest.request.temat}".`,
        linkUrl: "/panel-eksperta/konsultacje/zapytania",
        emailTemplateType: "ZAINTERESOWANIE_ODRZUCONE",
        emailVariables: {
          "{ekspert}": interest.lawFirm.nazwa,
          "{klient}": `${client.imie} ${client.nazwisko}`,
          "{temat}": interest.request.temat,
          "{linkDoPanelu}": `${baseUrl}/panel-eksperta/konsultacje/zapytania`,
        },
      })

      const { emitNewNotification } = await import("@/lib/socket")
      await emitNewNotification(interest.lawFirm.userId, notification)
    } catch (notifyError) {
      console.error("Failed to notify law firm about rejected interest:", notifyError)
    }

    return NextResponse.json({ success: true, interest: updated })
  } catch (error) {
    console.error("Error rejecting consultation interest:", error)
    return NextResponse.json({ error: "Błąd podczas odrzucania zgłoszenia" }, { status: 500 })
  }
}
