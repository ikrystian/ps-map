import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
        firstName: true,
        lastName: true,
        phone: true,
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

    if (user.client) {
      user.client = {
        ...user.client,
        imie: user.firstName || '',
        nazwisko: user.lastName || '',
        telefon: user.phone || null,
      } as any
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

export async function DELETE() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nie jesteś zalogowany" },
        { status: 401 }
      )
    }

    // Soft delete - ustaw deletedAt
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        deletedAt: new Date(),
        status: "INACTIVE",
      },
    })

    return NextResponse.json({
      message: "Konto zostało usunięte"
    })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas usuwania konta" },
      { status: 500 }
    )
  }
}
