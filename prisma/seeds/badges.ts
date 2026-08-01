import { PrismaClient } from "@prisma/client";

export async function seedBadges(prisma: PrismaClient) {
  await prisma.badge.create({
    data: {
      name: "Klub Partnerski",
      description: "Ekspert dołączył do klubu partnerskiego i pomyślnie zweryfikował umieszczenie bannera na swojej stronie.",
      imageUrl: "/badges/klub-partnerski.svg",
      conditionType: "PARTNER_CLUB_BANNER_VERIFIED",
      threshold: 1,
    },
  });
}
