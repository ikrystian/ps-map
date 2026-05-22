import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// DELETE /api/admin/blog/[id] - Usuwa wpis (tylko ADMIN)
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

    // Sprawdź czy wpis istnieje
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        lawFirm: {
          select: {
            nazwa: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Wpis nie znaleziony" }, { status: 404 })
    }

    await prisma.blogPost.delete({
      where: { id },
    })

    return NextResponse.json({
      message: `Wpis "${post.tytul}" kancelarii "${post.lawFirm.nazwa}" został usunięty`,
    })
  } catch (error) {
    console.error("Error deleting blog post:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/blog/[id] - Aktualizuje wpis (tylko ADMIN)
export async function PATCH(
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
    const { opublikowany, categoryId } = body

    // Sprawdź czy wpis istnieje
    const post = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!post) {
      return NextResponse.json({ error: "Wpis nie znaleziony" }, { status: 404 })
    }

    const data: any = {}
    if (opublikowany !== undefined) {
      data.opublikowany = opublikowany
      if (opublikowany) {
        data.dataPublikacji = new Date()
      } else {
        data.dataPublikacji = null
      }
    }
    if (categoryId !== undefined) {
      // Jeśli categoryId to null lub pusta wartość, zapisujemy null w bazie
      data.categoryId = categoryId || null
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data,
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
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("Error updating blog post:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
