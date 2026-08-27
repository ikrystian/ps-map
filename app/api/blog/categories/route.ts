import { auth } from "@/lib/auth"
import { getPublicBlogCategories } from "@/lib/blog-categories"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/utils"
import { NextResponse } from "next/server"

// GET /api/blog/categories - Pobiera wszystkie kategorie
// ?public=true - liczy tylko opublikowane wpisy i pomija kategorie bez wpisów
// (kategoria nadrzędna zostaje, jeśli którakolwiek podkategoria ma wpisy)
export async function GET(request: Request) {
  try {
    const publicOnly = new URL(request.url).searchParams.get("public") === "true"

    if (publicOnly) {
      return NextResponse.json(await getPublicBlogCategories())
    }

    const categories = await prisma.blogCategory.findMany({
      where: {
        aktywna: true,
      },
      include: {
        parent: {
          select: {
            id: true,
            nazwa: true,
            slug: true,
            parentId: true,
          },
        },
        _count: {
          select: {
            blogPosts: true,
            children: true,
          },
        },
      },
      orderBy: {
        nazwa: "asc",
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching blog categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/blog/categories - Tworzy nową kategorię (tylko ADMIN)
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { nazwa, slug: customSlug, opis, aktywna, parentId } = body

    if (!nazwa) {
      return NextResponse.json(
        { error: "Nazwa jest wymagana" },
        { status: 400 }
      )
    }

    // Generuj slug lub użyj podanego
    const slug = customSlug || generateSlug(nazwa)

    // Sprawdź czy slug jest unikalny
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { slug },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "Kategoria z tym slugiem już istnieje" },
        { status: 409 }
      )
    }

    // Sprawdź czy kategoria nadrzędna istnieje
    if (parentId) {
      const parentCategory = await prisma.blogCategory.findUnique({
        where: { id: parentId },
      })

      if (!parentCategory) {
        return NextResponse.json(
          { error: "Kategoria nadrzędna nie istnieje" },
          { status: 400 }
        )
      }
    }

    const category = await prisma.blogCategory.create({
      data: {
        nazwa,
        slug,
        opis,
        aktywna: aktywna !== undefined ? aktywna : true,
        parentId: parentId || null,
      },
      include: {
        parent: {
          select: {
            id: true,
            nazwa: true,
            slug: true,
            parentId: true,
          },
        },
        _count: {
          select: {
            blogPosts: true,
            children: true,
          },
        },
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating blog category:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
