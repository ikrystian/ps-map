import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/certificates - Get all certificates for the authenticated law firm
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Forbidden - only law firms can access certificates" }, { status: 403 })
    }

    // Get law firm
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    // Get certificates
    const certificates = await prisma.certificate.findMany({
      where: {
        lawFirmId: lawFirm.id,
        aktywny: true,
      },
      orderBy: {
        dataUzyskania: "desc",
      },
    })

    return NextResponse.json(certificates)
  } catch (error) {
    console.error("Error fetching certificates:", error)
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    )
  }
}

// POST /api/certificates - Create a new certificate
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Forbidden - only law firms can create certificates" }, { status: 403 })
    }

    // Get law firm
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    const body = await request.json()
    const { nazwaCertyfikatu, wydawca, dataUzyskania, dataWaznosci, numerCertyfikatu, skanCertyfikatu } = body

    // Validation
    if (!nazwaCertyfikatu || !wydawca || !dataUzyskania || !skanCertyfikatu) {
      return NextResponse.json(
        { error: "Missing required fields: nazwaCertyfikatu, wydawca, dataUzyskania, skanCertyfikatu" },
        { status: 400 }
      )
    }

    // Create certificate
    const certificate = await prisma.certificate.create({
      data: {
        lawFirmId: lawFirm.id,
        nazwaCertyfikatu,
        wydawca,
        dataUzyskania: new Date(dataUzyskania),
        dataWaznosci: dataWaznosci ? new Date(dataWaznosci) : null,
        numerCertyfikatu: numerCertyfikatu || null,
        skanCertyfikatu,
      },
    })

    return NextResponse.json(certificate, { status: 201 })
  } catch (error) {
    console.error("Error creating certificate:", error)
    return NextResponse.json(
      { error: "Failed to create certificate" },
      { status: 500 }
    )
  }
}
