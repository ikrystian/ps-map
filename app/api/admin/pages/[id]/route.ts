import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/pages/[id] - Get a single page (ADMIN only)
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

    const page = await prisma.page.findUnique({
      where: { id },
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

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error("Error fetching page:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/admin/pages/[id] - Update a page (ADMIN only)
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
    const { title, slug, metaTitle, metaDescription, published, modules } = body

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      )
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: "Slug must be URL-friendly (lowercase letters, numbers, and hyphens only)" },
        { status: 400 }
      )
    }

    // Check if page exists
    const existingPage = await prisma.page.findUnique({
      where: { id },
    })

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    // Check if slug is taken by another page
    if (slug !== existingPage.slug) {
      const slugTaken = await prisma.page.findUnique({
        where: { slug },
      })

      if (slugTaken) {
        return NextResponse.json(
          { error: "Page with this slug already exists" },
          { status: 409 }
        )
      }
    }

    // Delete existing page modules
    await prisma.pageModule.deleteMany({
      where: { pageId: id },
    })

    // Update page with new modules
    const page = await prisma.page.update({
      where: { id },
      data: {
        title,
        slug,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        published: published || false,
        publishedAt: published && !existingPage.published ? new Date() : existingPage.publishedAt,
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

    return NextResponse.json(page)
  } catch (error) {
    console.error("Error updating page:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/pages/[id] - Delete a page (ADMIN only)
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

    // Check if page exists
    const existingPage = await prisma.page.findUnique({
      where: { id },
    })

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    // Delete page (cascade will delete page modules)
    await prisma.page.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Page deleted successfully" })
  } catch (error) {
    console.error("Error deleting page:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
