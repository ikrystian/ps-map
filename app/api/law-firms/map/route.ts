import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Pobierz wszystkie aktywne kancelarie z danymi adresowymi
    const lawFirms = await prisma.lawFirm.findMany({
      where: {
        aktywna: true,
        zweryfikowana: true,
      },
      select: {
        id: true,
        nazwa: true,
        slug: true,
        adres: true,
        kodPocztowy: true,
        miasto: true,
        latitude: true,
        longitude: true,
        logo: true,
        opis: true,
        numerTelefonu: true,
        emailKontakt: true,
        pakietSubskrypcji: true,
        voivodeship: {
          select: {
            nazwa: true,
            slug: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                nazwa: true,
                slug: true,
              },
            },
          },
        },
        reviews: {
          select: {
            ocenaOgolna: true,
          },
          where: {
            aktywna: true,
          },
        },
      },
    })

    // Przetwórz dane i oblicz średnią ocenę
    const lawFirmsWithRating = lawFirms.map((firm: any) => {
      const reviews = firm.reviews
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum: number, r: any) => sum + r.ocenaOgolna, 0) / reviews.length
          : 0

      return {
        id: firm.id,
        nazwa: firm.nazwa,
        slug: firm.slug,
        adres: firm.adres,
        kodPocztowy: firm.kodPocztowy,
        miasto: firm.miasto,
        latitude: firm.latitude,
        longitude: firm.longitude,
        logo: firm.logo,
        opis: firm.opis,
        numerTelefonu: firm.numerTelefonu,
        emailKontakt: firm.emailKontakt,
        pakietSubskrypcji: firm.pakietSubskrypcji,
        voivodeship: firm.voivodeship.nazwa,
        categories: firm.categories.map((c: any) => c.category.nazwa),
        avgRating: Math.round(avgRating * 10) / 10,
        reviewsCount: reviews.length,
      }
    })

    return NextResponse.json(lawFirmsWithRating)
  } catch (error) {
    console.error("Error fetching law firms for map:", error)
    return NextResponse.json(
      { error: "Błąd podczas pobierania danych kancelarii" },
      { status: 500 }
    )
  }
}
