import { requireFeature } from "@/lib/api-permissions"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/utils"
import { NextRequest, NextResponse } from "next/server"

// GET /api/blog - Pobiera wpisy zalogowanej eksperta
export async function GET(request: NextRequest) {
  try {
    // Sprawdź uprawnienia do bloga (tylko BIZNES)
    const result = await requireFeature("canAccessBlog")
    if (result instanceof NextResponse) return result
    const { lawFirm } = result

    // Pobierz wszystkie wpisy eksperta
    const posts = await prisma.blogPost.findMany({
      where: {
        lawFirmId: lawFirm.id,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/blog - Tworzy nowy wpis dla zalogowanej eksperta
export async function POST(request: NextRequest) {
  try {
    // Sprawdź uprawnienia do bloga (tylko BIZNES)
    const result = await requireFeature("canAccessBlog")
    if (result instanceof NextResponse) return result
    const { lawFirm } = result

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

    // Sprawdź czy slug jest unikalny
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    })

    if (existingPost) {
      return NextResponse.json(
        { error: "Wpis z tym slugiem już istnieje" },
        { status: 409 }
      )
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

    const post = await prisma.blogPost.create({
      data: {
        lawFirmId: lawFirm.id,
        tytul,
        slug,
        tresc,
        categoryId: categoryId || null,
        tagi,
        obrazekWyrozniajacy,
        metaTitle,
        metaDescription,
        opublikowany: opublikowany || false,
        dataPublikacji: opublikowany ? new Date() : null,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Error creating blog post:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
