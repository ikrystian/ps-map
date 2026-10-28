import { BadgeConditionType, PrismaClient } from "@prisma/client";

export async function seedBadges(prisma: PrismaClient) {
  console.log("Seeding badges...");

  const badges = [
    {
      name: "Klub Partnerski",
      description: "Ekspert dołączył do klubu partnerskiego i pomyślnie zweryfikował umieszczenie banera na swojej stronie internetowej.",
      imageUrl: "/badges/klub-partnerski.svg",
      conditionType: BadgeConditionType.PARTNER_CLUB_BANNER_VERIFIED,
      threshold: 1,
    },
    {
      name: "Doświadczony Ekspert",
      description: "Ponad rok aktywnej obecności i profesjonalnego świadczenia usług prawnych na platformie.",
      imageUrl: "/badges/klub-partnerski.svg",
      conditionType: BadgeConditionType.YEARS_IN_SERVICE,
      threshold: 1,
    },
    {
      name: "Lider Skuteczności",
      description: "Pomyślnie zrealizował i wygrał co najmniej 5 spraw zleconych przez klientów serwisu.",
      imageUrl: "/badges/klub-partnerski.svg",
      conditionType: BadgeConditionType.WON_CASES,
      threshold: 5,
    },
    {
      name: "Zaufany Specjalista",
      description: "Otrzymał co najmniej 5 zweryfikowanych, entuzjastycznych opinii od klientów.",
      imageUrl: "/badges/klub-partnerski.svg",
      conditionType: BadgeConditionType.REVIEWS_COUNT,
      threshold: 5,
    },
    {
      name: "Ekspert Edukator",
      description: "Autor co najmniej 3 merytorycznych i poczytnych artykułów w bazie wiedzy i blogu serwisu.",
      imageUrl: "/badges/klub-partnerski.svg",
      conditionType: BadgeConditionType.BLOG_POSTS_COUNT,
      threshold: 3,
    },
    {
      name: "Aktywny Oferent",
      description: "Złożył ponad 10 profesjonalnych ofert pomocy prawnej dla zgłaszających się klientów.",
      imageUrl: "/badges/klub-partnerski.svg",
      conditionType: BadgeConditionType.OFFERS_SUBMITTED,
      threshold: 10,
    },
    {
      name: "Popularny Profil",
      description: "Wizytówka kancelarii wygenerowała ponad 100 odsłon od poszukujących pomocy klientów.",
      imageUrl: "/badges/klub-partnerski.svg",
      conditionType: BadgeConditionType.PROFILE_VIEWS,
      threshold: 100,
    },
    {
      name: "Rekomendacja Redakcji",
      description: "Specjalne wyróżnienie przyznane indywidualnie przez zespół ProstaSprawa za najwyższe standardy etyki i obsługi.",
      imageUrl: "/badges/klub-partnerski.svg",
      conditionType: BadgeConditionType.MANUAL,
      threshold: 1,
    },
  ];

  for (const b of badges) {
    await prisma.badge.create({
      data: b,
    });
  }

  console.log(`✓ Utworzono ${badges.length} odznak (badges)`);
}
