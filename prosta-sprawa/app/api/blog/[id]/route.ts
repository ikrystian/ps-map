import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/utils"

// GET /api/blog/[id] - Pobiera wpis do edycji
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pobierz kancelarię
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Kancelaria nie znaleziona" }, { status: 404 })
    }

    // Pobierz wpis
    const post = await prisma.blogPost.findUnique({
      where: { id: params.id },
      include: {
        category: true,
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Wpis nie znaleziony" }, { status: 404 })
    }

    // Sprawdź czy wpis należy do tej kancelarii
    if (post.lawFirmId !== lawFirm.id) {
      return NextResponse.json({ error: "Brak dostępu do tego wpisu" }, { status: 403 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/blog/[id] - Aktualizuje wpis
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pobierz kancelarię
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Kancelaria nie znaleziona" }, { status: 404 })
    }

    // Pobierz istniejący wpis
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: params.id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: "Wpis nie znaleziony" }, { status: 404 })
    }

    // Sprawdź czy wpis należy do tej kancelarii
    if (existingPost.lawFirmId !== lawFirm.id) {
      return NextResponse.json({ error: "Brak dostępu do tego wpisu" }, { status: 403 })
    }

    const body = await request.json()
    const {
      tytul,
      slug: customSlug,
      tresc,
      categoryId,
      tagi,
      obrazekWyrozniajacy,
      metaTitle,
      metaDescription,
      opublikowany,
    } = body

    // Walidacja
    if (!tytul || !tresc) {
      return NextResponse.json(
        { error: "Tytuł i treść są wymagane" },
        { status: 400 }
      )
    }

    // Generuj slug lub użyj podanego
    const slug = customSlug || generateSlug(tytul)

    // Sprawdź czy slug jest unikalny (oprócz aktualnego wpisu)
    if (slug !== existingPost.slug) {
      const duplicateSlug = await prisma.blogPost.findUnique({
        where: { slug },
      })

      if (duplicateSlug) {
        return NextResponse.json(
          { error: "Wpis z tym slugiem już istnieje" },
          { status: 409 }
        )
      }
    }

    // Sprawdź czy kategoria istnieje (jeśli podana)
    if (categoryId) {
      const category = await prisma.blogCategory.findUnique({
        where: { id: categoryId },
      })

      if (!category) {
        return NextResponse.json(
          { error: "Kategoria nie istnieje" },
          { status: 400 }
        )
      }
    }

    // Jeśli wpis jest publikowany po raz pierwszy, ustaw datę publikacji
    const dataPublikacji = opublikowany && !existingPost.opublikowany
      ? new Date()
      : existingPost.dataPublikacji

    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        tytul,
        slug,
        tresc,
        categoryId: categoryId || null,
        tagi,
        obrazekWyrozniajacy,
        metaTitle,
        metaDescription,
        opublikowany: opublikowany || false,
        dataPublikacji,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error updating blog post:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/blog/[id] - Usuwa wpis
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pobierz kancelarię
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Kancelaria nie znaleziona" }, { status: 404 })
    }

    // Pobierz wpis
    const post = await prisma.blogPost.findUnique({
      where: { id: params.id },
    })

    if (!post) {
      return NextResponse.json({ error: "Wpis nie znaleziony" }, { status: 404 })
    }

    // Sprawdź czy wpis należy do tej kancelarii
    if (post.lawFirmId !== lawFirm.id) {
      return NextResponse.json({ error: "Brak dostępu do tego wpisu" }, { status: 403 })
    }

    await prisma.blogPost.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Wpis został usunięty" })
  } catch (error) {
    console.error("Error deleting blog post:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
