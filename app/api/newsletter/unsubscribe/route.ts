import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

/**
 * GET /api/newsletter/unsubscribe?token=...
 * Wypisuje z newslettera na podstawie tokenu
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(new URL('/newsletter/wypisz-sie?error=brak-tokenu', request.url))
    }

    // Znajdź subskrypcję po tokenie
    const subscription = await prisma.newsletter.findUnique({
      where: { unsubscribeToken: token },
    })

    if (!subscription) {
      return NextResponse.redirect(new URL('/newsletter/wypisz-sie?error=nieprawidlowy-token', request.url))
    }

    // Jeśli już jest nieaktywny, przekieruj z informacją
    if (!subscription.aktywny) {
        return NextResponse.redirect(new URL('/newsletter/wypisz-sie?status=juz-wypisany', request.url))
    }

    // Zaktualizuj subskrypcję - oznacz jako nieaktywną
    await prisma.newsletter.update({
      where: { id: subscription.id },
      data: {
        aktywny: false,
        dataRezygnacji: new Date(),
        // Opcjonalnie: możemy wyczyścić unsubscribeToken, ale zwykle lepiej zostawić, 
        // żeby użytkownik mógł wrócić z tego samego linku jeśli się pomylił (choć tu mamy flow zapisu)
      },
    })

    return NextResponse.redirect(new URL('/newsletter/wypisz-sie?status=sukces', request.url))
  } catch (error) {
    console.error("Newsletter unsubscription error:", error)
    return NextResponse.redirect(new URL('/newsletter/wypisz-sie?error=blad-serwera', request.url))
  }
}

/**
 * POST /api/newsletter/unsubscribe
 * Wypisuje z newslettera na podstawie adresu e-mail (dla formularza na stronie)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email) {
            return NextResponse.json({ error: "Email jest wymagany" }, { status: 400 })
        }

        const subscription = await prisma.newsletter.findUnique({
            where: { email }
        })

        if (!subscription) {
            // Nie informujemy czy email istniał ze względów bezpieczeństwa, 
            // ale tu newsletter więc można powiedzieć że nie znaleziono
            return NextResponse.json({ error: "Nie znaleziono subskrypcji dla podanego adresu e-mail" }, { status: 404 })
        }

        if (!subscription.aktywny) {
            return NextResponse.json({ message: "Ten adres e-mail jest już wypisany z newslettera" }, { status: 200 })
        }

        await prisma.newsletter.update({
            where: { email },
            data: {
                aktywny: false,
                dataRezygnacji: new Date()
            }
        })

        return NextResponse.json({ message: "Zostałeś pomyślnie wypisany z newslettera" }, { status: 200 })
    } catch (error) {
        console.error("Error unsubscribing from newsletter:", error)
        return NextResponse.json({ error: "Wystąpił błąd podczas wypisywania z newslettera" }, { status: 500 })
    }
}
