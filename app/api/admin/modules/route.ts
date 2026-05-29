import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/modules - Fetch all modules (ADMIN only)
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

    // Build where clause for filters
    const where: any = {}

    // Search by name or description
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    // Fetch modules
    const [modules, total] = await Promise.all([
      prisma.module.findMany({
        where,
        include: {
          _count: {
            select: {
              pageModules: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.module.count({ where }),
    ])

    return NextResponse.json({
      modules,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching modules:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/modules - Create a new module (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, code, description, preview, active, type } = body

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      )
    }

    // Validate type if provided
    if (type && !['TEMPLATE', 'EDITABLE_HTML'].includes(type)) {
      return NextResponse.json(
        { error: "Invalid module type" },
        { status: 400 }
      )
    }

    // Create module
    const module = await prisma.module.create({
      data: {
        name,
        code,
        description: description || null,
        preview: preview || null,
        active: active !== undefined ? active : true,
        type: type || 'TEMPLATE',
      },
    })

    return NextResponse.json(module, { status: 201 })
  } catch (error) {
    console.error("Error creating module:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
