import { auth } from "@/auth"
import { sendSystemNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { emitNewNotification } from "@/lib/socket"
import { NextRequest } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany, aby zgłosić opinię" },
        { status: 401 }
      )
    }

    // Pobierz dane zgłoszenia
    const body = await request.json()
    const { reason, description } = body

    if (!reason) {
      return Response.json(
        { error: "Powód zgłoszenia jest wymagany" },
        { status: 400 }
      )
    }

    // Sprawdź czy opinia istnieje
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        lawFirm: {
          select: {
            nazwa: true,
          },
        },
      },
    })

    if (!review) {
      return Response.json(
        { error: "Nie znaleziono opinii" },
        { status: 404 }
      )
    }

    // Zapisz zgłoszenie w bazie danych
    await prisma.reviewReport.create({
      data: {
        reviewId,
        userId: session.user.id,
        reason,
        description: description || null,
      },
    })

    // Pobierz wszystkich aktywnych administratorów
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
        status: "ACTIVE",
      },
    })

    if (admins.length === 0) {
      console.warn("No active admin found to receive review report notification.")
    }

    // Powody zgłoszenia po polsku do treści powiadomienia
    const reasonLabels: Record<string, string> = {
      SPAM: "Spam lub reklama",
      WULGARYZMY: "Wulgaryzmy lub obraźliwe treści",
      FALSZYWA_OPINIA: "Niewiarygodna / fałszywa opinia",
      NIEODPOWIEDNIA: "Nieodpowiednia treść",
      INNY: "Inny powód",
    }

    const readableReason = reasonLabels[reason] || reason
    const userEmail = session.user.email || "Zalogowany użytkownik"

    // Wyślij powiadomienie do każdego administratora
    for (const admin of admins) {
      try {
        const { notification } = await sendSystemNotification({
          userId: admin.id,
          typ: "SYSTEM",
          tytul: "Zgłoszenie opinii",
          tresc: `Użytkownik ${userEmail} zgłosił opinię o tytule "${review.tytulOpinii}" dla ekspertów "${review.lawFirm.nazwa}". Powód: ${readableReason}.${description ? ` Opis: ${description}` : ""}`,
          linkUrl: `/admin/reviews?search=${encodeURIComponent(review.tytulOpinii)}`,
          force: true,
        })

        if (notification) {
          await emitNewNotification(admin.id, notification)
        }
      } catch (err) {
        console.error(`Błąd wysyłania powiadomienia o zgłoszeniu opinii do admina ${admin.id}:`, err)
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error reporting review:", error)
    return Response.json(
      { error: "Błąd podczas zgłaszania opinii" },
      { status: 500 }
    )
  }
}
