import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    if (session.user.role !== "CLIENT") {
      return Response.json(
        { error: "Tylko klienci mogą przeglądać ulubionych ekspertów" },
        { status: 403 }
      )
    }

    // Pobierz dane klienta
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
    })

    if (!client) {
      return Response.json(
        { error: "Nie znaleziono profilu klienta" },
        { status: 404 }
      )
    }

    // Pobierz ulubionych ekspertów
    const favorites = await prisma.favoriteLawFirm.findMany({
      where: {
        clientId: client.id,
      },
      include: {
        lawFirm: {
          include: {
            voivodeship: true,
            categories: {
              include: {
                category: true,
              },
            },
            reviews: {
              select: {
                ocenaOgolna: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Formatuj dane
    const formattedFavorites = favorites.map((fav: any) => {
      const lawFirm = fav.lawFirm
      const avgRating =
        lawFirm.reviews.length > 0
          ? lawFirm.reviews.reduce((sum: number, r: any) => sum + r.ocenaOgolna, 0) /
          lawFirm.reviews.length
          : 0
      const reviewCount = lawFirm.reviews.length

      return {
        id: fav.id,
        addedAt: fav.createdAt,
        lawFirm: {
          id: lawFirm.id,
          nazwa: lawFirm.nazwa,
          nazwaFirmy: lawFirm.nazwaFirmy,
          typ: lawFirm.typ,
          opis: lawFirm.opis,
          logo: lawFirm.logo,
          miasto: lawFirm.miasto,
          voivodeship: {
            nazwa: lawFirm.voivodeship.nazwa,
          },
          numerTelefonu: lawFirm.numerTelefonu,
          stronaWww: lawFirm.stronaWww,
          zweryfikowana: lawFirm.zweryfikowana,
          avgRating,
          reviewCount,
          categories: lawFirm.categories.map((c: any) => ({
            category: {
              nazwa: c.category.nazwa,
              slug: c.category.slug,
            },
          })),
        },
      }
    })

    return Response.json(formattedFavorites)
  } catch (error) {
    console.error("Error fetching favorite law firms:", error)
    return Response.json(
      { error: "Wystąpił błąd podczas pobierania ulubionych ekspertów" },
      { status: 500 }
    )
  }
}
