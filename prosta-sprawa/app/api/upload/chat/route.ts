import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

/**
 * POST /api/upload/chat
 * Upload PDF file for chat message
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "Brak pliku do przesłania" },
        { status: 400 }
      )
    }

    // Validate file type (PDF only)
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Dozwolone są tylko pliki PDF" },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Plik jest za duży. Maksymalny rozmiar to 5MB" },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 10)
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `${timestamp}-${randomString}-${sanitizedName}`

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "chat")
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Save file
    const filepath = path.join(uploadDir, filename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return file URL
    const fileUrl = `/uploads/chat/${filename}`

    return NextResponse.json({
      url: fileUrl,
      filename: file.name,
      size: file.size,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas przesyłania pliku" },
      { status: 500 }
    )
  }
}
