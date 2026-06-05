import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const lawFirmId = 
      (formData.get("id") as string) || 
      request.nextUrl.searchParams.get("id") ||
      request.headers.get("x-law-firm-id")
    
    if (!lawFirmId) {
      return NextResponse.json({ error: "Missing expert/law firm ID" }, { status: 400 })
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { id: lawFirmId }
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Expert/law firm not found" }, { status: 404 })
    }

    const uploadsDir = join(process.cwd(), "files")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const updateData: { logo?: string; zdjecieGlowne?: string } = {}

    // Process logo
    const logoFile = formData.get("logo") as File | null
    if (logoFile && logoFile.size > 0) {
      const bytes = await logoFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const extension = logoFile.name.split(".").pop() || "jpg"
      const filename = `logo-${lawFirmId}-${Date.now()}.${extension}`
      const filepath = join(uploadsDir, filename)
      await writeFile(filepath, buffer)
      updateData.logo = `/api/files/${filename}`
    }

    // Process main photo (zdjecieGlowne)
    const zdjecieGlowneFile = formData.get("zdjecieGlowne") as File | null
    if (zdjecieGlowneFile && zdjecieGlowneFile.size > 0) {
      const bytes = await zdjecieGlowneFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const extension = zdjecieGlowneFile.name.split(".").pop() || "jpg"
      const filename = `cover-${lawFirmId}-${Date.now()}.${extension}`
      const filepath = join(uploadsDir, filename)
      await writeFile(filepath, buffer)
      updateData.zdjecieGlowne = `/api/files/${filename}`
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No files to update" }, { status: 400 })
    }

    const updatedLawFirm = await prisma.lawFirm.update({
      where: { id: lawFirmId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: "Images updated successfully",
      logo: updatedLawFirm.logo,
      zdjecieGlowne: updatedLawFirm.zdjecieGlowne
    })

  } catch (error) {
    console.error("Error updating expert images:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
