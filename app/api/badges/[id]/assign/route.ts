import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// GET /api/badges/[id]/assign - Get all law firms assigned to this badge
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { id: badgeId } = await params

        const assignments = await db.lawFirmBadge.findMany({
            where: {
                badgeId,
            },
            include: {
                lawFirm: {
                    include: {
                        user: {
                            select: {
                                email: true,
                            }
                        }
                    }
                },
            },
            orderBy: {
                awardedAt: "desc",
            },
        })

        return NextResponse.json(assignments)
    } catch (error) {
        console.error("[BADGE_ASSIGNMENTS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

// POST /api/badges/[id]/assign - Assign a law firm to this badge
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { id: badgeId } = await params
        const body = await req.json()
        const { lawFirmId } = body

        if (!lawFirmId) {
            return new NextResponse("Missing lawFirmId", { status: 400 })
        }

        // Verify if law firm exists
        const lawFirm = await db.lawFirm.findUnique({
            where: { id: lawFirmId }
        })

        if (!lawFirm) {
            return new NextResponse("Law firm not found", { status: 404 })
        }

        // Check if already assigned
        const existing = await db.lawFirmBadge.findUnique({
            where: {
                lawFirmId_badgeId: {
                    lawFirmId,
                    badgeId,
                }
            }
        })

        if (existing) {
            return new NextResponse("Already assigned", { status: 400 })
        }

        const lawFirmBadge = await db.lawFirmBadge.create({
            data: {
                lawFirmId,
                badgeId,
            },
            include: {
                lawFirm: true
            }
        })

        return NextResponse.json(lawFirmBadge)
    } catch (error) {
        console.error("[BADGE_ASSIGN]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

// DELETE /api/badges/[id]/assign - Remove a badge from a law firm
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { id: badgeId } = await params
        const { searchParams } = new URL(req.url)
        const lawFirmId = searchParams.get("lawFirmId")

        if (!lawFirmId) {
            return new NextResponse("Missing lawFirmId", { status: 400 })
        }

        await db.lawFirmBadge.delete({
            where: {
                lawFirmId_badgeId: {
                    lawFirmId,
                    badgeId,
                }
            }
        })

        return new NextResponse("Success", { status: 200 })
    } catch (error) {
        console.error("[BADGE_UNASSIGN]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
