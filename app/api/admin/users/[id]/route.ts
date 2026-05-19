import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// GET /api/admin/users/[id] - Fetch single user details (ADMIN only)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            voivodeship: true,
            cases: {
              select: {
                id: true,
                nazwaSprawy: true,
                status: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 5,
            },
            reviews: {
              select: {
                id: true,
                lawFirmId: true,
                ocenaOgolna: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 5,
            },
            _count: {
              select: {
                cases: true,
                reviews: true,
                favoritesFirms: true,
              },
            },
          },
        },
        lawFirm: {
          include: {
            voivodeship: true,
            _count: {
              select: {
                offers: true,
                reviews: true,
                blogPosts: true,
                orders: true,
              },
            },
          },
        },
        _count: {
          select: {
            sentMessages: true,
            receivedMessages: true,
            notifications: true,
            accounts: true,
            sessions: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove sensitive data
    const { password, resetToken, resetTokenExpiry, ...userWithoutSensitiveData } = user

    return NextResponse.json(userWithoutSensitiveData)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/admin/users/[id] - Update user (ADMIN only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, email, password, role, status } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is trying to update their own role or status
    if (session.user.id === id && (role || status)) {
      return NextResponse.json(
        { error: "You cannot change your own role or status" },
        { status: 403 }
      )
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
      }

      // Check if email is already taken by another user
      const duplicateUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id },
        },
      })

      if (duplicateUser) {
        return NextResponse.json(
          { error: "Email is already taken by another user" },
          { status: 409 }
        )
      }
    }

    // Validate role if provided
    if (role) {
      const validRoles = ["CLIENT", "LAW_FIRM", "ADMIN"]
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 })
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED"]
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
    }

    // Build update data
    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (status) updateData.status = status

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Handle client data if provided
    const clientData = body.client
    if (clientData) {
      // Update name based on client data if name not explicitly provided
      if (name === undefined) {
        updateData.name = `${clientData.imie || ""} ${clientData.nazwisko || ""}`.trim()
      }

      updateData.client = {
        upsert: {
          create: {
            imie: clientData.imie,
            nazwisko: clientData.nazwisko,
            telefon: clientData.telefon,
            adres: clientData.adres,
            kodPocztowy: clientData.kodPocztowy,
            miasto: clientData.miasto,
            voivodeshipId: clientData.voivodeshipId || null,
            zgodaRegulamin: clientData.zgodaRegulamin || false,
            zgodaNewsletter: clientData.zgodaNewsletter || false,
            zgodaMarketing: clientData.zgodaMarketing || false,
          },
          update: {
            imie: clientData.imie,
            nazwisko: clientData.nazwisko,
            telefon: clientData.telefon,
            adres: clientData.adres,
            kodPocztowy: clientData.kodPocztowy,
            miasto: clientData.miasto,
            voivodeshipId: clientData.voivodeshipId || null,
            zgodaRegulamin: clientData.zgodaRegulamin,
            zgodaNewsletter: clientData.zgodaNewsletter,
            zgodaMarketing: clientData.zgodaMarketing,
          }
        }
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        deletedAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Soft delete user (ADMIN only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent admin from deleting themselves
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 403 }
      )
    }

    // Check if user is already deleted
    if (existingUser.deletedAt) {
      return NextResponse.json(
        { error: "User is already deleted" },
        { status: 400 }
      )
    }

    // Soft delete: Set deletedAt timestamp and set status to INACTIVE
    await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "INACTIVE",
      },
    })

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
