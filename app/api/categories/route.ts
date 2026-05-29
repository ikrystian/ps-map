import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrSetCached, serverCache } from "@/lib/cache"

export async function GET() {
  try {
    const categories = await getOrSetCached(
      "categories:all",
      async () => {
        return await prisma.category.findMany({
          select: {
            id: true,
            nazwa: true,
            slug: true,
            opis: true,
            opisDodatkowy: true,
            ikona: true,
            ikonaUrl: true,
            backgroundImageUrl: true,
            typ: true,
            parentId: true,
            metaTitle: true,
            metaDescription: true,
            aktywna: true,
            kolejnosc: true,
            wyswietlajNaGlownejPrywatne: true,
            wyswietlajNaGlownejFirmowe: true,
            createdAt: true,
            updatedAt: true,
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
                slug: true,
                ikona: true,
                ikonaUrl: true,
                _count: {
                  select: {
                    lawFirms: true,
                    cases: true,
                  },
                },
              },
            },
            _count: {
              select: {
                lawFirms: true,
                cases: true,
              },
            },
          },
          orderBy: [
            { kolejnosc: "asc" },
            { nazwa: "asc" },
          ],
        })
      },
      7200 // Cache categories for 2 hours
    )

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

