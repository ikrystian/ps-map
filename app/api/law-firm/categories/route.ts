import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get law firm for this user
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        mainCategoryId: true,
      },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    // Get law firm's selected categories
    const lawFirmCategories = await prisma.lawFirmCategory.findMany({
      where: { lawFirmId: lawFirm.id },
      include: {
        category: true,
      },
      orderBy: { kolejnosc: "asc" },
    })

    return NextResponse.json({
      categories: lawFirmCategories,
      mainCategoryId: lawFirm.mainCategoryId,
    })
  } catch (error) {
    console.error("Error fetching law firm categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get law firm for this user
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        mainCategoryId: true,
      },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    const body = await request.json()
    const { categories } = body

    if (!Array.isArray(categories)) {
      return NextResponse.json({ error: "Invalid categories data" }, { status: 400 })
    }

    // Sprawdź czy główna kategoria jest na liście
    if (lawFirm.mainCategoryId) {
      const hasMainCategory = categories.some(cat => cat.categoryId === lawFirm.mainCategoryId)
      if (!hasMainCategory) {
        return NextResponse.json(
          { error: "Główna kategoria musi być na liście wybranych kategorii" },
          { status: 400 }
        )
      }
    }

    // Delete all existing categories for this law firm
    await prisma.lawFirmCategory.deleteMany({
      where: { lawFirmId: lawFirm.id },
    })

    // Create new category associations
    if (categories.length > 0) {
      await prisma.lawFirmCategory.createMany({
        data: categories.map((cat: { categoryId: string; kolejnosc: number }) => ({
          lawFirmId: lawFirm.id,
          categoryId: cat.categoryId,
          kolejnosc: cat.kolejnosc,
        })),
      })
    }

    // Fetch and return updated categories
    const updatedCategories = await prisma.lawFirmCategory.findMany({
      where: { lawFirmId: lawFirm.id },
      include: {
        category: true,
      },
      orderBy: { kolejnosc: "asc" },
    })

    return NextResponse.json({
      categories: updatedCategories,
      mainCategoryId: lawFirm.mainCategoryId,
    })
  } catch (error) {
    console.error("Error updating law firm categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
