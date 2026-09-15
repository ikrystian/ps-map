import { prisma } from "@/lib/prisma"
import { buildAddress, geocodeAddress, inPolandBounds } from "@/lib/geocoding"
import { NextResponse } from "next/server"

/**
 * GET /api/experts/map
 *
 * Zwraca ekspertów, którzy podali adres (User.adres/miasto), w formie
 * lekkiej listy pod pinezki na mapie. Współrzędne liczone są na żywo
 * z adresu — User.latitude/longitude działa tu tylko jako cache, żeby
 * nie geokodować tego samego adresu przy każdym żądaniu.
 */

export const revalidate = 300

export async function GET() {
  try {
    const lawFirms = await prisma.lawFirm.findMany({
      where: {
        aktywna: true,
        user: {
          OR: [{ adres: { not: null } }, { miasto: { not: null } }],
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
            id: true,
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

    const resolved = await Promise.all(
      lawFirms.map(async (firm) => {
        let lat = firm.user.latitude
        let lng = firm.user.longitude

        // Brak zapisanego cache współrzędnych dla tego adresu — dogeokoduj.
        if (lat === null || lng === null) {
          const address = buildAddress({
            adres: firm.user.adres,
            kodPocztowy: firm.user.kodPocztowy,
            miasto: firm.user.miasto,
          })

          try {
            const coords = await geocodeAddress(address)
            if (coords && inPolandBounds(coords)) {
              lat = coords.lat
              lng = coords.lng
              // Zapisz jako cache, żeby kolejne żądania nie geokodowały ponownie.
              await prisma.user.update({
                where: { id: firm.user.id },
                data: { latitude: lat, longitude: lng },
              })
            }
          } catch (error) {
            console.error(`Geokodowanie nieudane dla ${firm.nazwa}:`, error)
          }
        }

        if (lat === null || lng === null) return null
        if (!inPolandBounds({ lat, lng })) return null

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
    )

    const experts = resolved.filter((e): e is NonNullable<typeof e> => e !== null)

    return NextResponse.json({ experts, total: experts.length })
  } catch (error) {
    console.error("Error fetching experts for map:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
