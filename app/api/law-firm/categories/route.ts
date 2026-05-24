import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasActivePackage } from "@/lib/permissions"

async function getMaxCategories(userId: string) {
  const lawFirm = await prisma.lawFirm.findUnique({
    where: { userId },
    select: {
      id: true,
      pakietSubskrypcji: true,
      dataPakietuOd: true,
      dataPakietuDo: true,
      autoRenewal: true,
    },
  })

  if (!lawFirm) return 10

  let maxCategories = 10

  // 1. Pobierz domyślny limit z ustawień globalnych
  const settings = await prisma.settings.findUnique({
    where: { key: "maxLawFirmCategories" }
  })
  if (settings) {
    maxCategories = parseInt(settings.value) || 10
  }

  // 2. Jeśli użytkownik ma aktywny pakiet, nadpisz limit wartością z pakietu
  if (lawFirm.pakietSubskrypcji && hasActivePackage(lawFirm as any)) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { typ: lawFirm.pakietSubskrypcji }
    })
    
    if (plan) {
      if (plan.kategorieSpraw === null) {
        maxCategories = 999 // Brak limitu
      } else {
        maxCategories = plan.kategorieSpraw
      }
    }
  }

  return maxCategories
}

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

    // Get max categories
    const maxCategories = await getMaxCategories(session.user.id)

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
      maxCategories,
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
    const { categories, mainCategoryId } = body

    if (!Array.isArray(categories)) {
      return NextResponse.json({ error: "Invalid categories data" }, { status: 400 })
    }

    // Sprawdź limit kategorii
    const maxCategories = await getMaxCategories(session.user.id)
    if (categories.length > maxCategories) {
      return NextResponse.json(
        { error: `Przekroczono maksymalną liczbę kategorii (${maxCategories}).` },
        { status: 400 }
      )
    }

    const activeMainCategoryId = mainCategoryId !== undefined ? mainCategoryId : lawFirm.mainCategoryId

    // Sprawdź czy główna kategoria jest na liście i czy jest rodzicem
    if (activeMainCategoryId) {
      const hasMainCategory = categories.some(cat => cat.categoryId === activeMainCategoryId)
      if (!hasMainCategory) {
        return NextResponse.json(
          { error: "Główna kategoria musi być na liście wybranych kategorii" },
          { status: 400 }
        )
      }

      const categoryToCheck = await prisma.category.findUnique({
        where: { id: activeMainCategoryId },
        select: { parentId: true }
      })
      if (!categoryToCheck) {
        return NextResponse.json(
          { error: "Wybrana kategoria główna nie istnieje" },
          { status: 400 }
        )
      }
      if (categoryToCheck.parentId !== null) {
        return NextResponse.json(
          { error: "Główną kategorią może być tylko kategoria nadrzędna (rodzic)" },
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

    // Zapisz nową główną kategorię w bazie jeśli uległa zmianie
    if (mainCategoryId !== undefined && mainCategoryId !== lawFirm.mainCategoryId) {
      await prisma.lawFirm.update({
        where: { id: lawFirm.id },
        data: { mainCategoryId: mainCategoryId },
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
      mainCategoryId: mainCategoryId !== undefined ? mainCategoryId : lawFirm.mainCategoryId,
      maxCategories,
    })
  } catch (error) {
    console.error("Error updating law firm categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

