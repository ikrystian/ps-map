import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/blog/posts/[slug] - Pobiera pojedynczy opublikowany wpis (lub podgląd nieopublikowanego dla autora/admina)
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
        category: {
          include: {
            parent: {
              select: {
                id: true,
                nazwa: true,
                slug: true,
                parent: {
                  select: { id: true, nazwa: true, slug: true },
                },
              },
            },
          },
        },
        lawFirm: {
          select: {
            id: true,
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

    // Sprawdź czy wpis jest opublikowany (zaplanowane lub nieopublikowane wpisy są widoczne tylko dla autora/admina)
    const isUnpublished = !post.opublikowany || (post.dataPublikacji && post.dataPublikacji > new Date())
    if (isUnpublished) {
      const session = await auth()
      let isAuthor = false

      if (session?.user) {
        if (session.user.role === "ADMIN") {
          isAuthor = true
        } else if (session.user.role === "LAW_FIRM") {
          const lawFirm = await prisma.lawFirm.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
          })
          if (lawFirm && post.lawFirmId === lawFirm.id) {
            isAuthor = true
          }
        }
      }

      if (!isAuthor) {
        return NextResponse.json({ error: "Wpis nie jest dostępny" }, { status: 404 })
      }
    }

    // Zwiększ licznik wyświetleń tylko dla faktycznie opublikowanych wpisów
    if (!isUnpublished) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          wyswietlenia: post.wyswietlenia + 1,
        },
      })
    }

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
