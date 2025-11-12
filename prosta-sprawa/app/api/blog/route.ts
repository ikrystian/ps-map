import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/utils"

// GET /api/blog - Pobiera wpisy zalogowanej kancelarii
export async function GET(request: NextRequest) {
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

    // Pobierz wszystkie wpisy kancelarii
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

// POST /api/blog - Tworzy nowy wpis dla zalogowanej kancelarii
export async function POST(request: NextRequest) {
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
