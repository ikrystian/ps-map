import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { EditBadgeClient } from "./client"

export default async function EditBadgePage({ params }: { params: { id: string } }) {
    const badge = await db.badge.findUnique({
        where: {
            id: params.id,
        },
    })

    if (!badge) {
        notFound()
    }

    return <EditBadgeClient badge={badge} />
}
