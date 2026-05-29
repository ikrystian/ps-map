import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/pages - Fetch all pages (ADMIN only)
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
    const published = searchParams.get("published")

    // Build where clause for filters
    const where: any = {}

    // Search by title or slug
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
      ]
    }

    // Filter by published status
    if (published !== null && published !== "") {
      where.published = published === "true"
    }

    // Fetch pages
    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        include: {
          modules: {
            include: {
              module: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.page.count({ where }),
    ])

    return NextResponse.json({
      pages,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching pages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/pages - Create a new page (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, metaTitle, metaDescription, published, modules } = body

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      )
    }

    // Validate slug format (URL-friendly)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: "Slug must be URL-friendly (lowercase letters, numbers, and hyphens only)" },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingPage = await prisma.page.findUnique({
      where: { slug },
    })

    if (existingPage) {
      return NextResponse.json(
        { error: "Page with this slug already exists" },
        { status: 409 }
      )
    }

    // Create page with modules
    const page = await prisma.page.create({
      data: {
        title,
        slug,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        published: published || false,
        publishedAt: published ? new Date() : null,
        modules: modules && modules.length > 0 ? {
          create: modules.map((mod: any, index: number) => ({
            moduleId: mod.moduleId,
            order: index,
            data: mod.data ? JSON.stringify(mod.data) : null,
          })),
        } : undefined,
      },
      include: {
        modules: {
          include: {
            module: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    console.error("Error creating page:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
