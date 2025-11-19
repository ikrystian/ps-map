import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateSlug } from "@/lib/utils"

// GET /api/blog/categories/[id] - Pobiera pojedynczą kategorię
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const category = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            blogPosts: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Kategoria nie znaleziona" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching blog category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/blog/categories/[id] - Aktualizuje kategorię (tylko ADMIN)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { nazwa, slug: customSlug, opis, aktywna } = body

    if (!nazwa) {
      return NextResponse.json(
        { error: "Nazwa jest wymagana" },
        { status: 400 }
      )
    }

    // Sprawdź czy kategoria istnieje
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Kategoria nie znaleziona" }, { status: 404 })
    }

    // Generuj slug lub użyj podanego
    const slug = customSlug || generateSlug(nazwa)

    // Sprawdź czy slug jest unikalny (oprócz aktualnej kategorii)
    if (slug !== existingCategory.slug) {
      const duplicateSlug = await prisma.blogCategory.findUnique({
        where: { slug },
      })

      if (duplicateSlug) {
        return NextResponse.json(
          { error: "Kategoria z tym slugiem już istnieje" },
          { status: 409 }
        )
      }
    }

    const category = await prisma.blogCategory.update({
      where: { id },
      data: {
        nazwa,
        slug,
        opis,
        aktywna: aktywna !== undefined ? aktywna : existingCategory.aktywna,
      },
      include: {
        _count: {
          select: {
            blogPosts: true,
          },
        },
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating blog category:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/blog/categories/[id] - Usuwa kategorię (tylko ADMIN)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Sprawdź czy kategoria istnieje
    const category = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            blogPosts: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Kategoria nie znaleziona" }, { status: 404 })
    }

    // Sprawdź czy są powiązane wpisy
    if (category._count.blogPosts > 0) {
      return NextResponse.json(
        { error: `Nie można usunąć kategorii. Jest używana przez ${category._count.blogPosts} wpis(ów)` },
        { status: 400 }
      )
    }

    await prisma.blogCategory.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Kategoria została usunięta" })
  } catch (error) {
    console.error("Error deleting blog category:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
