import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// Lista dostawców OAuth połączonych z kontem zalogowanego użytkownika
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
        password: true,
        accounts: { select: { provider: true } },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Nie znaleziono użytkownika" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      providers: [...new Set(user.accounts.map((a) => a.provider))],
      hasPassword: Boolean(user.password),
    })
  } catch (error) {
    console.error("Error fetching connected accounts:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 }
    )
  }
}

// Odłączenie dostawcy OAuth od konta
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nie jesteś zalogowany" },
        { status: 401 }
      )
    }

    const provider = request.nextUrl.searchParams.get("provider")
    if (!provider) {
      return NextResponse.json(
        { error: "Brak parametru provider" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        password: true,
        accounts: { select: { id: true, provider: true } },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Nie znaleziono użytkownika" },
        { status: 404 }
      )
    }

    const hasProvider = user.accounts.some((a) => a.provider === provider)
    if (!hasProvider) {
      return NextResponse.json(
        { error: "To konto nie jest połączone" },
        { status: 400 }
      )
    }

    // Nie pozwól odciąć ostatniej metody logowania
    const otherMethods =
      Boolean(user.password) ||
      user.accounts.some((a) => a.provider !== provider)
    if (!otherMethods) {
      return NextResponse.json(
        {
          error:
            "Nie można odłączyć jedynej metody logowania. Najpierw ustaw hasło do konta.",
        },
        { status: 400 }
      )
    }

    await prisma.account.deleteMany({
      where: { userId: session.user.id, provider },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error disconnecting account:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 }
    )
  }
}
