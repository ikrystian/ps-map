import { prisma } from "@/lib/prisma"

export async function checkAndAwardBadges(lawFirmId: string) {
    const lawFirm = await prisma.lawFirm.findUnique({
        where: { id: lawFirmId },
        include: {
            badges: true,
            reviews: true,
            blogPosts: true,
        },
    })

    if (!lawFirm) return

    const badges = await prisma.badge.findMany()

    for (const badge of badges) {
        // Skip if already awarded
        if (lawFirm.badges.some((b) => b.badgeId === badge.id)) {
            continue
        }

        let conditionMet = false

        switch (badge.conditionType) {
            case "YEARS_IN_SERVICE":
                const years = new Date().getFullYear() - lawFirm.createdAt.getFullYear()
                if (years >= badge.threshold) conditionMet = true
                break
            case "WON_CASES":
                if (lawFirm.wygraneOferty >= badge.threshold) conditionMet = true
                break
            case "REVIEWS_COUNT":
                if (lawFirm.reviews.length >= badge.threshold) conditionMet = true
                break
            case "BLOG_POSTS_COUNT":
                if (lawFirm.blogPosts.length >= badge.threshold) conditionMet = true
                break
            case "OFFERS_SUBMITTED":
                if (lawFirm.zlozoneOferty >= badge.threshold) conditionMet = true
                break
            case "PROFILE_VIEWS":
                if (lawFirm.wyswietleniaProfilu >= badge.threshold) conditionMet = true
                break
        }

        if (conditionMet) {
            await prisma.lawFirmBadge.create({
                data: {
                    lawFirmId: lawFirm.id,
                    badgeId: badge.id,
                },
            })
        }
    }
}
