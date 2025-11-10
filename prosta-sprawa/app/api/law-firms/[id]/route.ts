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
          { nip: id },
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
        categories: {
          include: {
            category: true,
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
              },
            },
          },
          orderBy: {
            createdAt: "desc",
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
      ? lawFirm.reviews.reduce((sum, review) => sum + review.ocenaOgolna, 0) / lawFirm.reviews.length
      : 0

    // Parse JSON fields
    const parsedLawFirm = {
      ...lawFirm,
      galeriaZdjec: lawFirm.galeriaZdjec ? JSON.parse(lawFirm.galeriaZdjec) : [],
      slowaKluczowe: lawFirm.slowaKluczowe ? JSON.parse(lawFirm.slowaKluczowe) : [],
      godzinyOtwarcia: lawFirm.godzinyOtwarcia ? JSON.parse(lawFirm.godzinyOtwarcia) : null,
      edukacja: lawFirm.edukacja ? JSON.parse(lawFirm.edukacja) : [],
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
    if (body.nazwa) updateData.nazwa = body.nazwa
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

    // Typ oferty
    if (body.typOferty) updateData.typOferty = body.typOferty

    updateData.updatedAt = new Date()

    // Aktualizuj kancelarię
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
        categories: {
          include: {
            category: true,
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // TODO: Implementuj usuwanie kancelarii
    return NextResponse.json({ message: "Delete law firm", id })
  } catch (error) {
    console.error("Error deleting law firm:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
