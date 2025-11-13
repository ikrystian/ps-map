import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/certificates/[id] - Get a single certificate
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get law firm
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    // Get certificate
    const certificate = await prisma.certificate.findFirst({
      where: {
        id: params.id,
        lawFirmId: lawFirm.id,
      },
    })

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    return NextResponse.json(certificate)
  } catch (error) {
    console.error("Error fetching certificate:", error)
    return NextResponse.json(
      { error: "Failed to fetch certificate" },
      { status: 500 }
    )
  }
}

// PUT /api/certificates/[id] - Update a certificate
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get law firm
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    // Check if certificate exists and belongs to the law firm
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        id: params.id,
        lawFirmId: lawFirm.id,
      },
    })

    if (!existingCertificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    const body = await request.json()
    const { nazwaCertyfikatu, wydawca, dataUzyskania, dataWaznosci, numerCertyfikatu, skanCertyfikatu } = body

    // Update certificate
    const certificate = await prisma.certificate.update({
      where: { id: params.id },
      data: {
        ...(nazwaCertyfikatu && { nazwaCertyfikatu }),
        ...(wydawca && { wydawca }),
        ...(dataUzyskania && { dataUzyskania: new Date(dataUzyskania) }),
        ...(dataWaznosci !== undefined && { dataWaznosci: dataWaznosci ? new Date(dataWaznosci) : null }),
        ...(numerCertyfikatu !== undefined && { numerCertyfikatu }),
        ...(skanCertyfikatu && { skanCertyfikatu }),
      },
    })

    return NextResponse.json(certificate)
  } catch (error) {
    console.error("Error updating certificate:", error)
    return NextResponse.json(
      { error: "Failed to update certificate" },
      { status: 500 }
    )
  }
}

// DELETE /api/certificates/[id] - Delete (soft delete) a certificate
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get law firm
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    // Check if certificate exists and belongs to the law firm
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        id: params.id,
        lawFirmId: lawFirm.id,
      },
    })

    if (!existingCertificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    // Soft delete by setting aktywny to false
    await prisma.certificate.update({
      where: { id: params.id },
      data: { aktywny: false },
    })

    return NextResponse.json({ message: "Certificate deleted successfully" })
  } catch (error) {
    console.error("Error deleting certificate:", error)
    return NextResponse.json(
      { error: "Failed to delete certificate" },
      { status: 500 }
    )
  }
}
