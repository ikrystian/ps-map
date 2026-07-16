import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/utils"
import { NextResponse } from "next/server"

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
    const { nazwa, slug: customSlug, opis, aktywna, parentId } = body

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

    // Walidacja kategorii nadrzędnej (zapobiega cyklom w hierarchii)
    const newParentId = parentId !== undefined ? parentId || null : existingCategory.parentId

    if (newParentId) {
      if (newParentId === id) {
        return NextResponse.json(
          { error: "Kategoria nie może być swoją własną kategorią nadrzędną" },
          { status: 400 }
        )
      }

      const parentCategory = await prisma.blogCategory.findUnique({
        where: { id: newParentId },
      })

      if (!parentCategory) {
        return NextResponse.json(
          { error: "Kategoria nadrzędna nie istnieje" },
          { status: 400 }
        )
      }

      // Sprawdź czy nowy rodzic nie jest potomkiem edytowanej kategorii
      let ancestorId: string | null = parentCategory.parentId
      while (ancestorId) {
        if (ancestorId === id) {
          return NextResponse.json(
            { error: "Nie można ustawić podkategorii jako kategorii nadrzędnej" },
            { status: 400 }
          )
        }
        const ancestor: { parentId: string | null } | null = await prisma.blogCategory.findUnique({
          where: { id: ancestorId },
          select: { parentId: true },
        })
        ancestorId = ancestor?.parentId ?? null
      }
    }

    const category = await prisma.blogCategory.update({
      where: { id },
      data: {
        nazwa,
        slug,
        opis,
        aktywna: aktywna !== undefined ? aktywna : existingCategory.aktywna,
        parentId: newParentId,
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
            children: true,
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

    // Sprawdź czy kategoria ma podkategorie
    if (category._count.children > 0) {
      return NextResponse.json(
        { error: `Nie można usunąć kategorii. Posiada ${category._count.children} podkategorii(-e)` },
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
