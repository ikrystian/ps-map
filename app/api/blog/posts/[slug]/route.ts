import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/blog/posts/[slug] - Pobiera pojedynczy opublikowany wpis (publiczne)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const post = await prisma.blogPost.findUnique({
      where: {
        slug,
      },
      include: {
        category: true,
        lawFirm: {
          select: {
            id: true,
            nazwa: true,
            nazwaFirmy: true,
            logo: true,
            opis: true,
            miasto: true,
            voivodeship: true,
          },
        },
        comments: {
          where: {
            zatwierdzony: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Wpis nie znaleziony" }, { status: 404 })
    }

    // Sprawdź czy wpis jest opublikowany
    if (!post.opublikowany) {
      return NextResponse.json({ error: "Wpis nie jest dostępny" }, { status: 404 })
    }

    // Zwiększ licznik wyświetleń
    await prisma.blogPost.update({
      where: { id: post.id },
      data: {
        wyswietlenia: post.wyswietlenia + 1,
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
