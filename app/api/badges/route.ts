import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const badges = await db.badge.findMany({
            orderBy: {
                createdAt: "desc",
            },
        })

        return NextResponse.json(badges)
    } catch (error) {
        console.error("[BADGES_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request) {
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

        const badge = await db.badge.create({
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
        console.error("[BADGES_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
