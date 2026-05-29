import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nie jesteś zalogowany" },
        { status: 401 }
      )
    }

    const loginHistory = await prisma.loginHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20, // Zwracamy ostatnie 20 prób logowania
    })

    return NextResponse.json({ loginHistory })
  } catch (error) {
    console.error("Get login history error:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania historii logowań" },
      { status: 500 }
    )
  }
}
