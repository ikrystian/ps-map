import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/newsletter/confirm?token=...
 * Potwierdza subskrypcję newslettera na podstawie tokenu
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(new URL('/newsletter/potwierdz?error=brak-tokenu', request.url))
    }

    // Znajdź subskrypcję po tokenie
    const subscription = await prisma.newsletter.findUnique({
      where: { tokenPotwierdzajacy: token },
    })

    if (!subscription) {
      return NextResponse.redirect(new URL('/newsletter/potwierdz?error=nieprawidlowy-token', request.url))
    }

    // Zaktualizuj subskrypcję - oznacz jako potwierdzoną i aktywną
    await prisma.newsletter.update({
      where: { id: subscription.id },
      data: {
        potwierdzony: true,
        aktywny: true,
        dataPotwierdzenia: new Date(),
        tokenPotwierdzajacy: null, // Wyczyszczenie tokenu po użyciu
      },
    })

    return NextResponse.redirect(new URL('/newsletter/potwierdz?status=sukces', request.url))
  } catch (error) {
    console.error("Newsletter confirmation error:", error)
    return NextResponse.redirect(new URL('/newsletter/potwierdz?error=blad-serwera', request.url))
  }
}
