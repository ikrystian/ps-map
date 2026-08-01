import { prisma } from "@/lib/prisma"

export async function checkAndAwardBadges(lawFirmId: string) {
    const lawFirm = await prisma.lawFirm.findUnique({
        where: { id: lawFirmId },
        include: {
            badges: true,
            reviews: true,
            blogPosts: true,
            partnerProgram: true,
        },
    })

    if (!lawFirm) return

    const badges = await prisma.badge.findMany()

    for (const badge of badges) {
        const awardedBadge = lawFirm.badges.find((b) => b.badgeId === badge.id)

        // Skip if already awarded, unless the badge type can also be revoked
        if (awardedBadge && badge.conditionType !== "PARTNER_CLUB_BANNER_VERIFIED") {
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
            case "MANUAL":
                // Manual badges are only awarded manually by admins
                break;
            case "PARTNER_CLUB_BANNER_VERIFIED":
                if (lawFirm.partnerProgram?.active && lawFirm.partnerProgram?.bannerPlaced) {
                    conditionMet = true
                }
                break
        }

        if (conditionMet && !awardedBadge) {
            await prisma.lawFirmBadge.create({
                data: {
                    lawFirmId: lawFirm.id,
                    badgeId: badge.id,
                },
            })
        } else if (!conditionMet && awardedBadge && badge.conditionType === "PARTNER_CLUB_BANNER_VERIFIED") {
            // Odznaka klubu partnerskiego jest odbierana, gdy warunek przestaje być spełniony
            // (np. weryfikacja bannera nie powiodła się lub program został dezaktywowany)
            await prisma.lawFirmBadge.delete({ where: { id: awardedBadge.id } })
        }
    }
}
