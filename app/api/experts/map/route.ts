import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/**
 * GET /api/experts/map
 *
 * Zwraca ekspertów z ustalonymi współrzędnymi (User.latitude/longitude)
 * w formie lekkiej listy pod pinezki na mapie. Współrzędne uzupełnia
 * skrypt geokodujący (`bun run db:geocode:experts`).
 */

// Ramka Polski — odsiewa współrzędne wpisane omyłkowo (np. odwrócone lat/lng).
const POLAND_BOUNDS = { minLat: 48.9, maxLat: 55.0, minLng: 14.0, maxLng: 24.2 }

export const revalidate = 300

export async function GET() {
  try {
    const lawFirms = await prisma.lawFirm.findMany({
      where: {
        aktywna: true,
        user: {
          latitude: { not: null },
          longitude: { not: null },
        },
      },
      select: {
        id: true,
        nazwa: true,
        slug: true,
        logo: true,
        opis: true,
        bieglySadowy: true,
        stronaWww: true,
        user: {
          select: {
            image: true,
            imie: true,
            nazwisko: true,
            numerTelefonu: true,
            adres: true,
            kodPocztowy: true,
            miasto: true,
            latitude: true,
            longitude: true,
            voivodeship: { select: { nazwa: true, slug: true } },
          },
        },
        mainCategory: { select: { nazwa: true, slug: true } },
        categories: {
          take: 4,
          select: { category: { select: { nazwa: true, slug: true } } },
        },
        reviews: { select: { ocenaOgolna: true } },
      },
    })

    const experts = lawFirms
      .map((firm) => {
        const lat = firm.user.latitude as number
        const lng = firm.user.longitude as number
        const oceny = firm.reviews.map((r) => r.ocenaOgolna)

        return {
          id: firm.id,
          nazwa: firm.nazwa,
          slug: firm.slug,
          avatar: firm.logo || firm.user.image || null,
          opis: firm.opis?.slice(0, 220) || null,
          bieglySadowy: firm.bieglySadowy,
          stronaWww: firm.stronaWww,
          telefon: firm.user.numerTelefonu,
          adres: firm.user.adres,
          kodPocztowy: firm.user.kodPocztowy,
          miasto: firm.user.miasto,
          voivodeship: firm.user.voivodeship?.nazwa ?? null,
          lat,
          lng,
          mainCategory: firm.mainCategory?.nazwa ?? null,
          categories: firm.categories.map((c) => c.category.nazwa),
          liczbaOpinii: oceny.length,
          sredniaOcen: oceny.length
            ? Math.round((oceny.reduce((a, b) => a + b, 0) / oceny.length) * 10) / 10
            : null,
        }
      })
      .filter(
        (e) =>
          e.lat >= POLAND_BOUNDS.minLat &&
          e.lat <= POLAND_BOUNDS.maxLat &&
          e.lng >= POLAND_BOUNDS.minLng &&
          e.lng <= POLAND_BOUNDS.maxLng
      )

    return NextResponse.json({ experts, total: experts.length })
  } catch (error) {
    console.error("Error fetching experts for map:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
