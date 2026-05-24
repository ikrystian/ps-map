import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

// GET /api/admin/reviews - Get all reviews with pagination and filtering (ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Filtering parameters
    const lawFirmId = searchParams.get("lawFirmId")
    const clientId = searchParams.get("clientId")
    const rating = searchParams.get("rating")
    const verified = searchParams.get("verified")
    const active = searchParams.get("active")
    const search = searchParams.get("search")
    const reported = searchParams.get("reported")

    // Build where clause
    const where: Prisma.ReviewWhereInput = {}

    if (lawFirmId) {
      where.lawFirmId = lawFirmId
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (rating) {
      where.ocenaOgolna = parseInt(rating)
    }

    if (verified === "true" || verified === "false") {
      where.zweryfikowana = verified === "true"
    }

    if (active === "true" || active === "false") {
      where.aktywna = active === "true"
    }

    if (reported === "true") {
      where.reports = {
        some: {}
      }
    } else if (reported === "false") {
      where.reports = {
        none: {}
      }
    }

    if (search) {
      where.OR = [
        { tytulOpinii: { contains: search } },
        { trescOpinii: { contains: search } },
      ]
    }

    // Fetch reviews with relations
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          lawFirm: {
            select: {
              id: true,
              nazwa: true,
              nazwaFirmy: true,
            },
          },
          client: {
            select: {
              id: true,
              imie: true,
              nazwisko: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          reports: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ])

    return NextResponse.json({
      reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/reviews - Create a new review (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      lawFirmId,
      clientId,
      ocenaOgolna,
      profesjonalizm,
      komunikacja,
      terminowosc,
      stosunekJakosci,
      tytulOpinii,
      trescOpinii,
      polecam,
      anonimowa,
      zweryfikowana,
      aktywna,
    } = body

    // Validate required fields
    if (!lawFirmId || !clientId || !ocenaOgolna || !tytulOpinii || !trescOpinii) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate rating range (1-5)
    if (ocenaOgolna < 1 || ocenaOgolna > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    // Validate review content length
    if (trescOpinii.length < 50) {
      return NextResponse.json(
        { error: "Review content must be at least 50 characters" },
        { status: 400 }
      )
    }

    // Verify law firm and client exist
    const [lawFirm, client] = await Promise.all([
      prisma.lawFirm.findUnique({ where: { id: lawFirmId } }),
      prisma.client.findUnique({ where: { id: clientId } }),
    ])

    if (!lawFirm || !client) {
      return NextResponse.json(
        { error: "Law firm or client not found" },
        { status: 404 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        lawFirmId,
        clientId,
        ocenaOgolna,
        profesjonalizm: profesjonalizm || null,
        komunikacja: komunikacja || null,
        terminowosc: terminowosc || null,
        stosunekJakosci: stosunekJakosci || null,
        tytulOpinii,
        trescOpinii,
        polecam: polecam ?? true,
        anonimowa: anonimowa ?? false,
        zweryfikowana: zweryfikowana ?? false,
        aktywna: aktywna ?? true,
      },
      include: {
        lawFirm: {
          select: {
            id: true,
            nazwa: true,
            nazwaFirmy: true,
          },
        },
        client: {
          select: {
            id: true,
            imie: true,
            nazwisko: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
