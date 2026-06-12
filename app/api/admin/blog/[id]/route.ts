import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/utils"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/blog/[id] - Pobiera konkretny wpis (tylko ADMIN)
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

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        category: true,
        lawFirm: {
          select: {
            id: true,
            nazwa: true,
            nazwaFirmy: true,
          },
        },
        sponsoredLawFirm: {
          select: {
            id: true,
            nazwa: true,
            nazwaFirmy: true,
            slug: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Wpis nie znaleziony" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching admin blog post details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
      message: `Wpis "${post.tytul}"${post.lawFirm ? ` eksperta "${post.lawFirm.nazwaFirmy}"` : ""} został usunięty`,
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
    const {
      tytul,
      slug: customSlug,
      tresc,
      categoryId,
      lawFirmId,
      tagi,
      obrazekWyrozniajacy,
      metaTitle,
      metaDescription,
      opublikowany,
      isSponsored,
      sponsoredLawFirmId,
    } = body

    // Sprawdź czy wpis istnieje
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: "Wpis nie znaleziony" }, { status: 404 })
    }

    const data: any = {}

    if (tytul !== undefined) {
      data.tytul = tytul
      if (customSlug === undefined) {
        data.slug = generateSlug(tytul)
      }
    }

    if (customSlug !== undefined) {
      data.slug = customSlug
    }

    // Sprawdź czy slug jest unikalny (jeśli został zmieniony)
    if (data.slug && data.slug !== existingPost.slug) {
      const duplicateSlug = await prisma.blogPost.findUnique({
        where: { slug: data.slug },
      })

      if (duplicateSlug) {
        return NextResponse.json(
          { error: "Wpis z tym slugiem już istnieje" },
          { status: 409 }
        )
      }
    }

    if (tresc !== undefined) {
      data.tresc = tresc
    }

    if (categoryId !== undefined) {
      data.categoryId = categoryId || null
    }

    if (lawFirmId !== undefined) {
      data.lawFirmId = lawFirmId
    }

    if (tagi !== undefined) {
      data.tagi = tagi && Array.isArray(tagi) && tagi.length > 0 ? JSON.stringify(tagi) : null
    }

    if (obrazekWyrozniajacy !== undefined) {
      data.obrazekWyrozniajacy = obrazekWyrozniajacy || null
    }

    if (metaTitle !== undefined) {
      data.metaTitle = metaTitle || null
    }

    if (metaDescription !== undefined) {
      data.metaDescription = metaDescription || null
    }

    if (opublikowany !== undefined) {
      data.opublikowany = opublikowany
      if (opublikowany && !existingPost.opublikowany) {
        data.dataPublikacji = new Date()
      } else if (!opublikowany) {
        data.dataPublikacji = null
      }
    }

    if (isSponsored !== undefined) {
      data.isSponsored = isSponsored
      if (!isSponsored) {
        data.sponsoredLawFirmId = null
      }
    }

    if (sponsoredLawFirmId !== undefined) {
      const activeSponsored = isSponsored !== undefined ? isSponsored : existingPost.isSponsored
      data.sponsoredLawFirmId = activeSponsored ? (sponsoredLawFirmId || null) : null
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
        sponsoredLawFirm: {
          select: {
            id: true,
            nazwa: true,
            nazwaFirmy: true,
            slug: true,
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
