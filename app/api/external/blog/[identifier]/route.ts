import { verifyBlogApiAuth } from "@/lib/blog-api-auth"
import { blogEditStamp } from "@/lib/blog-posts"
import { MAX_TITLE_LENGTH, SLUG_PATTERN, badRequest, optionalString } from "@/lib/external-blog-input"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { NextRequest, NextResponse } from "next/server"

// PATCH /api/external/blog/[identifier] - Aktualizuje wpis (identifier = ID albo slug).
// Wysyłamy tylko pola do zmiany; pominięte pole zostaje bez zmian, a null/"" czyści pole opcjonalne.
// Autorem zmiany jest moderator wskazany w body (`authorId`) — zapisywany w historii edycji.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const rl = rateLimit(`blog-api:${getClientIp(request)}`, { limit: 60, windowMs: 60 * 1000 })
    if (!rl.success) return tooManyRequestsResponse(rl.retryAfterSeconds)

    const authError = await verifyBlogApiAuth(request)
    if (authError) return authError

    const { identifier } = await params
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return badRequest("Treść żądania musi być obiektem JSON")
    }

    const { authorId } = body
    if (typeof authorId !== "string" || !authorId.trim()) {
      return badRequest("authorId jest wymagane (ID użytkownika o roli MODERATOR)")
    }

    const existing = await prisma.blogPost.findFirst({
      where: { OR: [{ id: identifier }, { slug: identifier }] },
    })
    if (!existing) {
      return NextResponse.json({ error: "Wpis nie znaleziony" }, { status: 404 })
    }

    const author = await prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true, role: true, status: true, deletedAt: true },
    })
    if (!author || author.role !== "MODERATOR") {
      return badRequest("Użytkownik o podanym authorId nie istnieje lub nie ma roli MODERATOR")
    }
    if (author.status !== "ACTIVE" || author.deletedAt) {
      return badRequest("Konto moderatora wskazanego w authorId jest nieaktywne")
    }

    const data: Record<string, unknown> = { ...blogEditStamp(author) }

    if (body.tytul !== undefined) {
      if (typeof body.tytul !== "string" || !body.tytul.trim()) {
        return badRequest("Tytuł nie może być pusty")
      }
      if (body.tytul.trim().length > MAX_TITLE_LENGTH) {
        return badRequest(`Tytuł może mieć maksymalnie ${MAX_TITLE_LENGTH} znaków`)
      }
      data.tytul = body.tytul.trim()
    }

    if (body.tresc !== undefined) {
      if (typeof body.tresc !== "string" || !body.tresc.trim()) {
        return badRequest("Treść nie może być pusta")
      }
      data.tresc = body.tresc
    }

    // Slug zmienia się tylko na wyraźne życzenie — zmiana tytułu nie psuje istniejącego adresu.
    if (body.slug !== undefined) {
      if (typeof body.slug !== "string" || !SLUG_PATTERN.test(body.slug)) {
        return badRequest("slug może zawierać tylko małe litery a-z, cyfry i pojedyncze myślniki")
      }
      if (body.slug !== existing.slug) {
        const duplicate = await prisma.blogPost.findUnique({ where: { slug: body.slug }, select: { id: true } })
        if (duplicate) {
          return NextResponse.json({ error: "Wpis z tym slugiem już istnieje" }, { status: 409 })
        }
      }
      data.slug = body.slug
    }

    if (body.categoryId !== undefined) {
      if (body.categoryId === null || body.categoryId === "") {
        data.categoryId = null
      } else {
        const category =
          typeof body.categoryId === "string"
            ? await prisma.blogCategory.findUnique({ where: { id: body.categoryId }, select: { id: true } })
            : null
        if (!category) return badRequest("Wybrana kategoria nie istnieje")
        data.categoryId = category.id
      }
    }

    if (body.tagi !== undefined) {
      if (body.tagi !== null && (!Array.isArray(body.tagi) || body.tagi.some((tag: unknown) => typeof tag !== "string"))) {
        return badRequest("tagi muszą być tablicą tekstów")
      }
      const tags = ((body.tagi as string[] | null) ?? []).map((tag) => tag.trim()).filter(Boolean)
      data.tagi = tags.length > 0 ? JSON.stringify(tags) : null
    }

    const metaTitle = optionalString(body.metaTitle)
    const metaDescription = optionalString(body.metaDescription)
    const obrazekWyrozniajacy = optionalString(body.obrazekWyrozniajacy)
    if (body.metaTitle !== undefined && metaTitle === undefined) {
      return badRequest("metaTitle musi być tekstem")
    }
    if (body.metaDescription !== undefined && metaDescription === undefined) {
      return badRequest("metaDescription musi być tekstem")
    }
    if (body.obrazekWyrozniajacy !== undefined) {
      if (obrazekWyrozniajacy === undefined) {
        return badRequest("obrazekWyrozniajacy musi być tekstem")
      }
      // Adres trafia do <img src> i meta og:image — dopuszczamy tylko http(s) i ścieżki względne.
      if (obrazekWyrozniajacy && !/^(https?:\/\/|\/(?!\/))/i.test(obrazekWyrozniajacy)) {
        return badRequest("obrazekWyrozniajacy musi być adresem http(s) lub ścieżką zaczynającą się od /")
      }
      data.obrazekWyrozniajacy = obrazekWyrozniajacy
    }
    if (body.metaTitle !== undefined) data.metaTitle = metaTitle
    if (body.metaDescription !== undefined) data.metaDescription = metaDescription

    if (body.opublikowany !== undefined && typeof body.opublikowany !== "boolean") {
      return badRequest("opublikowany musi mieć wartość true lub false")
    }
    const nextPublished = body.opublikowany !== undefined ? body.opublikowany : existing.opublikowany

    const scheduledDate = body.dataPublikacji ? new Date(body.dataPublikacji) : null
    if (scheduledDate && isNaN(scheduledDate.getTime())) {
      return badRequest("Nieprawidłowa data publikacji")
    }

    if (body.opublikowany !== undefined) data.opublikowany = body.opublikowany
    if (!nextPublished) {
      data.dataPublikacji = null
    } else if (scheduledDate) {
      // Przyszła data = publikacja zaplanowana (wpis stanie się widoczny po jej nadejściu)
      data.dataPublikacji = scheduledDate
    } else if (body.opublikowany === true && !existing.opublikowany) {
      // Pierwsza publikacja — data publikacji to moment zapisu
      data.dataPublikacji = new Date()
    }

    const post = await prisma.blogPost.update({
      where: { id: existing.id },
      data,
      select: {
        id: true,
        tytul: true,
        slug: true,
        categoryId: true,
        opublikowany: true,
        dataPublikacji: true,
        lastEditedAt: true,
      },
    })

    return NextResponse.json({ ...post, path: `/blog/${post.slug}` })
  } catch (error) {
    console.error("Error updating blog post via API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
