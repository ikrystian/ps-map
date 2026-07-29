import { auth } from "@/lib/auth"
import { isInlineSafeMime } from "@/lib/file-validation"
import { prisma } from "@/lib/prisma"
import { existsSync } from "fs"
import { readFile } from "fs/promises"
import { NextRequest, NextResponse } from "next/server"
import { join } from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params

    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json({ error: "No file specified" }, { status: 400 })
    }

    // Reconstruct the file path
    const filePath = pathSegments.join("/")

    // Security: prevent directory traversal
    if (filePath.includes("..") || filePath.startsWith("/")) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 })
    }

    // Build the full file path inside .uploads
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

    // Weryfikacja uprawnień (Autorotyzacja):
    // Obrazy publiczne (images, avatars, logos) są dostępne dla każdego.
    // Pliki prywatne (documents, chat, certificates itp.) wymagają autoryzacji (właściciel lub ADMIN).
    const category = pathSegments[0]
    const isPublicCategory = category === "images" || category === "avatars" || category === "logos"

    if (!isPublicCategory) {
      const session = await auth()
      if (!session?.user) {
        return NextResponse.json({ error: "Wymagane zalogowanie" }, { status: 401 })
      }

      const userId = session.user.id
      const userRole = session.user.role

      // Administrator posiada pełny dostęp do wszystkich plików
      if (userRole !== "ADMIN") {
        let isAuthorized = false
        const filename = pathSegments[pathSegments.length - 1]

        if (category === "chat") {
          // Sprawdź czy użytkownik jest nadawcą wiadomości lub uczestnikiem konwersacji
          const chatMsg = await prisma.chatMessage.findFirst({
            where: {
              fileUrl: { contains: filename },
            },
            include: {
              conversation: {
                include: {
                  client: true,
                  lawFirm: {
                    include: {
                      users: true,
                    },
                  },
                },
              },
            },
          })

          if (chatMsg) {
            const isSender = chatMsg.senderId === userId
            const conv = chatMsg.conversation
            const isClient = conv?.client?.userId === userId
            const isLawFirmUser =
              conv?.lawFirm?.userId === userId ||
              conv?.lawFirm?.users?.some((u) => u.id === userId)

            if (isSender || isClient || isLawFirmUser) {
              isAuthorized = true
            }
          } else {
            // Jeśli plik w czacie został przesłany przez zalogowanego użytkownika
            isAuthorized = true
          }
        } else if (category === "documents") {
          // Sprawdź w modelu Document czy plik należy do użytkownika / jego kancelarii
          const doc = await prisma.document.findFirst({
            where: {
              sciezka: { contains: filename },
            },
            include: {
              lawFirm: {
                include: {
                  users: true,
                },
              },
            },
          })

          if (doc) {
            const isClientOwner = doc.clientUserId === userId
            const isLawFirmOwner =
              doc.lawFirm?.userId === userId ||
              doc.lawFirm?.users?.some((u) => u.id === userId)

            if (isClientOwner || isLawFirmOwner) {
              isAuthorized = true
            }
          } else {
            // Domyślnie zezwól dla zalogowanego posiadacza dokumentów
            isAuthorized = true
          }
        } else if (category === "certificates") {
          const cert = await prisma.certificate.findFirst({
            where: {
              skanCertyfikatu: { contains: filename },
            },
            include: {
              lawFirm: {
                include: {
                  users: true,
                },
              },
            },
          })

          if (cert) {
            const isLawFirmOwner =
              cert.lawFirm?.userId === userId ||
              cert.lawFirm?.users?.some((u) => u.id === userId)
            if (isLawFirmOwner) {
              isAuthorized = true
            }
          } else {
            isAuthorized = true
          }
        } else {
          // Dostęp zalogowany
          isAuthorized = true
        }

        if (!isAuthorized) {
          return NextResponse.json({ error: "Brak uprawnień do tego pliku" }, { status: 403 })
        }
      }
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
    const fileName = pathSegments[pathSegments.length - 1] || "plik"
    const disposition = isInlineSafeMime(contentType)
      ? "inline"
      : `attachment; filename="${encodeURIComponent(fileName)}"`

    return new NextResponse(fileBuffer as any, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": isPublicCategory ? "public, max-age=31536000, immutable" : "private, no-cache",
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