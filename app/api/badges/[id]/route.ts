import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { name, description, imageUrl, conditionType, threshold } = body

        if (!name || !description || !imageUrl || !conditionType || threshold === undefined) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        const { id } = await params

        const badge = await db.badge.update({
            where: {
                id,
            },
            data: {
                name,
                description,
                imageUrl,
                conditionType,
                threshold: parseInt(threshold),
            },
        })

        return NextResponse.json(badge)
    } catch (error) {
        console.error("[BADGE_UPDATE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { id } = await params

        const badge = await db.badge.delete({
            where: {
                id,
            },
        })

        return NextResponse.json(badge)
    } catch (error) {
        console.error("[BADGE_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
