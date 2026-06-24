import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

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
            nazwa: true,
            logo: true,
            opis: true,
            slug: true,
            user: {
              select: {
                miasto: true,
                voivodeship: { select: { id: true, nazwa: true, slug: true } },
              },
            },
          },
        },
        sponsoredLawFirm: {
          select: {
            id: true,
            nazwa: true,
            nazwa: true,
            logo: true,
            opis: true,
            slug: true,
            user: {
              select: {
                miasto: true,
                voivodeship: { select: { id: true, nazwa: true } },
              },
            },
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

    // Spłaszcz dane lokalizacyjne kancelarii (przeniesione do modelu User)
    return NextResponse.json({
      ...post,
      lawFirm: post.lawFirm
        ? {
          ...post.lawFirm,
          miasto: post.lawFirm.user?.miasto ?? "",
          voivodeship: post.lawFirm.user?.voivodeship ?? null,
        }
        : post.lawFirm,
      sponsoredLawFirm: post.sponsoredLawFirm
        ? {
          ...post.sponsoredLawFirm,
          miasto: post.sponsoredLawFirm.user?.miasto ?? "",
          voivodeship: post.sponsoredLawFirm.user?.voivodeship ?? null,
        }
        : post.sponsoredLawFirm,
    })
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
