import {
  AccountAlreadyAnonymizedError,
  AccountAnonymizationForbiddenError,
  anonymizeUserAccount,
} from "@/lib/account-anonymization"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nie jesteś zalogowany" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
        lastLogin: true,
        client: true,
        lawFirm: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Użytkownik nie znaleziony" },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nie jesteś zalogowany" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, image } = body

    // Przygotuj dane do aktualizacji
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (image !== undefined) updateData.image = image

    // Zaktualizuj użytkownika
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
        lastLogin: true,
      },
    })

    return NextResponse.json({
      message: "Dane użytkownika zostały zaktualizowane",
      user: updatedUser
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas aktualizacji" },
      { status: 500 }
    )
  }
}

/**
 * Usunięcie konta = anonimizacja danych osobowych (RODO art. 17).
 * Dane, których przechowywania wymagają przepisy prawa (faktury, dowody
 * księgowe, dokumentacja transakcji), zostają zachowane do końca okresu
 * retencji — szczegóły w `lib/account-anonymization.ts`.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nie jesteś zalogowany" },
        { status: 401 }
      )
    }

    // Konto administratora usuwa wyłącznie inny administrator z panelu.
    if (session.user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Konto administratora może usunąć wyłącznie inny administrator" },
        { status: 403 }
      )
    }

    // Sesja przejęta (impersonacja) nie może usunąć cudzego konta.
    if (session.impersonatorId) {
      return NextResponse.json(
        { error: "Nie można usunąć konta podczas sesji przejętej przez administratora" },
        { status: 403 }
      )
    }

    let reason: string | null = null
    try {
      const body = await request.json()
      if (typeof body?.reason === "string") reason = body.reason.slice(0, 500)
    } catch {
      // Brak treści żądania jest dopuszczalny — powód jest opcjonalny.
    }

    const result = await anonymizeUserAccount({
      userId: session.user.id,
      requestedBy: "SELF",
      reason,
    })

    return NextResponse.json({
      message: "Konto zostało usunięte, a dane osobowe zanonimizowane",
      retentionUntil: result.retentionUntil,
      legalBasis: result.legalBasis,
    })
  } catch (error) {
    if (error instanceof AccountAlreadyAnonymizedError) {
      return NextResponse.json({ error: "Konto zostało już usunięte" }, { status: 409 })
    }
    if (error instanceof AccountAnonymizationForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error("Delete user error:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas usuwania konta" },
      { status: 500 }
    )
  }
}
