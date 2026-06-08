import { auth } from "@/lib/auth"
import { validateUploadedFile } from "@/lib/file-validation"
import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { optimizeImage } from "@/lib/image-processor"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Sprawdź autoryzację
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Forbidden - only law firms can upload certificates" }, { status: 403 })
    }
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Sprawdź typ pliku - głównie PDF i obrazy
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PDF, JPEG, PNG, WEBP" },
        { status: 400 }
      )
    }

    // Sprawdź rozmiar pliku (max 10MB)
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
    const validation = validateUploadedFile(originalBuffer, file.name, ["pdf", "jpg", "jpeg", "png", "webp"])
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { buffer, filename: optimizedFilename } = await optimizeImage(
      originalBuffer,
      file.name,
      file.type
    )

    // Utwórz folder uploads jeśli nie istnieje
    const uploadsDir = path.join(process.cwd(), ".uploads", "certificates")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generuj unikalną nazwę pliku
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = optimizedFilename.split(".").pop()
    const filename = `${timestamp}-${randomString}.${extension}`
    const filepath = path.join(uploadsDir, filename)

    // Zapisz plik
    await writeFile(filepath, buffer)

    // Zwróć URL do pliku
    const fileUrl = `/api/uploads/certificates/${filename}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: optimizedFilename,
      originalName: file.name,
    })
  } catch (error) {
    console.error("Error uploading certificate:", error)
    return NextResponse.json(
      { error: "Failed to upload certificate" },
      { status: 500 }
    )
  }
}
