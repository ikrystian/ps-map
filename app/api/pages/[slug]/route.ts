import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/pages/[slug] - Get a published page by slug (PUBLIC)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const page = await prisma.page.findFirst({
      where: {
        slug,
        published: true,
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

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error("Error fetching page:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
