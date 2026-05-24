import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/blog - Pobiera wszystkie wpisy (tylko ADMIN) z filtrami i statystykami
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const search = searchParams.get("search") || ""
    const categoryId = searchParams.get("categoryId") || ""
    const status = searchParams.get("status") || "all"
    const sortBy = searchParams.get("sortBy") || "createdAt_desc"

    // Budowanie filtrów
    const where: any = {}

    if (search) {
      where.OR = [
        { tytul: { contains: search } },
        { lawFirm: { nazwa: { contains: search } } },
        { lawFirm: { nazwaFirmy: { contains: search } } },
      ]
    }

    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId
    }

    if (status === "published") {
      where.opublikowany = true
    } else if (status === "draft") {
      where.opublikowany = false
    }

    // Określenie sortowania
    let orderBy: any = { createdAt: "desc" }
    if (sortBy === "createdAt_asc") {
      orderBy = { createdAt: "asc" }
    } else if (sortBy === "wyswietlenia_desc") {
      orderBy = { wyswietlenia: "desc" }
    } else if (sortBy === "wyswietlenia_asc") {
      orderBy = { wyswietlenia: "asc" }
    } else if (sortBy === "tytul_asc") {
      orderBy = { tytul: "asc" }
    } else if (sortBy === "tytul_desc") {
      orderBy = { tytul: "desc" }
    }

    // Pobierz wpisy, ich liczbę oraz globalne statystyki
    const [posts, total, stats] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          category: true,
          lawFirm: {
            select: {
              id: true,
              nazwa: true,
              nazwaFirmy: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
      Promise.all([
        prisma.blogPost.count(),
        prisma.blogPost.count({ where: { opublikowany: true } }),
        prisma.blogPost.count({ where: { opublikowany: false } }),
        prisma.blogPost.aggregate({
          _sum: {
            wyswietlenia: true,
          },
        }),
      ]).then(([totalCount, publishedCount, draftCount, viewsAggregate]) => ({
        total: totalCount,
        published: publishedCount,
        draft: draftCount,
        totalViews: viewsAggregate._sum.wyswietlenia || 0,
      })),
    ])

    return NextResponse.json({
      posts,
      stats,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
