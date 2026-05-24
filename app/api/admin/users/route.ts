import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// GET /api/admin/users - Fetch all users with pagination and filters (ADMIN only)
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
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const status = searchParams.get("status") || ""

    // Build where clause for filters
    const where: any = {
      deletedAt: null, // Only show non-deleted users
    }

    // Search by name or email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    // Filter by role
    if (role) {
      where.role = role
    }

    // Filter by status
    if (status) {
      where.status = status
    }

    // Fetch users with related data
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
            },
          },
          lawFirm: {
            select: {
              id: true,
              nazwa: true,
              nazwaFirmy: true,
              nip: true,
              zweryfikowana: true,
              aktywna: true,
            },
          },
          _count: {
            select: {
              sentMessages: true,
              receivedMessages: true,
              notifications: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    const sanitizedUsers = users.map((user: any) => {
      const { password, resetToken, resetTokenExpiry, ...userWithoutSensitiveData } = user
      if (userWithoutSensitiveData.client) {
        userWithoutSensitiveData.client = {
          ...userWithoutSensitiveData.client,
          imie: userWithoutSensitiveData.firstName || "",
          nazwisko: userWithoutSensitiveData.lastName || "",
          telefon: userWithoutSensitiveData.phone || "",
        }
      }
      return userWithoutSensitiveData
    })

    return NextResponse.json({
      users: sanitizedUsers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/users - Create a new user (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, role, status } = body

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate role
    const validRoles = ["CLIENT", "LAW_FIRM", "ADMIN"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "BLOCKED"]
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Extract client data from body if available
    const clientData = body.client

    // Create user with optional client record
    const user = await prisma.user.create({
      data: {
        name: name || (clientData ? `${clientData.imie || ""} ${clientData.nazwisko || ""}`.trim() : null),
        firstName: clientData?.imie || null,
        lastName: clientData?.nazwisko || null,
        phone: clientData?.telefon || null,
        email,
        password: hashedPassword,
        role,
        status: status || "ACTIVE",
        client: clientData ? {
          create: {
            adres: clientData.adres,
            kodPocztowy: clientData.kodPocztowy,
            miasto: clientData.miasto,
            voivodeshipId: clientData.voivodeshipId || null,
            zgodaRegulamin: clientData.zgodaRegulamin || false,
            zgodaNewsletter: clientData.zgodaNewsletter || false,
            zgodaMarketing: clientData.zgodaMarketing || false,
          }
        } : undefined
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        client: {
          select: {
            id: true,
          }
        }
      },
    })

    const formattedUser = {
      ...user,
      client: user.client ? {
        ...user.client,
        imie: user.firstName || "",
        nazwisko: user.lastName || "",
        telefon: user.phone || "",
      } : null
    }

    return NextResponse.json(formattedUser, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
