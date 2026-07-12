import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// POST /api/admin/users/[id]/verify-email - Manually mark a user's email as verified (ADMIN only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { emailVerified: new Date() },
      select: { id: true, emailVerified: true },
    })

    // Any pending verification link is now moot
    await prisma.verificationToken.deleteMany({
      where: { identifier: user.email },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error verifying user email:", error)
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    )
  }
}
