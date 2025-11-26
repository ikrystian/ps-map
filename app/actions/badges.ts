"use server"

import { checkAndAwardBadges } from "@/lib/badges"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"

export async function triggerBadgeCheck() {
    const user = await getCurrentUser()
    if (!user || user.role !== "LAW_FIRM") return

    const lawFirm = await db.lawFirm.findUnique({
        where: { userId: user.id },
    })

    if (lawFirm) {
        await checkAndAwardBadges(lawFirm.id)
    }
}
