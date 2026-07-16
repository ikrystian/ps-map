import { getCategoryWithDescendantIds } from "@/lib/blog-category-tree"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/blog/posts - Pobiera wszystkie opublikowane wpisy (publiczne)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const categoryId = searchParams.get("categoryId")
    const lawFirmId = searchParams.get("lawFirmId")
    const search = searchParams.get("search")
    const sponsored = searchParams.get("sponsored")
    const tag = searchParams.get("tag")
    const skip = (page - 1) * limit

    // Buduj warunki filtrowania (ukryj wpisy zaplanowane na przyszłość)
    const where: any = {
      opublikowany: true,
      AND: [
        {
          OR: [
            { dataPublikacji: null },
            { dataPublikacji: { lte: new Date() } },
          ],
        },
      ],
    }

    if (sponsored === "true") {
      where.isSponsored = true
    }

    if (categoryId) {
      // Uwzględnij również wpisy z podkategorii wybranej kategorii
      const allCategories = await prisma.blogCategory.findMany({
        select: { id: true, parentId: true },
      })
      where.categoryId = { in: getCategoryWithDescendantIds(allCategories, categoryId) }
    }

    if (lawFirmId) {
      where.lawFirmId = lawFirmId
    }

    if (tag) {
      // Tagi są zapisane jako string JSON (np. ["rozwód","prawo rodzinne"]) —
      // dopasowanie po nazwie tagu w cudzysłowach, aby uniknąć częściowych trafień
      where.tagi = { contains: `"${tag}"` }
    }

    if (search) {
      where.OR = [
        { tytul: { contains: search } },
        { tresc: { contains: search } },
      ]
    }

    // Pobierz wpisy
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          category: {
            include: {
              parent: {
                select: { id: true, nazwa: true, slug: true },
              },
            },
          },
          lawFirm: {
            select: {
              id: true,
              nazwa: true,
              logo: true,
            },
          },
        },
        orderBy: {
          dataPublikacji: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
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
    console.error("Error fetching blog posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
