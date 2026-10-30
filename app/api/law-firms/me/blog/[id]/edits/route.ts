import { auth } from "@/lib/auth"
import { BLOG_EDIT_HISTORY_LIMIT } from "@/lib/blog-edit-history"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/law-firms/me/blog/[id]/edits - Historia edycji własnego wpisu (bez danych osobowych edytujących — tylko rola i data)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return NextResponse.json(
        { error: "Nie znaleziono profilu eksperta" },
        { status: 404 }
      )
    }

    const { id } = await params

    const post = await prisma.blogPost.findUnique({
      where: { id },
      select: { id: true, lawFirmId: true },
    })

    if (!post) {
      return NextResponse.json({ error: "Wpis nie znaleziony" }, { status: 404 })
    }

    if (post.lawFirmId !== lawFirm.id) {
      return NextResponse.json(
        { error: "Brak uprawnień do tego wpisu" },
        { status: 403 }
      )
    }

    const [edits, total] = await Promise.all([
      prisma.blogPostEdit.findMany({
        where: { postId: id },
        orderBy: { createdAt: "desc" },
        take: BLOG_EDIT_HISTORY_LIMIT,
        select: { id: true, createdAt: true, editorRole: true },
      }),
      prisma.blogPostEdit.count({ where: { postId: id } }),
    ])

    return NextResponse.json({
      total,
      edits: edits.map(({ editorRole, ...edit }) => ({ ...edit, role: editorRole })),
    })
  } catch (error) {
    console.error("Error fetching blog post edit history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
