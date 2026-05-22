import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { EditBadgeClient } from "./client"

export default async function EditBadgePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const badge = await db.badge.findUnique({
        where: {
            id,
        },
    })

    if (!badge) {
        notFound()
    }

    return <EditBadgeClient badge={badge} />
}
