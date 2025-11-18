import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const docsDir = path.join(process.cwd(), "docs")

    // Check if docs directory exists
    if (!fs.existsSync(docsDir)) {
      return NextResponse.json(
        { error: "Katalog docs nie istnieje" },
        { status: 404 }
      )
    }

    // Read all files from docs directory
    const files = fs.readdirSync(docsDir)

    // Filter only .md files and extract metadata
    const mdFiles = files
      .filter(file => file.endsWith(".md"))
      .map(file => {
        const filePath = path.join(docsDir, file)
        const stats = fs.statSync(filePath)

        // Parse filename to extract order, category, and title
        // Format: [number][category]title.md
        const match = file.match(/^\[(\d+)\]\[([^\]]+)\](.+)\.md$/)

        let order = 999
        let category = "Inne"
        let title = file.replace(".md", "")

        if (match) {
          order = parseInt(match[1])
          category = match[2]
          title = match[3]
        }

        return {
          filename: file,
          order,
          category,
          title,
          size: stats.size,
          modified: stats.mtime,
        }
      })
      .sort((a, b) => a.order - b.order) // Sort by order number

    // Group by category
    const grouped = mdFiles.reduce((acc, file) => {
      if (!acc[file.category]) {
        acc[file.category] = []
      }
      acc[file.category].push(file)
      return acc
    }, {} as Record<string, typeof mdFiles>)

    return NextResponse.json({
      files: mdFiles,
      grouped,
      total: mdFiles.length,
    })
  } catch (error) {
    console.error("Error reading docs directory:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas odczytu dokumentacji" },
      { status: 500 }
    )
  }
}
