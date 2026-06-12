import { PrismaClient } from "@prisma/client"

const data = [
  {
    nazwa: "Prawnicy",
    kolejnosc: 0,
    specializations: [
      "Adwokat",
      "Radca prawny",
      "Doradca podatkowy",
      "Rzecznik patentowy",
      "Doradca restrukturyzacyjny",
      "Mediator",
      "Syndyk",
    ],
  },
  {
    nazwa: "Eksperci",
    kolejnosc: 1,
    subcategories: [
      {
        nazwa: "Finanse",
        kolejnosc: 0,
        specializations: ["Doradca finansowy", "Księgowy", "Biegły rewident"],
      },
      {
        nazwa: "Budownictwo i nieruchomości",
        kolejnosc: 1,
        specializations: [
          "Rzeczoznawca majątkowy",
          "Geodeta",
          "Inspektor nadzoru budowlanego",
          "Kierownik budowy",
          "Kosztorysant budowlany",
          "Audytor energetyczny",
        ],
      },
      {
        nazwa: "Motoryzacja i szkody",
        kolejnosc: 2,
        specializations: ["Rzeczoznawca samochodowy", "Ekspert ds. odszkodowań"],
      },
      {
        nazwa: "Biznes i firmy",
        kolejnosc: 3,
        specializations: [
          "Specjalista BHP",
          "Specjalista PPOŻ",
          "Specjalista RODO",
          "Specjalista Compliance",
          "Specjalista ds. zamówień publicznych",
          "Doradca biznesowy",
        ],
      },
      {
        nazwa: "Medycyna i opinie",
        kolejnosc: 4,
        specializations: ["Psycholog", "Psycholog sądowy", "Lekarz biegły"],
      },
    ],
  },
  {
    nazwa: "Biegli i rzeczoznawcy",
    kolejnosc: 2,
    specializations: [
      "Biegły sądowy",
      "Rzeczoznawca majątkowy",
      "Rzeczoznawca samochodowy",
      "Rzeczoznawca budowlany",
      "Biegły księgowy",
      "Biegły z zakresu informatyki",
      "Biegły medyczny",
    ],
  },
]

export async function seedExpertiseCategories(prisma: PrismaClient) {
  console.log('Seeding expertise categories...')
  const existing = await prisma.expertiseCategory.count()
  if (existing > 0) {
    console.log("Expertise categories already seeded, skipping.")
    return
  }

  for (const cat of data) {
    const parent = await prisma.expertiseCategory.create({
      data: { nazwa: cat.nazwa, kolejnosc: cat.kolejnosc },
    })

    if ("specializations" in cat && cat.specializations) {
      for (let i = 0; i < cat.specializations.length; i++) {
        await prisma.expertiseCategory.create({
          data: { nazwa: cat.specializations[i], parentId: parent.id, kolejnosc: i },
        })
      }
    }

    if ("subcategories" in cat && cat.subcategories) {
      for (const sub of cat.subcategories) {
        const subParent = await prisma.expertiseCategory.create({
          data: { nazwa: sub.nazwa, parentId: parent.id, kolejnosc: sub.kolejnosc },
        })
        for (let i = 0; i < sub.specializations.length; i++) {
          await prisma.expertiseCategory.create({
            data: { nazwa: sub.specializations[i], parentId: subParent.id, kolejnosc: i },
          })
        }
      }
    }
  }

  console.log("Expertise categories seeded successfully.")
}

