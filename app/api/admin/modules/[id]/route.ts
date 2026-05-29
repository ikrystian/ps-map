import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/modules/[id] - Get a single module (ADMIN only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const module = await prisma.module.findUnique({
      where: { id },
      include: {
        pageModules: {
          include: {
            page: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    return NextResponse.json(module)
  } catch (error) {
    console.error("Error fetching module:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/admin/modules/[id] - Update a module (ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, code, description, preview, active } = body

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      )
    }

    // Check if module exists
    const existingModule = await prisma.module.findUnique({
      where: { id },
    })

    if (!existingModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    // Update module
    const module = await prisma.module.update({
      where: { id },
      data: {
        name,
        code,
        description: description || null,
        preview: preview || null,
        active: active !== undefined ? active : true,
      },
    })

    return NextResponse.json(module)
  } catch (error) {
    console.error("Error updating module:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/modules/[id] - Delete a module (ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if module exists
    const existingModule = await prisma.module.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            pageModules: true,
          },
        },
      },
    })

    if (!existingModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    // Check if module is used in any pages
    if (existingModule._count.pageModules > 0) {
      return NextResponse.json(
        { error: `Cannot delete module. It is used in ${existingModule._count.pageModules} page(s)` },
        { status: 400 }
      )
    }

    // Delete module
    await prisma.module.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Module deleted successfully" })
  } catch (error) {
    console.error("Error deleting module:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
