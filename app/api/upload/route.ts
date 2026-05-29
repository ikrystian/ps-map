import { auth } from "@/lib/auth"
import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import { NextRequest, NextResponse } from "next/server"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Check authorization
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // File type validation removed - accepting all file types
    // You can add specific validation if needed for your use case

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split(".").pop()
    const filename = `${timestamp}-${randomString}.${extension}`

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "files")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save file
    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // Return URL
    const url = `/api/files/${filename}`

    return NextResponse.json({
      success: true,
      url,
      filename,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
