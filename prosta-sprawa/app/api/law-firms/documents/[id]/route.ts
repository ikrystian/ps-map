import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

// DELETE /api/law-firms/documents/[id] - Delete document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if document exists and belongs to this law firm
    const document = await prisma.document.findFirst({
      where: {
        id: params.id,
        lawFirmId: lawFirm.id
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      )
    }

    // Delete file from filesystem
    const filePath = join(process.cwd(), "public", document.sciezka)
    if (existsSync(filePath)) {
      await unlink(filePath)
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Document deleted successfully" })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
