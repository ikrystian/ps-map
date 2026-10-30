import { auth } from "@/lib/auth"
import { addLike, getLikeState, removeLike, resolveLikeViewer } from "@/lib/blog-likes"
import { publishedBlogPostWhere } from "@/lib/blog-posts"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { NextRequest, NextResponse } from "next/server"

type RouteContext = { params: Promise<{ slug: string }> }

// Polecenia dotyczą wyłącznie opublikowanych wpisów
async function findPublishedPost(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, ...publishedBlogPostWhere() },
    select: { id: true },
  })
}

// Odpowiedzi zależą od czytelnika (konto/IP) — nigdy nie mogą trafić do współdzielonego cache
const noStore = { "Cache-Control": "no-store" }

// GET /api/blog/posts/[slug]/like - Liczba poleceń wpisu i informacja, czy bieżący czytelnik już go polecił
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params
    const post = await findPublishedPost(slug)
    if (!post) {
      return NextResponse.json({ error: "Wpis nie znaleziony" }, { status: 404 })
    }

    const session = await auth()
    const state = await getLikeState(post.id, resolveLikeViewer(request, session?.user?.id))
    return NextResponse.json(state, { headers: noStore })
  } catch (error) {
    console.error("Error fetching blog post likes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function mutateLike(request: NextRequest, { params }: RouteContext, action: "add" | "remove") {
  try {
    // Rate limiting: polecanie/cofanie to akcje zapisu — max 30 na minutę z jednego IP
    const rl = rateLimit(`blog-like:${getClientIp(request)}`, { limit: 30, windowMs: 60 * 1000 })
    if (!rl.success) {
      return tooManyRequestsResponse(rl.retryAfterSeconds) as NextResponse
    }

    const { slug } = await params
    const post = await findPublishedPost(slug)
    if (!post) {
      return NextResponse.json({ error: "Wpis nie znaleziony" }, { status: 404 })
    }

    const session = await auth()
    const viewer = resolveLikeViewer(request, session?.user?.id)
    if (!viewer) {
      return NextResponse.json({ error: "Nie udało się zidentyfikować czytelnika" }, { status: 400 })
    }

    if (action === "add") {
      await addLike(post.id, viewer)
    } else {
      await removeLike(post.id, viewer)
    }

    return NextResponse.json(await getLikeState(post.id, viewer), { headers: noStore })
  } catch (error) {
    console.error("Error updating blog post like:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/blog/posts/[slug]/like - Poleca wpis (idempotentnie)
export async function POST(request: NextRequest, context: RouteContext) {
  return mutateLike(request, context, "add")
}

// DELETE /api/blog/posts/[slug]/like - Cofa polecenie wpisu
export async function DELETE(request: NextRequest, context: RouteContext) {
  return mutateLike(request, context, "remove")
}
