import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Pobierz kancelarię z wszystkimi powiązanymi danymi
    const lawFirm = await prisma.lawFirm.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
          { nip: id },
          { userId: id },
        ],
        aktywna: true,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        voivodeship: true,
        voivodeships: {
          include: {
            voivodeship: true,
          },
        },
        cities: {
          include: {
            city: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
          orderBy: {
            kolejnosc: "asc",
          },
        },
        services: {
          where: {
            aktywna: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        certificates: {
          where: {
            aktywny: true,
          },
          orderBy: {
            dataUzyskania: "desc",
          },
        },
        blogPosts: {
          where: {
            opublikowany: true,
          },
          orderBy: {
            dataPublikacji: "desc",
          },
          take: 5,
        },
        reviews: {
          where: {
            aktywna: true,
            zweryfikowana: true,
          },
          include: {
            client: {
              select: {
                imie: true,
                nazwisko: true,
                user: {
                  select: {
                    image: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        consultationAvailabilities: true,
        badges: {
          include: {
            badge: true,
          },
          orderBy: {
            awardedAt: "desc",
          },
        },
      },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    // Zwiększ licznik wyświetleń profilu
    await prisma.lawFirm.update({
      where: { id: lawFirm.id },
      data: {
        wyswietleniaProfilu: {
          increment: 1,
        },
      },
    })

    // Oblicz średnią ocenę
    const avgRating = lawFirm.reviews.length > 0
      ? lawFirm.reviews.reduce((sum: number, review: any) => sum + review.ocenaOgolna, 0) / lawFirm.reviews.length
      : 0

    // Parse JSON fields
    const parsedLawFirm = {
      ...lawFirm,
      userId: lawFirm.userId, // Include userId for chat functionality
      galeriaZdjec: lawFirm.galeriaZdjec && lawFirm.galeriaZdjec.trim() ? JSON.parse(lawFirm.galeriaZdjec) : [],
      slowaKluczowe: lawFirm.slowaKluczowe && lawFirm.slowaKluczowe.trim() ? JSON.parse(lawFirm.slowaKluczowe) : [],
      godzinyOtwarcia: lawFirm.godzinyOtwarcia && lawFirm.godzinyOtwarcia.trim() ? JSON.parse(lawFirm.godzinyOtwarcia) : null,
      edukacja: lawFirm.edukacja && lawFirm.edukacja.trim() ? JSON.parse(lawFirm.edukacja) : [],
      avgRating,
      reviewCount: lawFirm.reviews.length,
    }

    return NextResponse.json(parsedLawFirm)
  } catch (error) {
    console.error("Error fetching law firm:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Sprawdź, czy kancelaria istnieje i należy do zalogowanego użytkownika
    const existingLawFirm = await prisma.lawFirm.findUnique({
      where: { id },
    })

    if (!existingLawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    if (session.user.role !== "LAW_FIRM" || existingLawFirm.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Przygotuj dane do aktualizacji
    const updateData: any = {}

    // Dane podstawowe
    // Note: slug is NOT directly updateable - it's only regenerated when nazwa changes
    if (body.nazwa && body.nazwa !== existingLawFirm.nazwa) {
      updateData.nazwa = body.nazwa
      // Regenerate slug if nazwa changes
      const polishChars: Record<string, string> = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
        'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
        'Ą': 'a', 'Ć': 'c', 'Ę': 'e', 'Ł': 'l', 'Ń': 'n',
        'Ó': 'o', 'Ś': 's', 'Ź': 'z', 'Ż': 'z'
      }
      let slug = body.nazwa
      for (const [polish, latin] of Object.entries(polishChars)) {
        slug = slug.replace(new RegExp(polish, 'g'), latin)
      }
      slug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      const nipSuffix = existingLawFirm.nip.slice(-4)
      updateData.slug = `${slug}-${nipSuffix}`
    } else if (body.nazwa) {
      // If nazwa hasn't changed, still update it (for consistency)
      updateData.nazwa = body.nazwa
    }
    if (body.nazwaFirmy) updateData.nazwaFirmy = body.nazwaFirmy
    if (body.opis !== undefined) updateData.opis = body.opis
    if (body.logo !== undefined) updateData.logo = body.logo
    if (body.zdjecieGlowne !== undefined) updateData.zdjecieGlowne = body.zdjecieGlowne

    // Dane kontaktowe
    if (body.imieKontakt) updateData.imieKontakt = body.imieKontakt
    if (body.nazwiskoKontakt) updateData.nazwiskoKontakt = body.nazwiskoKontakt
    if (body.stanowisko !== undefined) updateData.stanowisko = body.stanowisko
    if (body.numerTelefonu) updateData.numerTelefonu = body.numerTelefonu
    if (body.numerTelefonu2 !== undefined) updateData.numerTelefonu2 = body.numerTelefonu2
    if (body.emailKontakt) updateData.emailKontakt = body.emailKontakt
    if (body.stronaWww !== undefined) updateData.stronaWww = body.stronaWww

    // Adres
    if (body.adres) updateData.adres = body.adres
    if (body.kodPocztowy) updateData.kodPocztowy = body.kodPocztowy
    if (body.miasto) updateData.miasto = body.miasto
    if (body.voivodeshipId) updateData.voivodeshipId = body.voivodeshipId

    // Multimedia
    if (body.galeriaZdjec) updateData.galeriaZdjec = JSON.stringify(body.galeriaZdjec)
    if (body.filmYouTube !== undefined) updateData.filmYouTube = body.filmYouTube
    if (body.okladkaFilmu !== undefined) updateData.okladkaFilmu = body.okladkaFilmu
    if (body.kolejnoscMultimedia !== undefined) updateData.kolejnoscMultimedia = body.kolejnoscMultimedia

    // Godziny otwarcia
    if (body.statusGodzinyOtwarcia !== undefined) updateData.statusGodzinyOtwarcia = body.statusGodzinyOtwarcia
    if (body.godzinyOtwarcia) updateData.godzinyOtwarcia = JSON.stringify(body.godzinyOtwarcia)

    // Social media
    if (body.linkLinkedIn !== undefined) updateData.linkLinkedIn = body.linkLinkedIn
    if (body.linkFacebook !== undefined) updateData.linkFacebook = body.linkFacebook
    if (body.linkInstagram !== undefined) updateData.linkInstagram = body.linkInstagram
    if (body.linkTwitter !== undefined) updateData.linkTwitter = body.linkTwitter
    if (body.linkTikTok !== undefined) updateData.linkTikTok = body.linkTikTok

    // Edukacja
    if (body.edukacja) updateData.edukacja = JSON.stringify(body.edukacja)

    // Wpisy do rejestrów
    if (body.oirpMiasto !== undefined) updateData.oirpMiasto = body.oirpMiasto
    if (body.oirpWpis !== undefined) updateData.oirpWpis = body.oirpWpis
    if (body.oirpStatus !== undefined) updateData.oirpStatus = body.oirpStatus
    if (body.oraMiasto !== undefined) updateData.oraMiasto = body.oraMiasto
    if (body.oraWpis !== undefined) updateData.oraWpis = body.oraWpis
    if (body.oraStatus !== undefined) updateData.oraStatus = body.oraStatus

    // Specjalizacje
    if (body.unikatowyOpisUslugi !== undefined) updateData.unikatowyOpisUslugi = body.unikatowyOpisUslugi
    if (body.slowaKluczowe) updateData.slowaKluczowe = JSON.stringify(body.slowaKluczowe)

    // Obszar działania
    if (body.callaPolska !== undefined) updateData.callaPolska = body.callaPolska
    if (body.onlineOnly !== undefined) updateData.onlineOnly = body.onlineOnly

    // Subscription plan (can be updated by admin or when buying a package)
    if (body.pakietSubskrypcji !== undefined) updateData.pakietSubskrypcji = body.pakietSubskrypcji

    // Typ oferty
    if (body.typOferty) updateData.typOferty = body.typOferty

    updateData.updatedAt = new Date()

    // Aktualizuj kancelarię
    console.log('Updating law firm with data:', updateData)
    const updatedLawFirm = await prisma.lawFirm.update({
      where: { id },
      data: updateData,
      include: {
        voivodeship: true,
        voivodeships: {
          include: {
            voivodeship: true,
          },
        },
        cities: {
          include: {
            city: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
          orderBy: {
            kolejnosc: "asc",
          },
        },
      },
    })

    // Obsłuż aktualizację województw działania
    if (body.voivodeshipsIds && Array.isArray(body.voivodeshipsIds)) {
      // Usuń stare
      await prisma.lawFirmVoivodeship.deleteMany({
        where: { lawFirmId: id },
      })

      // Dodaj nowe
      if (body.voivodeshipsIds.length > 0) {
        await prisma.lawFirmVoivodeship.createMany({
          data: body.voivodeshipsIds.map((voivodeshipId: string) => ({
            lawFirmId: id,
            voivodeshipId,
          })),
        })
      }
    }

    // Obsłuż aktualizację miast działania
    if (body.citiesIds && Array.isArray(body.citiesIds)) {
      // Usuń stare
      await prisma.lawFirmCity.deleteMany({
        where: { lawFirmId: id },
      })

      // Dodaj nowe
      if (body.citiesIds.length > 0) {
        await prisma.lawFirmCity.createMany({
          data: body.citiesIds.map((cityId: string) => ({
            lawFirmId: id,
            cityId,
          })),
        })
      }
    }

    // Obsłuż aktualizację kategorii/specjalizacji
    if (body.categoriesIds && Array.isArray(body.categoriesIds)) {
      // Usuń stare
      await prisma.lawFirmCategory.deleteMany({
        where: { lawFirmId: id },
      })

      // Dodaj nowe
      if (body.categoriesIds.length > 0) {
        await prisma.lawFirmCategory.createMany({
          data: body.categoriesIds.map((categoryId: string) => ({
            lawFirmId: id,
            categoryId,
          })),
        })
      }
    }

    return NextResponse.json({
      message: "Law firm updated successfully",
      lawFirm: updatedLawFirm,
    })
  } catch (error) {
    console.error("Error updating law firm:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Sprawdź, czy kancelaria istnieje
    const existingLawFirm = await prisma.lawFirm.findUnique({
      where: { id },
      include: {
        user: true,
      },
    })

    if (!existingLawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    // Sprawdź uprawnienia (właściciel lub admin)
    const isOwner = session.user.role === "LAW_FIRM" && existingLawFirm.userId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get query params to determine delete type
    const { searchParams } = new URL(request.url)
    const deleteType = searchParams.get("type") || "soft" // soft or hard

    if (deleteType === "hard") {
      // Hard delete (admin only)
      if (session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Only admins can perform hard delete" },
          { status: 403 }
        )
      }

      // Hard delete - actually remove from database
      // This will cascade delete related records (offers, promotions, etc.) due to onDelete: Cascade
      await prisma.lawFirm.delete({
        where: { id },
      })

      // Also soft delete the user account
      await prisma.user.update({
        where: { id: existingLawFirm.userId },
        data: {
          deletedAt: new Date(),
          status: "SUSPENDED",
        },
      })

      return NextResponse.json({
        message: "Law firm permanently deleted",
        id,
        type: "hard",
      })
    } else {
      // Soft delete - set aktywna to false
      await prisma.lawFirm.update({
        where: { id },
        data: {
          aktywna: false,
          updatedAt: new Date(),
        },
      })

      // Also soft delete the user account if owner is deleting
      if (isOwner) {
        await prisma.user.update({
          where: { id: existingLawFirm.userId },
          data: {
            deletedAt: new Date(),
            status: "SUSPENDED",
          },
        })
      }

      // Cancel all active promotions
      await prisma.promotion.updateMany({
        where: {
          lawFirmId: id,
          aktywna: true,
        },
        data: {
          aktywna: false,
        },
      })

      // Create notification for law firm
      await prisma.notification.create({
        data: {
          userId: existingLawFirm.userId,
          typ: "ZMIANA_STATUSU",
          tytul: "Profil kancelarii został usunięty",
          tresc: "Twój profil kancelarii został dezaktywowany. Skontaktuj się z administracją aby go przywrócić.",
          linkUrl: "/kontakt",
        },
      })

      return NextResponse.json({
        message: "Law firm deactivated (soft delete)",
        id,
        type: "soft",
      })
    }
  } catch (error) {
    console.error("Error deleting law firm:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
