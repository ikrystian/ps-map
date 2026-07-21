import { auth } from "@/lib/auth"
import { sendSystemNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { emitNewNotification } from "@/lib/socket"
import { NextRequest } from "next/server"

const kategorieLabels: Record<string, string> = {
  UI_UX: "Błąd wizualny / interfejsu",
  FUNKCJONALNY: "Funkcja nie działa zgodnie z oczekiwaniami",
  WYDAJNOSC: "Wolne działanie / zawieszanie się",
  PLATNOSCI: "Problem z płatnością",
  BEZPIECZENSTWO: "Problem bezpieczeństwa",
  INNE: "Inne",
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Zgłaszanie błędów jest dostępne wyłącznie dla ekspertów" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { opis, url, kategoria, zalaczniki } = body

    if (!opis || !url || !kategoria) {
      return Response.json(
        { error: "Opis, adres URL oraz kategoria są wymagane" },
        { status: 400 }
      )
    }

    if (!Object.keys(kategorieLabels).includes(kategoria)) {
      return Response.json({ error: "Nieprawidłowa kategoria" }, { status: 400 })
    }

    const bugReport = await prisma.bugReport.create({
      data: {
        userId: session.user.id,
        opis,
        url,
        kategoria,
        zalaczniki: Array.isArray(zalaczniki) && zalaczniki.length > 0 ? JSON.stringify(zalaczniki) : null,
      },
    })

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", status: "ACTIVE" },
    })

    const userLabel = session.user.name || session.user.email || "Ekspert"

    for (const admin of admins) {
      try {
        const { notification } = await sendSystemNotification({
          userId: admin.id,
          typ: "SYSTEM",
          tytul: "Nowe zgłoszenie błędu",
          tresc: `Ekspert ${userLabel} zgłosił błąd (${kategorieLabels[kategoria]}) na stronie ${url}. Opis: ${opis}`,
          linkUrl: "/admin/bug-reports",
          force: true,
        })

        if (notification) {
          await emitNewNotification(admin.id, notification)
        }
      } catch (err) {
        console.error(`Błąd wysyłania powiadomienia o zgłoszeniu błędu do admina ${admin.id}:`, err)
      }
    }

    return Response.json({ success: true, bugReport }, { status: 201 })
  } catch (error) {
    console.error("Error creating bug report:", error)
    return Response.json({ error: "Błąd podczas zgłaszania błędu" }, { status: 500 })
  }
}
