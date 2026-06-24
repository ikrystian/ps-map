import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/utils"
import { NextRequest, NextResponse } from "next/server"

// GET /api/law-firms/me/blog - Pobiera wpisy zalogowanej eksperta
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pobierz dane eksperta
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return NextResponse.json(
        { error: "Nie znaleziono profilu eksperta" },
        { status: 404 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Pobierz wpisy eksperta
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: {
          lawFirmId: lawFirm.id,
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({
        where: {
          lawFirmId: lawFirm.id,
        },
      }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching law firm blog posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/law-firms/me/blog - Tworzy nowy wpis dla zalogowanej eksperta
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pobierz dane eksperta
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return NextResponse.json(
        { error: "Nie znaleziono profilu eksperta" },
        { status: 404 }
      )
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

    // Walidacja categoryId jeśli podano
    if (categoryId) {
      const category = await prisma.blogCategory.findUnique({
        where: { id: categoryId },
      })

      if (!category) {
        return NextResponse.json(
          { error: "Wybrana kategoria nie istnieje" },
          { status: 400 }
        )
      }
    }

    // Utwórz wpis
    const post = await prisma.blogPost.create({
      data: {
        tytul,
        slug,
        tresc,
        lawFirmId: lawFirm.id,
        categoryId: categoryId || null,
        tagi: tagi && Array.isArray(tagi) && tagi.length > 0 ? JSON.stringify(tagi) : null,
        obrazekWyrozniajacy,
        metaTitle,
        metaDescription,
        opublikowany: opublikowany || false,
        dataPublikacji: opublikowany ? new Date() : null,
      },
      include: {
        category: true,
        lawFirm: {
          select: {
            id: true,
            nazwa: true,
            nazwa: true,
            logo: true,
          },
        },
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Error creating blog post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
