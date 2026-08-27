import { validateUploadedFile } from "@/lib/file-validation"
import { optimizeImage } from "@/lib/image-processor"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import { NextRequest, NextResponse } from "next/server"
import path from "path"

// POST /api/cases/draft-attachments — upload załącznika do sprawy w kreatorze
// /dodaj-sprawe, ZANIM użytkownik ma konto. Celowo bez wymogu sesji (odpowiednik
// /api/upload/document dla anonimowego etapu) — zabezpieczone rate-limitem per IP
// zamiast logowania, z tą samą walidacją sygnatury pliku co uwierzytelniony upload.
export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(`case-draft-upload:${getClientIp(request)}`, {
      limit: 20,
      windowMs: 60 * 60 * 1000,
    })
    if (!rl.success) return tooManyRequestsResponse(rl.retryAfterSeconds)

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "text/plain",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, images, TXT" },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const originalBuffer = Buffer.from(bytes)

    // Weryfikacja sygnatury pliku (magic bytes) — odporna na podrobiony MIME.
    const validation = validateUploadedFile(originalBuffer, file.name, [
      "pdf", "doc", "docx", "xls", "xlsx", "txt", "jpg", "jpeg", "png", "webp", "gif",
    ])
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { buffer, filename: optimizedFilename } = await optimizeImage(
      originalBuffer,
      file.name,
      file.type
    )

    // Osobny katalog od /api/upload/document — pliki dodane przed rejestracją mogą
    // nigdy nie trafić do żadnej utworzonej sprawy (porzucony draft) i wymagają
    // osobnego sprzątania w przyszłości, bez ryzyka dla dokumentów już powiązanych ze sprawami.
    const uploadsDir = path.join(process.cwd(), ".uploads", "case-drafts")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = optimizedFilename.split(".").pop()
    const filename = `${timestamp}-${randomString}.${extension}`
    const filepath = path.join(uploadsDir, filename)

    await writeFile(filepath, buffer)

    const fileUrl = `/api/uploads/case-drafts/${filename}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: optimizedFilename,
      originalName: file.name,
    })
  } catch (error) {
    console.error("Error uploading case draft attachment:", error)
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    )
  }
}
