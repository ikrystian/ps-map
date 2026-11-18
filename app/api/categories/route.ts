import { serverCache } from "@/lib/cache"
import { getCategoriesList, parseExpertiseCategoryIds, toCompactCategory } from "@/lib/categories"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// `?compact=1` — bez długich opisów i metadanych SEO (nagłówek serwisu, strona główna).
// Pełna lista zostaje dla rejestracji, kategorii i wyszukiwarki.
export async function GET(request: NextRequest) {
  try {
    const all = await getCategoriesList()
    const categories = request.nextUrl.searchParams.get("compact") === "1"
      ? all.map(toCompactCategory)
      : all

    // Publiczne, rzadko zmieniane dane — cache na CDN/proxy (przeglądarka zawsze pyta o świeżość).
    return NextResponse.json(categories, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600" },
    })
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
      expertiseCategoryIds,
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

    const expertiseIds = await parseExpertiseCategoryIds(expertiseCategoryIds)
    if (!expertiseIds.ok) {
      return NextResponse.json({ error: expertiseIds.error }, { status: 400 })
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
        ...(expertiseIds.ids
          ? {
              expertiseLinks: {
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

