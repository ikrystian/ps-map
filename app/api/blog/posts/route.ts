import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/blog/posts - Pobiera wszystkie opublikowane wpisy (publiczne)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const categoryId = searchParams.get("categoryId")
    const lawFirmId = searchParams.get("lawFirmId")
    const search = searchParams.get("search")
    const skip = (page - 1) * limit

    // Buduj warunki filtrowania
    const where: any = {
      opublikowany: true,
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (lawFirmId) {
      where.lawFirmId = lawFirmId
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
          category: true,
          lawFirm: {
            select: {
              id: true,
              nazwa: true,
              nazwaFirmy: true,
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
