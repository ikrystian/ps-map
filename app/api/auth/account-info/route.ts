import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    // Pobierz dane użytkownika
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        createdAt: true,
        lastLogin: true,
      },
    })

    if (!user) {
      return Response.json(
        { error: "Nie znaleziono użytkownika" },
        { status: 404 }
      )
    }

    // Pobierz ostatnie udane logowanie
    const lastSuccessfulLogin = await prisma.loginHistory.findFirst({
      where: {
        userId: session.user.id,
        success: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
        ipAddress: true,
      },
    })

    // Pobierz ostatnie nieudane logowanie
    const lastFailedLogin = await prisma.loginHistory.findFirst({
      where: {
        userId: session.user.id,
        success: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
        ipAddress: true,
      },
    })

    return Response.json({
      createdAt: user.createdAt,
      lastLogin: lastSuccessfulLogin
        ? {
            date: lastSuccessfulLogin.createdAt,
            ipAddress: lastSuccessfulLogin.ipAddress,
          }
        : null,
      lastFailedLogin: lastFailedLogin
        ? {
            date: lastFailedLogin.createdAt,
            ipAddress: lastFailedLogin.ipAddress,
          }
        : null,
    })
  } catch (error) {
    console.error("Error fetching account info:", error)
    return Response.json(
      { error: "Błąd podczas pobierania informacji o koncie" },
      { status: 500 }
    )
  }
}
