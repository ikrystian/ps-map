import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateSlug } from "@/lib/utils"

// GET /api/blog/categories - Pobiera wszystkie kategorie
export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      where: {
        aktywna: true,
      },
      include: {
        _count: {
          select: {
            blogPosts: true,
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
    const { nazwa, slug: customSlug, opis, aktywna } = body

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

    const category = await prisma.blogCategory.create({
      data: {
        nazwa,
        slug,
        opis,
        aktywna: aktywna !== undefined ? aktywna : true,
      },
      include: {
        _count: {
          select: {
            blogPosts: true,
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
