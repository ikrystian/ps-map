import { isInlineSafeMime } from "@/lib/file-validation"
import { existsSync } from "fs"
import { readFile } from "fs/promises"
import { NextRequest, NextResponse } from "next/server"
import { join } from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params

    if (!path || path.length === 0) {
      return NextResponse.json({ error: "No file specified" }, { status: 400 })
    }

    // Reconstruct the file path
    const filePath = path.join("/")

    // Security: prevent directory traversal
    if (filePath.includes("..") || filePath.startsWith("/")) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 })
    }

    // Build the full file path
    const fullPath = join(process.cwd(), ".uploads", filePath)

    // Security: ensure the file is within .uploads directory
    const uploadsDir = join(process.cwd(), ".uploads")
    if (!fullPath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Read the file
    const fileBuffer = await readFile(fullPath)

    // Determine content type based on file extension
    const ext = filePath.split(".").pop()?.toLowerCase()
    let contentType = "application/octet-stream"

    const mimeTypes: Record<string, string> = {
      "jpg": "image/jpeg",
      "jpeg": "image/jpeg",
      "png": "image/png",
      "gif": "image/gif",
      "webp": "image/webp",
      "pdf": "application/pdf",
      "doc": "application/msword",
      "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "xls": "application/vnd.ms-excel",
      "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "txt": "text/plain",
    }

    if (ext && mimeTypes[ext]) {
      contentType = mimeTypes[ext]
    }

    // Bezpieczeństwo serwowania: nosniff + inline tylko dla bezpiecznych obrazów,
    // pozostałe typy wymuszają pobranie (ochrona przed stored XSS, np. HTML/SVG).
    const fileName = path[path.length - 1] || "plik"
    const disposition = isInlineSafeMime(contentType)
      ? "inline"
      : `attachment; filename="${encodeURIComponent(fileName)}"`

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer as any, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error serving file:", error)
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    )
  }
}