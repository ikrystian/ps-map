import { auth } from "@/lib/auth"
import { BLOG_EDIT_HISTORY_LIMIT } from "@/lib/blog-edit-history"
import { editorDisplayName } from "@/lib/blog-posts"
import { prisma } from "@/lib/prisma"
import { canManageBlog } from "@/lib/roles"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/blog/[id]/edits - Historia edycji wpisu z nazwami kont edytujących (ADMIN i MODERATOR)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || !canManageBlog(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const post = await prisma.blogPost.findUnique({ where: { id }, select: { id: true } })
    if (!post) {
      return NextResponse.json({ error: "Wpis nie znaleziony" }, { status: 404 })
    }

    const [edits, total] = await Promise.all([
      prisma.blogPostEdit.findMany({
        where: { postId: id },
        orderBy: { createdAt: "desc" },
        take: BLOG_EDIT_HISTORY_LIMIT,
        select: {
          id: true,
          createdAt: true,
          editorRole: true,
          editor: { select: { name: true, imie: true, nazwisko: true, email: true } },
        },
      }),
      prisma.blogPostEdit.count({ where: { postId: id } }),
    ])

    return NextResponse.json({
      total,
      edits: edits.map(({ editor, editorRole, ...edit }) => ({
        ...edit,
        role: editorRole,
        name: editorDisplayName(editor),
      })),
    })
  } catch (error) {
    console.error("Error fetching blog post edit history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
