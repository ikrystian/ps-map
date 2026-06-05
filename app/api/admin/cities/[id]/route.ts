import { auth } from "@/lib/auth"
import { serverCache } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// PATCH /api/admin/cities/[id] - Update a city
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { nazwa, voivodeshipId, postalCodes } = body

    const codes = postalCodes
      ? postalCodes
          .split(",")
          .map((c: string) => c.trim())
          .filter((c: string) => c !== "")
      : []
    const uniqueCodes = Array.from(new Set(codes)) as string[]

    const city = await prisma.$transaction(async (tx) => {
      if (postalCodes !== undefined) {
        await tx.postalCode.deleteMany({
          where: { cityId: id }
        })
      }
      return await tx.city.update({
        where: { id },
        data: {
          nazwa,
          voivodeshipId,
          ...(postalCodes !== undefined ? {
            postalCodes: {
              create: uniqueCodes.map(code => ({ code }))
            }
          } : {})
        },
        include: {
          voivodeship: true,
          postalCodes: true,
        }
      })
    })

    // Invalidate cached cities
    serverCache.invalidatePattern("cities")

    return NextResponse.json(city)
  } catch (error) {
    console.error("Error updating city:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/cities/[id] - Delete a city
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.city.delete({
      where: { id },
    })

    // Invalidate cached cities
    serverCache.invalidatePattern("cities")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting city:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
