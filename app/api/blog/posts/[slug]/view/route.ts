import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// POST /api/blog/posts/[slug]/view - Zlicza wyświetlenie opublikowanego wpisu.
// Wywoływane z klienta (beacon po zamontowaniu strony), niezależnie od
// server-side renderu treści artykułu, żeby licznik odzwierciedlał
// realne odsłony mimo statycznego/ISR cache'owania strony.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, opublikowany: true, dataPublikacji: true },
    })

    const isPublished =
      post?.opublikowany && (!post.dataPublikacji || post.dataPublikacji <= new Date())

    if (!post || !isPublished) {
      return NextResponse.json({ success: false }, { status: 404 })
    }

    await prisma.blogPost.update({
      where: { id: post.id },
      data: { wyswietlenia: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking blog post view:", error)
    return NextResponse.json({ error: "Błąd podczas śledzenia wyświetlenia" }, { status: 500 })
  }
}
