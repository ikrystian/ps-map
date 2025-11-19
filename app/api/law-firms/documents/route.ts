import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

// GET /api/law-firms/documents - List documents
export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.role !== "LAW_FIRM") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id }
    })

    if (!lawFirm) {
      return NextResponse.json(
        { error: "Law firm not found" },
        { status: 404 }
      )
    }

    const documents = await prisma.document.findMany({
      where: { lawFirmId: lawFirm.id },
      include: {
        clientUser: {
          select: {
            id: true,
            name: true,
            email: true,
            client: {
              select: {
                imie: true,
                nazwisko: true,
              },
            },
          },
        },
        conversation: {
          select: {
            id: true,
            clientUser: {
              select: {
                name: true,
                client: {
                  select: {
                    imie: true,
                    nazwisko: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/law-firms/documents - Upload document
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "LAW_FIRM") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id }
    })

    if (!lawFirm) {
      return NextResponse.json(
        { error: "Law firm not found" },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const nazwa = formData.get("nazwa") as string
    const typDokumentu = formData.get("typDokumentu") as string

    if (!file || !nazwa || !typDokumentu) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Plik jest za duży. Maksymalny rozmiar to 10MB" },
        { status: 400 }
      )
    }

    // Get file extension
    const fileName = file.name
    const extension = fileName.split('.').pop()?.toLowerCase() || ""

    // Validate file type
    const allowedExtensions = ["pdf", "doc", "docx", "txt", "rtf", "odt"]
    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json(
        { error: "Nieobsługiwany format pliku" },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "documents", lawFirm.id)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const safeFileName = `${timestamp}-${fileName.replace(/[^a-z0-9.-]/gi, '_')}`
    const filePath = join(uploadsDir, safeFileName)
    const relativePath = `/uploads/documents/${lawFirm.id}/${safeFileName}`

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save to database
    const document = await prisma.document.create({
      data: {
        lawFirmId: lawFirm.id,
        nazwa,
        typDokumentu,
        rozmiar: file.size,
        sciezka: relativePath,
        rozszerzenie: extension,
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error("Error uploading document:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
