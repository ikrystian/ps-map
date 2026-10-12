import { serverCache } from "@/lib/cache"
import { parseExpertiseCategoryIds } from "@/lib/categories"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            nazwa: true,
          },
        },
        children: {
          select: {
            id: true,
            nazwa: true,
          },
        },
        _count: {
          select: {
            lawFirms: true,
            cases: true,
          },
        },
        expertiseLinks: {
          select: { expertiseCategoryId: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Kategoria nie znaleziona" },
        { status: 404 }
      )
    }

    const { expertiseLinks, ...rest } = category
    return NextResponse.json({
      ...rest,
      expertiseCategoryIds: expertiseLinks.map((link) => link.expertiseCategoryId),
    })
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      nazwa,
      slug,
      opis,
      opisDodatkowy,
      ikona,
      ikonaUrl,
      backgroundImageUrl,
      typ,
      parentId,
      metaTitle,
      metaDescription,
      aktywna,
      kolejnosc,
      wyswietlajNaGlownejPrywatne,
      wyswietlajNaGlownejFirmowe,
      expertiseCategoryIds,
    } = body

    // Sprawdzenie czy kategoria istnieje
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategoria nie znaleziona" },
        { status: 404 }
      )
    }

    // Walidacja podstawowych pól
    if (!nazwa || !slug) {
      return NextResponse.json(
        { error: "Nazwa i slug są wymagane" },
        { status: 400 }
      )
    }

    // Sprawdzenie czy slug jest unikalny (wyłączając aktualną kategorię)
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    })

    if (duplicateCategory) {
      return NextResponse.json(
        { error: "Kategoria z tym slugiem już istnieje" },
        { status: 409 }
      )
    }

    // Sprawdzenie czy nie tworzymy pętli w hierarchii
    if (parentId && parentId === id) {
      return NextResponse.json(
        { error: "Kategoria nie może być sama sobie nadrzędna" },
        { status: 400 }
      )
    }

    // Jeśli parentId jest podany, sprawdź czy kategoria nadrzędna istnieje
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      })

      if (!parentCategory) {
        return NextResponse.json(
          { error: "Kategoria nadrzędna nie istnieje" },
          { status: 400 }
        )
      }
    }

    const expertiseIds = await parseExpertiseCategoryIds(expertiseCategoryIds)
    if (!expertiseIds.ok) {
      return NextResponse.json({ error: expertiseIds.error }, { status: 400 })
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        nazwa,
        slug,
        opis,
        opisDodatkowy,
        ikona,
        ikonaUrl,
        backgroundImageUrl,
        typ: typ !== undefined ? typ : existingCategory.typ,
        parentId: parentId || null,
        metaTitle,
        metaDescription,
        aktywna: aktywna !== undefined ? aktywna : existingCategory.aktywna,
        kolejnosc: kolejnosc !== undefined ? kolejnosc : existingCategory.kolejnosc,
        wyswietlajNaGlownejPrywatne: wyswietlajNaGlownejPrywatne !== undefined ? !!wyswietlajNaGlownejPrywatne : existingCategory.wyswietlajNaGlownejPrywatne,
        wyswietlajNaGlownejFirmowe: wyswietlajNaGlownejFirmowe !== undefined ? !!wyswietlajNaGlownejFirmowe : existingCategory.wyswietlajNaGlownejFirmowe,
        ...(expertiseIds.ids
          ? {
              expertiseLinks: {
                deleteMany: {},
                create: expertiseIds.ids.map((expertiseCategoryId) => ({ expertiseCategoryId })),
              },
            }
          : {}),
      },
      include: {
        parent: {
          select: {
            id: true,
            nazwa: true,
          },
        },
        children: {
          select: {
            id: true,
            nazwa: true,
          },
        },
      },
    })

    // Invalidate categories cache
    serverCache.invalidatePattern("categories")

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Sprawdzenie czy kategoria istnieje
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            lawFirms: true,
            cases: true,
            children: true,
          },
        },
      },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategoria nie znaleziona" },
        { status: 404 }
      )
    }

    // Sprawdzenie czy kategoria ma powiązane dane
    if (
      existingCategory._count.lawFirms > 0 ||
      existingCategory._count.cases > 0 ||
      existingCategory._count.children > 0
    ) {
      return NextResponse.json(
        {
          error: "Nie można usunąć kategorii, która ma powiązani eksperci, sprawy lub podkategorie",
          details: {
            lawFirms: existingCategory._count.lawFirms,
            cases: existingCategory._count.cases,
            children: existingCategory._count.children,
          }
        },
        { status: 409 }
      )
    }

    await prisma.category.delete({
      where: { id },
    })

    // Invalidate categories cache
    serverCache.invalidatePattern("categories")

    return NextResponse.json(
      { message: "Kategoria usunięta pomyślnie" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
