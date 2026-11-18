import { auth } from "@/auth"
import { BLOG_POST_STATUSES, BlogPostStatus, getPublicBlogPosts } from "@/lib/blog-posts"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { canManageBlog } from "@/lib/roles"
import { generateSlug } from "@/lib/utils"
import { NextRequest, NextResponse } from "next/server"

const badRequest = (error: string) => NextResponse.json({ error }, { status: 400 })

/** `true`/`false` → boolean, pominięte → undefined, cokolwiek innego → null (błąd). */
function parseBooleanParam(value: string | null): boolean | undefined | null {
  if (value === null || value === "") return undefined
  if (value === "true") return true
  if (value === "false") return false
  return null
}

/**
 * Parametr `status` przyjmuje jeden lub kilka statusów po przecinku
 * (np. `status=draft,scheduled`) albo `all`. Pominięty = ["published"].
 */
function parseStatusParam(value: string | null): BlogPostStatus[] | null {
  if (value === null || value.trim() === "") return null
  const parts = value.split(",").map((part) => part.trim().toLowerCase()).filter(Boolean)
  if (parts.length === 0) return null
  if (parts.includes("all")) return [...BLOG_POST_STATUSES]
  const valid = parts.every((part): part is BlogPostStatus =>
    (BLOG_POST_STATUSES as readonly string[]).includes(part)
  )
  if (!valid) return null
  return Array.from(new Set(parts as BlogPostStatus[]))
}

// GET /api/blog/posts - Lista wpisów bloga.
// Parametry:
//   opublikowany=true|false  — filtr po fladze opublikowany
//   status=published|scheduled|draft|all (lub lista po przecinku) — filtr po statusie
//   includeDrafts=true|false — dodaje szkice (draft) do wyników
// Domyślnie zwracane są wyłącznie opublikowane wpisy. Szkice i zaplanowane wpisy
// wymagają zalogowania: admin/moderator widzi wszystkie, ekspert tylko swoje.
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const opublikowany = parseBooleanParam(searchParams.get("opublikowany"))
    if (opublikowany === null) {
      return badRequest("Parametr 'opublikowany' przyjmuje wartości true lub false.")
    }

    const includeDrafts = parseBooleanParam(searchParams.get("includeDrafts"))
    if (includeDrafts === null) {
      return badRequest("Parametr 'includeDrafts' przyjmuje wartości true lub false.")
    }

    const statusParam = searchParams.get("status")
    const parsedStatuses = parseStatusParam(statusParam)
    if (statusParam !== null && parsedStatuses === null) {
      return badRequest(
        `Parametr 'status' przyjmuje: ${[...BLOG_POST_STATUSES, "all"].join(", ")} (lub listę po przecinku).`
      )
    }

    const statuses: BlogPostStatus[] = [...(parsedStatuses ?? ["published"])]
    if (includeDrafts && !statuses.includes("draft")) {
      statuses.push("draft")
    }

    let lawFirmId = searchParams.get("lawFirmId")

    // Wszystko poza opublikowanymi wpisami wymaga zalogowanego autora lub admina.
    const needsAuth = opublikowany === false || statuses.some((status) => status !== "published")
    if (needsAuth) {
      const session = await auth()
      if (!session?.user) {
        return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 })
      }

      if (!canManageBlog(session.user.role)) {
        if (session.user.role !== "LAW_FIRM") {
          return NextResponse.json({ error: "Brak uprawnień do szkiców wpisów." }, { status: 403 })
        }
        const ownLawFirm = await prisma.lawFirm.findUnique({
          where: { userId: session.user.id },
          select: { id: true },
        })
        if (!ownLawFirm) {
          return NextResponse.json({ error: "Brak uprawnień do szkiców wpisów." }, { status: 403 })
        }
        if (lawFirmId && lawFirmId !== ownLawFirm.id) {
          return NextResponse.json({ error: "Brak uprawnień do wpisów tej kancelarii." }, { status: 403 })
        }
        // Ekspert widzi szkice i zaplanowane wpisy wyłącznie swojej kancelarii.
        lawFirmId = ownLawFirm.id
      }
    }

    const result = await getPublicBlogPosts({
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "12"),
      categoryId: searchParams.get("categoryId"),
      lawFirmId,
      search: searchParams.get("search"),
      sponsored: searchParams.get("sponsored") === "true",
      tag: searchParams.get("tag"),
      sort: searchParams.get("sort") === "popular" ? "popular" : null,
      statuses,
      opublikowany,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { validateUploadedFile } from "@/lib/file-validation"
import { optimizeImage } from "@/lib/image-processor"

/**
 * Pomocnicza funkcja do zapisywania przesłanego pliku lub ciągu Base64 na serwerze
 */
async function processAndSaveImage(
  fileOrBase64: File | string,
  filenameHint?: string
): Promise<string> {
  let buffer: Buffer
  let mimeType: string
  let originalFilename: string

  if (typeof fileOrBase64 !== "string") {
    // Plik z multipart/form-data
    const file = fileOrBase64
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Niedozwolony typ pliku obrazu. Dozwolone: JPEG, PNG, WEBP, GIF.")
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Plik obrazu jest za duży (maksymalnie 5MB).")
    }
    const bytes = await file.arrayBuffer()
    buffer = Buffer.from(bytes)
    mimeType = file.type
    originalFilename = file.name || "image.png"
  } else {
    // Ciąg Base64 lub zwykły URL
    const matches = fileOrBase64.match(/^data:(image\/[a-zA-Z0-9+-]+);base64,(.+)$/)
    if (!matches) {
      // Jeśli to zwykły URL (http/https), zwróć go bez zmian
      return fileOrBase64
    }
    mimeType = matches[1]
    const base64Data = matches[2]
    buffer = Buffer.from(base64Data, "base64")
    if (buffer.length > 5 * 1024 * 1024) {
      throw new Error("Obraz w formacie Base64 jest za duży (maksymalnie 5MB).")
    }
    const ext = mimeType.split("/")[1] || "png"
    originalFilename = filenameHint || `uploaded-image.${ext}`
  }

  // Weryfikacja sygnatury pliku (magic bytes)
  const validation = validateUploadedFile(buffer, originalFilename, ["jpg", "jpeg", "png", "webp", "gif"])
  if (!validation.ok) {
    throw new Error(validation.error || "Nieprawidłowy plik obrazu.")
  }

  // Optymalizacja obrazu (konwersja do WebP, przeskalowanie max 1600px)
  const { buffer: optimizedBuffer, filename: optimizedFilename } = await optimizeImage(
    buffer,
    originalFilename,
    mimeType
  )

  // Utwórz folder w .uploads/images jeśli nie istnieje
  const uploadsDir = path.join(process.cwd(), ".uploads", "images")
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true })
  }

  // Generowanie unikalnej nazwy pliku
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = optimizedFilename.split(".").pop()
  const filename = `${timestamp}-${randomString}.${extension}`
  const filepath = path.join(uploadsDir, filename)

  await writeFile(filepath, optimizedBuffer)

  return `/api/uploads/images/${filename}`
}

/**
 * POST /api/blog/posts
 * Publiczny endpoint pozwalający na dodanie nowego wpisu na bloga (również z zaplanowaną datą publikacji i uploadem pliku).
 * Wpis tworzony przez ten endpoint jest ZAWSZE nieopublikowany (opublikowany: false),
 * aby wymagał weryfikacji i akceptacji publikacji przez administratora.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 10 zgłoszeń wpisów na godzinę z jednego IP
    const rl = rateLimit(`blog-post-submit:${getClientIp(request)}`, {
      limit: 10,
      windowMs: 60 * 60 * 1000,
    })
    if (!rl.success) {
      return tooManyRequestsResponse(rl.retryAfterSeconds) as NextResponse
    }

    const contentType = request.headers.get("content-type") || ""

    let tytul: string | undefined
    let tresc: string | undefined
    let customSlug: string | undefined
    let categoryId: string | undefined
    let tagi: any
    let obrazekWyrozniajacyInput: any
    let metaTitle: string | undefined
    let metaDescription: string | undefined
    let lawFirmId: string | undefined
    let isSponsored: any
    let sponsoredLawFirmId: string | undefined
    let dataPublikacjiInput: string | undefined
    let fileInput: File | null = null

    // 1. Parsowanie requestu (dla multipart/form-data lub application/json)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      tytul = formData.get("tytul")?.toString()
      tresc = formData.get("tresc")?.toString()
      customSlug = formData.get("slug")?.toString()
      categoryId = formData.get("categoryId")?.toString()
      tagi = formData.get("tagi")?.toString()
      metaTitle = formData.get("metaTitle")?.toString()
      metaDescription = formData.get("metaDescription")?.toString()
      lawFirmId = formData.get("lawFirmId")?.toString()
      isSponsored = formData.get("isSponsored")?.toString()
      sponsoredLawFirmId = formData.get("sponsoredLawFirmId")?.toString()
      dataPublikacjiInput = formData.get("dataPublikacji")?.toString()

      // Szukanie pliku obrazu w formData
      const possibleFile =
        formData.get("obrazekPlik") ||
        formData.get("file") ||
        formData.get("image") ||
        formData.get("obrazekWyrozniajacy")

      if (possibleFile && typeof possibleFile === "object" && "arrayBuffer" in possibleFile) {
        fileInput = possibleFile as File
      } else if (typeof possibleFile === "string") {
        obrazekWyrozniajacyInput = possibleFile
      }
    } else {
      // Zapytanie JSON
      const body = await request.json()
      tytul = body.tytul
      tresc = body.tresc
      customSlug = body.slug
      categoryId = body.categoryId
      tagi = body.tagi
      obrazekWyrozniajacyInput = body.obrazekWyrozniajacy
      metaTitle = body.metaTitle
      metaDescription = body.metaDescription
      lawFirmId = body.lawFirmId
      isSponsored = body.isSponsored
      sponsoredLawFirmId = body.sponsoredLawFirmId
      dataPublikacjiInput = body.dataPublikacji
    }

    // 2. Walidacja wymaganych pól
    if (!tytul || typeof tytul !== "string" || tytul.trim().length === 0) {
      return NextResponse.json(
        { error: "Pole 'tytul' jest wymagane i nie może być puste." },
        { status: 400 }
      )
    }

    if (!tresc || typeof tresc !== "string" || tresc.trim().length === 0) {
      return NextResponse.json(
        { error: "Pole 'tresc' jest wymagane i nie może być puste." },
        { status: 400 }
      )
    }

    // 3. Obsługa pliku obrazka wyróżniającego (z pliku multipart lub z ciągu Base64/URL)
    let finalObrazekUrl: string | null = null
    try {
      if (fileInput) {
        finalObrazekUrl = await processAndSaveImage(fileInput)
      } else if (obrazekWyrozniajacyInput && typeof obrazekWyrozniajacyInput === "string") {
        finalObrazekUrl = await processAndSaveImage(obrazekWyrozniajacyInput)
      }
    } catch (imgError: any) {
      return NextResponse.json(
        { error: imgError.message || "Błąd podczas zapisywania obrazu." },
        { status: 400 }
      )
    }

    // 4. Obsługa planowania publikacji (dataPublikacji)
    let parsedDataPublikacji: Date | null = null
    if (dataPublikacjiInput) {
      const d = new Date(dataPublikacjiInput)
      if (isNaN(d.getTime())) {
        return NextResponse.json(
          { error: "Nieprawidłowy format daty w polu 'dataPublikacji'. Użyj formatu ISO 8601 (np. '2026-08-01T12:00:00Z')." },
          { status: 400 }
        )
      }
      parsedDataPublikacji = d
    }

    // 5. Generowanie i zapewnienie unikalności sluga
    let slug = customSlug ? generateSlug(customSlug) : generateSlug(tytul)
    if (!slug) {
      slug = `wpis-${Date.now()}`
    }

    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    })

    if (existingPost) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`
    }

    // 6. Walidacja kategorii (jeśli przekazana)
    if (categoryId) {
      const category = await prisma.blogCategory.findUnique({
        where: { id: categoryId },
      })
      if (!category) {
        return NextResponse.json(
          { error: `Kategoria o ID '${categoryId}' nie została znaleziona.` },
          { status: 404 }
        )
      }
    }

    // 7. Walidacja autorstwa / sponsorowania
    if (lawFirmId) {
      const lawFirm = await prisma.lawFirm.findUnique({ where: { id: lawFirmId } })
      if (!lawFirm) {
        return NextResponse.json(
          { error: `Kancelaria o ID '${lawFirmId}' nie została znaleziona.` },
          { status: 404 }
        )
      }
    }

    if (sponsoredLawFirmId) {
      const sponsoredLawFirm = await prisma.lawFirm.findUnique({ where: { id: sponsoredLawFirmId } })
      if (!sponsoredLawFirm) {
        return NextResponse.json(
          { error: `Kancelaria sponsorująca o ID '${sponsoredLawFirmId}' nie została znaleziona.` },
          { status: 404 }
        )
      }
    }

    // 8. Formatowanie tagów
    let formattedTagi: string | null = null
    if (tagi) {
      if (Array.isArray(tagi)) {
        formattedTagi = JSON.stringify(tagi)
      } else if (typeof tagi === "string") {
        try {
          const parsed = JSON.parse(tagi)
          formattedTagi = Array.isArray(parsed) ? JSON.stringify(parsed) : JSON.stringify([tagi])
        } catch {
          // Jeśli ciąg rozdzielony przecinkami
          const splitTags = tagi.split(",").map((t) => t.trim()).filter(Boolean)
          formattedTagi = JSON.stringify(splitTags)
        }
      }
    }

    // 9. Zapis do bazy danych
    // Wpis wymaga zatwierdzenia publikacji przez admina (opublikowany: false).
    // Jeśli podano dataPublikacji, data ta zostaje zapisana jako zaplanowany termin.
    const newPost = await prisma.blogPost.create({
      data: {
        tytul: tytul.trim(),
        slug,
        tresc: tresc.trim(),
        categoryId: categoryId || null,
        tagi: formattedTagi,
        obrazekWyrozniajacy: finalObrazekUrl,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        lawFirmId: lawFirmId || null,
        isSponsored: isSponsored === true || isSponsored === "true",
        sponsoredLawFirmId: sponsoredLawFirmId || null,
        opublikowany: false, // Oczekuje na zatwierdzenie/publikację przez admina
        dataPublikacji: parsedDataPublikacji,
      },
      include: {
        category: {
          select: {
            id: true,
            nazwa: true,
            slug: true,
          },
        },
        lawFirm: {
          select: {
            id: true,
            nazwa: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: parsedDataPublikacji
          ? `Wpis został zgłoszony i zaplanowany na datę ${parsedDataPublikacji.toISOString()}. Oczekuje na akceptację przez administratora.`
          : "Wpis został pomyślnie dodany i oczekuje na weryfikację oraz publikację przez administratora.",
        post: newPost,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating public blog post:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd serwera podczas dodawania wpisu." },
      { status: 500 }
    )
  }
}


