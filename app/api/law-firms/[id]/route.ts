import { anonymizeUserAccount } from "@/lib/account-anonymization"
import { auth } from "@/lib/auth"
import { pickEditableCompanyDataFields } from "@/lib/biala-lista"
import { USER_CONTACT_SELECT, flattenLawFirmUser } from "@/lib/law-firm-user"
import { hasActivePackage } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Pobierz eksperta z wszystkimi powiązanymi danymi
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
            ...USER_CONTACT_SELECT,
            notificationSettings: {
              select: {
                ustawieniaOgloszenia: true,
                urlop: true,
              },
            },
            // Dane firmy do faktury podane przy rejestracji (przedrostek COMPANY_)
            companyData: {
              select: {
                COMPANY_name: true,
                COMPANY_nip: true,
                COMPANY_regon: true,
                COMPANY_krs: true,
                COMPANY_residenceAddress: true,
                COMPANY_workingAddress: true,
                COMPANY_statusVat: true,
              },
            },
          },
        },
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
        expertiseCategory: {
          select: { id: true, nazwa: true },
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

    // Oblicz limit słów kluczowych (tagów) z pakietu subskrypcji przypisanego do użytkownika (liczbaTakow)
    let maxKeywords = 5
    let assignedPlan = null
    if (lawFirm.pakietSubskrypcji) {
      assignedPlan = await prisma.subscriptionPlan.findUnique({
        where: { typ: lawFirm.pakietSubskrypcji }
      })
    } else {
      assignedPlan = await prisma.subscriptionPlan.findFirst({
        where: { isPrimary: true }
      }) || await prisma.subscriptionPlan.findUnique({
        where: { typ: "PODSTAWOWY" }
      })
    }

    if (assignedPlan && typeof assignedPlan.liczbaTakow === "number") {
      maxKeywords = assignedPlan.liczbaTakow
    } else {
      const tagSetting = await prisma.settings.findUnique({
        where: { key: "maxLawFirmTags" }
      })
      if (tagSetting) {
        maxKeywords = parseInt(tagSetting.value) || 5
      }
    }

    let skillLawFocusActive = false
    if (assignedPlan && hasActivePackage(lawFirm as any)) {
      skillLawFocusActive = assignedPlan.skillLawFocus
    }

    // Parse JSON fields
    const parsedLawFirm = {
      ...flattenLawFirmUser(lawFirm),
      userId: lawFirm.userId, // Include userId for chat functionality
      // Dane firmy do faktury (null jeśli ekspert rejestrował się jako osoba prywatna)
      companyData: lawFirm.user?.companyData ?? null,
      galeriaZdjec: lawFirm.galeriaZdjec && lawFirm.galeriaZdjec.trim() ? JSON.parse(lawFirm.galeriaZdjec) : [],
      slowaKluczowe: lawFirm.slowaKluczowe && lawFirm.slowaKluczowe.trim() ? JSON.parse(lawFirm.slowaKluczowe) : [],
      godzinyOtwarcia: lawFirm.godzinyOtwarcia && lawFirm.godzinyOtwarcia.trim() ? JSON.parse(lawFirm.godzinyOtwarcia) : null,
      edukacja: lawFirm.edukacja && lawFirm.edukacja.trim() ? JSON.parse(lawFirm.edukacja) : [],
      avgRating,
      reviewCount: lawFirm.reviews.length,
      limitSlowKluczowych: maxKeywords,
      skillLawFocusActive,
      // Flagi z ustawień eksperta dla profilu publicznego
      przyjmujeBezposrednieZapytania:
        lawFirm.user?.notificationSettings?.ustawieniaOgloszenia !== false,
      naUrlopie: lawFirm.user?.notificationSettings?.urlop === true,
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

    // Sprawdź, czy ekspert istnieje i należy do zalogowanego użytkownika
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
    // Dane kontaktowe/adresowe należą do modelu User
    const userUpdateData: any = {}

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
      // NIP jest opcjonalny (admin może go wyczyścić) — bez fallbacku
      // generowanie sluga wywracało zapis profilu na TypeError.
      const nipSuffix = existingLawFirm.nip
        ? existingLawFirm.nip.slice(-4)
        : existingLawFirm.id.slice(0, 4)
      updateData.slug = `${slug}-${nipSuffix}`
    } else if (body.nazwa) {
      // If nazwa hasn't changed, still update it (for consistency)
      updateData.nazwa = body.nazwa
    }
    if (body.nazwa) updateData.nazwa = body.nazwa
    if (body.opis !== undefined) updateData.opis = body.opis
    if (body.logo !== undefined) updateData.logo = body.logo
    if (body.zdjecieGlowne !== undefined) updateData.zdjecieGlowne = body.zdjecieGlowne

    // Dane kontaktowe (model User)
    if (body.imieKontakt) userUpdateData.imie = body.imieKontakt
    if (body.nazwiskoKontakt) userUpdateData.nazwisko = body.nazwiskoKontakt
    if (body.numerTelefonu) userUpdateData.numerTelefonu = body.numerTelefonu
    if (body.numerTelefonu2 !== undefined) userUpdateData.numerTelefonu2 = body.numerTelefonu2
    if (body.stronaWww !== undefined) updateData.stronaWww = body.stronaWww

    // Adres (model User)
    if (body.adres) userUpdateData.adres = body.adres
    if (body.kodPocztowy) userUpdateData.kodPocztowy = body.kodPocztowy
    if (body.miasto) userUpdateData.miasto = body.miasto
    if (body.voivodeshipId) userUpdateData.voivodeshipId = body.voivodeshipId

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
    if (body.slowaKluczowe !== undefined) {
      if (Array.isArray(body.slowaKluczowe)) {
        let maxKeywords = 5
        let assignedPlan = null
        if (existingLawFirm.pakietSubskrypcji) {
          assignedPlan = await prisma.subscriptionPlan.findUnique({
            where: { typ: existingLawFirm.pakietSubskrypcji }
          })
        } else {
          assignedPlan = await prisma.subscriptionPlan.findFirst({
            where: { isPrimary: true }
          }) || await prisma.subscriptionPlan.findUnique({
            where: { typ: "PODSTAWOWY" }
          })
        }

        if (assignedPlan && typeof assignedPlan.liczbaTakow === "number") {
          maxKeywords = assignedPlan.liczbaTakow
        } else {
          const tagSetting = await prisma.settings.findUnique({
            where: { key: "maxLawFirmTags" }
          })
          if (tagSetting) {
            maxKeywords = parseInt(tagSetting.value) || 5
          }
        }

        if (body.slowaKluczowe.length > maxKeywords) {
          return NextResponse.json(
            { error: `Przekroczono limit słów kluczowych. Twój limit to ${maxKeywords} słów kluczowych.` },
            { status: 400 }
          )
        }
      }
      updateData.slowaKluczowe = JSON.stringify(body.slowaKluczowe)
    }

    // Obszar działania
    if (body.calaPolska !== undefined) updateData.calaPolska = body.calaPolska
    if (body.onlineOnly !== undefined) updateData.onlineOnly = body.onlineOnly

    // Status biegłego sądowego (odznaka na wizytówce)
    if (body.bieglySadowy !== undefined) updateData.bieglySadowy = body.bieglySadowy
    if (body.bieglySadowyNazwaSadu !== undefined) updateData.bieglySadowyNazwaSadu = body.bieglySadowyNazwaSadu || null

    // Subscription plan (can be updated by admin or when buying a package)
    if (body.pakietSubskrypcji !== undefined) updateData.pakietSubskrypcji = body.pakietSubskrypcji

    // Specjalizacja / Branża rejestracyjna
    if (body.expertiseCategoryId !== undefined) {
      updateData.expertiseCategoryId = body.expertiseCategoryId || null
    }

    updateData.updatedAt = new Date()

    // Aktualizuj dane kontaktowe/adresowe na koncie użytkownika
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: existingLawFirm.userId },
        data: userUpdateData,
      })
    }

    // Aktualizuj edytowalne dane firmy do faktury (jeśli przekazano).
    // updateMany nie rzuca błędem, gdy ekspert nie ma rekordu CompanyData
    // (rejestracja jako osoba prywatna) — aktualizuje wtedy 0 wierszy.
    if (body.companyData && typeof body.companyData === "object") {
      const companyUpdate = pickEditableCompanyDataFields(body.companyData)
      if (Object.keys(companyUpdate).length > 0) {
        await prisma.companyData.updateMany({
          where: { userId: existingLawFirm.userId },
          data: companyUpdate,
        })
      }
    }

    // Aktualizuj eksperta
    console.log('Updating law firm with data:', updateData)
    const updatedLawFirm = await prisma.lawFirm.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: USER_CONTACT_SELECT },
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
      lawFirm: flattenLawFirmUser(updatedLawFirm),
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

    // Sprawdź, czy ekspert istnieje
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

      // Fizyczne usunięcie kaskadowo skasowałoby faktury i dowody księgowe,
      // które muszą być przechowywane 5 lat (art. 74 ust. 2 pkt 4 ustawy
      // o rachunkowości, art. 86 § 1 Ordynacji podatkowej). Gdy takie dokumenty
      // istnieją, zamiast kasowania wykonujemy anonimizację konta.
      const [invoicesCount, paidOrdersCount] = await Promise.all([
        prisma.invoice.count({ where: { lawFirmId: id } }),
        prisma.order.count({
          where: { lawFirmId: id, statusPlatnosci: { in: ["ZAPLACONE", "ZWROT"] } },
        }),
      ])

      if (invoicesCount > 0 || paidOrdersCount > 0) {
        const result = await anonymizeUserAccount({
          userId: existingLawFirm.userId,
          requestedBy: "ADMIN",
          requestedByUserId: session.user.id,
          reason: "Usunięcie profilu eksperta przez administratora",
        })

        return NextResponse.json({
          message:
            "Konto zostało zanonimizowane — dokumentacja księgowa musi zostać zachowana przez okres wymagany przepisami prawa",
          id,
          type: "anonymized",
          retentionUntil: result.retentionUntil,
          legalBasis: result.legalBasis,
        })
      }

      // Brak dokumentów księgowych — konto można usunąć fizycznie.
      // Kaskada usuwa rekordy powiązane (oferty, promocje itd.).
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
    } else if (isOwner) {
      // Ekspert usuwa własne konto — pełna anonimizacja danych osobowych.
      const result = await anonymizeUserAccount({
        userId: existingLawFirm.userId,
        requestedBy: "SELF",
        reason: "Usunięcie profilu eksperta przez właściciela konta",
      })

      return NextResponse.json({
        message: "Konto zostało usunięte, a dane osobowe zanonimizowane",
        id,
        type: "anonymized",
        retentionUntil: result.retentionUntil,
        legalBasis: result.legalBasis,
      })
    } else {
      // Dezaktywacja profilu przez administratora (nie jest to żądanie usunięcia
      // danych — konto zachowuje dane i może zostać przywrócone).
      await prisma.lawFirm.update({
        where: { id },
        data: {
          aktywna: false,
          updatedAt: new Date(),
        },
      })

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
          tytul: "Profil eksperta został usunięty",
          tresc: "Twój profil eksperta został dezaktywowany. Skontaktuj się z administracją aby go przywrócić.",
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
