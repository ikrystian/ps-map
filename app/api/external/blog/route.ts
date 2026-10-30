import { verifyBlogApiAuth } from "@/lib/blog-api-auth"
import { blogEditStamp } from "@/lib/blog-posts"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { generateSlug } from "@/lib/utils"
import { NextRequest, NextResponse } from "next/server"

const MAX_TITLE_LENGTH = 300
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const badRequest = (error: string) => NextResponse.json({ error }, { status: 400 })

/** Pole opcjonalne: pominięte/null/"" → null, w przeciwnym razie musi być niepustym tekstem. */
function optionalString(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === "") return null
  return typeof value === "string" ? value.trim() || null : undefined
}

// POST /api/external/blog - Dodaje wpis bloga przez API (autoryzacja sekretem z Ustawień admina)
// Autorem wpisu jest moderator wskazany w body (`authorId`) — zapisywany jak edytujący w historii wpisu.
export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(`blog-api:${getClientIp(request)}`, { limit: 60, windowMs: 60 * 1000 })
    if (!rl.success) return tooManyRequestsResponse(rl.retryAfterSeconds)

    const authError = await verifyBlogApiAuth(request)
    if (authError) return authError

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return badRequest("Treść żądania musi być obiektem JSON")
    }

    const { authorId, tytul, slug: customSlug, tresc, categoryId, tagi, opublikowany, dataPublikacji } = body

    if (typeof authorId !== "string" || !authorId.trim()) {
      return badRequest("authorId jest wymagane (ID użytkownika o roli MODERATOR)")
    }
    if (typeof tytul !== "string" || !tytul.trim() || typeof tresc !== "string" || !tresc.trim()) {
      return badRequest("Tytuł i treść są wymagane")
    }
    if (tytul.trim().length > MAX_TITLE_LENGTH) {
      return badRequest(`Tytuł może mieć maksymalnie ${MAX_TITLE_LENGTH} znaków`)
    }

    const metaTitle = optionalString(body.metaTitle)
    const metaDescription = optionalString(body.metaDescription)
    const obrazekWyrozniajacy = optionalString(body.obrazekWyrozniajacy)
    if (metaTitle === undefined || metaDescription === undefined || obrazekWyrozniajacy === undefined) {
      return badRequest("metaTitle, metaDescription i obrazekWyrozniajacy muszą być tekstem")
    }
    // Adres trafia do <img src> i meta og:image — dopuszczamy tylko http(s) i ścieżki względne.
    if (obrazekWyrozniajacy && !/^(https?:\/\/|\/(?!\/))/i.test(obrazekWyrozniajacy)) {
      return badRequest("obrazekWyrozniajacy musi być adresem http(s) lub ścieżką zaczynającą się od /")
    }

    if (tagi !== undefined && tagi !== null && (!Array.isArray(tagi) || tagi.some((tag) => typeof tag !== "string"))) {
      return badRequest("tagi muszą być tablicą tekstów")
    }
    const tags = ((tagi as string[] | null | undefined) ?? []).map((tag) => tag.trim()).filter(Boolean)

    if (opublikowany !== undefined && typeof opublikowany !== "boolean") {
      return badRequest("opublikowany musi mieć wartość true lub false")
    }
    const isPublished = opublikowany === true

    const scheduledDate = dataPublikacji ? new Date(dataPublikacji) : null
    if (scheduledDate && isNaN(scheduledDate.getTime())) {
      return badRequest("Nieprawidłowa data publikacji")
    }

    if (customSlug !== undefined && customSlug !== null && customSlug !== "") {
      if (typeof customSlug !== "string" || !SLUG_PATTERN.test(customSlug)) {
        return badRequest("slug może zawierać tylko małe litery a-z, cyfry i pojedyncze myślniki")
      }
    }
    const slug = customSlug || generateSlug(tytul)
    if (!slug) {
      return badRequest("Nie udało się wygenerować sluga z tytułu — podaj slug ręcznie")
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

    if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
      const category =
        typeof categoryId === "string"
          ? await prisma.blogCategory.findUnique({ where: { id: categoryId }, select: { id: true } })
          : null
      if (!category) return badRequest("Wybrana kategoria nie istnieje")
    }

    const existingPost = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } })
    if (existingPost) {
      return NextResponse.json({ error: "Wpis z tym slugiem już istnieje" }, { status: 409 })
    }

    const post = await prisma.blogPost.create({
      data: {
        tytul: tytul.trim(),
        slug,
        tresc,
        lawFirmId: null,
        categoryId: categoryId || null,
        tagi: tags.length > 0 ? JSON.stringify(tags) : null,
        obrazekWyrozniajacy,
        metaTitle,
        metaDescription,
        opublikowany: isPublished,
        // Przyszła data = publikacja zaplanowana (wpis stanie się widoczny po jej nadejściu)
        dataPublikacji: isPublished ? (scheduledDate ?? new Date()) : null,
        ...blogEditStamp(author),
      },
      select: {
        id: true,
        tytul: true,
        slug: true,
        categoryId: true,
        opublikowany: true,
        dataPublikacji: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ ...post, path: `/blog/${post.slug}` }, { status: 201 })
  } catch (error) {
    console.error("Error creating blog post via API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
