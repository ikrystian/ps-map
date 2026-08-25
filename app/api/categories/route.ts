import { serverCache } from "@/lib/cache"
import { getCategoriesList } from "@/lib/categories"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const categories = await getCategoriesList()

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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
    } = body

    // Walidacja podstawowych pól
    if (!nazwa || !slug) {
      return NextResponse.json(
        { error: "Nazwa i slug są wymagane" },
        { status: 400 }
      )
    }

    // Sprawdzenie czy slug jest unikalny
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "Kategoria z tym slugiem już istnieje" },
        { status: 409 }
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

    const category = await prisma.category.create({
      data: {
        nazwa,
        slug,
        opis,
        opisDodatkowy,
        ikona,
        ikonaUrl,
        backgroundImageUrl,
        typ: typ || "SPRAWY_PRYWATNE",
        parentId: parentId || null,
        metaTitle,
        metaDescription,
        aktywna: aktywna !== undefined ? aktywna : true,
        kolejnosc: kolejnosc || 0,
        wyswietlajNaGlownejPrywatne: !!wyswietlajNaGlownejPrywatne,
        wyswietlajNaGlownejFirmowe: !!wyswietlajNaGlownejFirmowe,
      },
      include: {
        parent: {
          select: {
            id: true,
            nazwa: true,
            slug: true,
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

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

