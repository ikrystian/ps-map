import { auth } from "@/auth"
import { anonymizeUserAccount } from "@/lib/account-anonymization"
import { USER_CONTACT_SELECT, flattenLawFirmUser } from "@/lib/law-firm-user"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/utils"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

// GET /api/admin/law-firms/[id] - Fetch single law firm details (ADMIN only)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            emailVerified: true,
            telefonZweryfikowany: true,
            createdAt: true,
            updatedAt: true,
            lastLogin: true,
            ...USER_CONTACT_SELECT,
            // Dane firmy z Białej listy podane przy rejestracji „jako firma”
            companyData: {
              select: {
                COMPANY_name: true,
                COMPANY_nip: true,
                COMPANY_regon: true,
                COMPANY_krs: true,
                COMPANY_statusVat: true,
                COMPANY_residenceAddress: true,
                COMPANY_workingAddress: true,
              },
            },
          },
        },
        expertiseCategory: true,
        mainCategory: {
          select: { id: true, nazwa: true },
        },
        accountManager: {
          select: {
            id: true,
            imie: true,
            nazwisko: true,
            email: true,
            telefon: true,
            avatar: true,
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
        counties: {
          include: {
            county: true,
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
          select: {
            id: true,
            nazwaUslugi: true,
            opisUslugi: true,
            cenaOd: true,
            cenaDo: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        certificates: {
          select: {
            id: true,
            nazwaCertyfikatu: true,
            wydawca: true,
            dataUzyskania: true,
            createdAt: true,
          },
          orderBy: {
            dataUzyskania: "desc",
          },
          take: 10,
        },
        offers: {
          select: {
            id: true,
            caseId: true,
            kwotaBrutto: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        reviews: {
          select: {
            id: true,
            clientId: true,
            ocenaOgolna: true,
            komunikacja: true,
            profesjonalizm: true,
            terminowosc: true,
            stosunekJakosci: true,
            trescOpinii: true,
            aktywna: true,
            zweryfikowana: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        blogPosts: {
          select: {
            id: true,
            tytul: true,
            slug: true,
            opublikowany: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        orders: {
          select: {
            id: true,
            orderType: true,
            kwota: true,
            statusPlatnosci: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            netAmount: true,
            grossAmount: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        promotions: {
          select: {
            id: true,
            typPromocji: true,
            startPromocji: true,
            koniecPromocji: true,
            aktywna: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        _count: {
          select: {
            voivodeships: true,
            categories: true,
            services: true,
            certificates: true,
            blogPosts: true,
            offers: true,
            reviews: true,
            orders: true,
            invoices: true,
            promotions: true,
            favoritedBy: true,
          },
        },
      },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    return NextResponse.json(flattenLawFirmUser(lawFirm))
  } catch (error) {
    console.error("Error fetching law firm:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/admin/law-firms/[id] - Update law firm (ADMIN only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Check if law firm exists
    const existingLawFirm = await prisma.lawFirm.findUnique({
      where: { id },
      include: {
        user: true,
      },
    })

    if (!existingLawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    // Validate NIP format if provided
    if (body.nip) {
      const nipRegex = /^\d{10}$/
      const cleanNip = body.nip.replace(/[-\s]/g, "")
      if (!nipRegex.test(cleanNip)) {
        return NextResponse.json(
          { error: "NIP must be 10 digits" },
          { status: 400 }
        )
      }

      // Check if NIP is already taken by another law firm
      const duplicateLawFirm = await prisma.lawFirm.findFirst({
        where: {
          nip: cleanNip,
          id: { not: id },
        },
      })

      if (duplicateLawFirm) {
        return NextResponse.json(
          { error: "NIP is already taken by another law firm" },
          { status: 409 }
        )
      }
    }

    // Validate voivodeship if provided
    if (body.voivodeshipId) {
      const voivodeshipExists = await prisma.voivodeship.findUnique({
        where: { id: body.voivodeshipId },
      })

      if (!voivodeshipExists) {
        return NextResponse.json(
          { error: "Invalid voivodeship" },
          { status: 400 }
        )
      }
    }

    // Slug profilu publicznego. Puste pole = wygeneruj z nazwy i dodaj sufiks
    // z NIP-u, tak jak przy rejestracji i tworzeniu eksperta przez admina.
    let normalizedSlug: string | undefined
    if (body.slug !== undefined) {
      normalizedSlug = generateSlug(String(body.slug || ""))

      if (!normalizedSlug) {
        const nazwaForSlug = body.nazwa ?? existingLawFirm.nazwa
        const nipForSlug = body.nip
          ? String(body.nip).replace(/[-\s]/g, "")
          : existingLawFirm.nip
        const suffix = nipForSlug ? nipForSlug.slice(-4) : id.slice(0, 4)
        normalizedSlug = `${generateSlug(nazwaForSlug)}-${suffix}`
      }

      if (normalizedSlug !== existingLawFirm.slug) {
        const duplicateSlug = await prisma.lawFirm.findFirst({
          where: { slug: normalizedSlug, id: { not: id } },
          select: { id: true },
        })

        if (duplicateSlug) {
          return NextResponse.json(
            { error: "Slug is already taken by another law firm" },
            { status: 409 }
          )
        }
      }
    }

    // Główna kategoria musi należeć do listy specjalizacji eksperta
    if (body.categoryIds !== undefined && Array.isArray(body.categoryIds)) {
      const mainId =
        body.mainCategoryId !== undefined
          ? body.mainCategoryId
          : existingLawFirm.mainCategoryId

      if (mainId && !body.categoryIds.includes(mainId)) {
        return NextResponse.json(
          { error: "Główna kategoria musi być na liście wybranych specjalizacji" },
          { status: 400 }
        )
      }
    }

    // Build update data for law firm
    const lawFirmUpdateData: any = {}

    if (normalizedSlug) lawFirmUpdateData.slug = normalizedSlug

    // Basic info
    if (body.expertiseCategoryId !== undefined) {
      lawFirmUpdateData.expertiseCategoryId = body.expertiseCategoryId || null
    }
    if (body.nazwa !== undefined) lawFirmUpdateData.nazwa = body.nazwa
    if (body.nip !== undefined) lawFirmUpdateData.nip = body.nip ? body.nip.replace(/[-\s]/g, "") : null
    if (body.regon !== undefined) lawFirmUpdateData.regon = body.regon
    if (body.krs !== undefined) lawFirmUpdateData.krs = body.krs

    // Contact info / address — przeniesione do modelu User
    const userContactUpdateData: any = {}
    if (body.imieKontakt !== undefined) userContactUpdateData.imie = body.imieKontakt
    if (body.nazwiskoKontakt !== undefined) userContactUpdateData.nazwisko = body.nazwiskoKontakt
    if (body.numerTelefonu !== undefined) {
      userContactUpdateData.numerTelefonu = body.numerTelefonu
      // Numer potwierdza użytkownik kodem SMS przy rejestracji. Podmiana numeru
      // przez admina unieważnia to potwierdzenie.
      if (body.numerTelefonu !== existingLawFirm.user.numerTelefonu) {
        userContactUpdateData.telefonZweryfikowany = null
      }
    }
    if (body.numerTelefonu2 !== undefined) userContactUpdateData.numerTelefonu2 = body.numerTelefonu2
    if (body.adres !== undefined) userContactUpdateData.adres = body.adres
    if (body.kodPocztowy !== undefined) userContactUpdateData.kodPocztowy = body.kodPocztowy
    if (body.miasto !== undefined) userContactUpdateData.miasto = body.miasto
    if (body.voivodeshipId !== undefined) userContactUpdateData.voivodeshipId = body.voivodeshipId
    if (body.latitude !== undefined) {
      userContactUpdateData.latitude =
        body.latitude === "" || body.latitude === null ? null : Number(body.latitude)
    }
    if (body.longitude !== undefined) {
      userContactUpdateData.longitude =
        body.longitude === "" || body.longitude === null ? null : Number(body.longitude)
    }

    // `User.name` jest tym, co widzi ekspert w nagłówku swojego panelu —
    // musi nadążać za zmianą imienia/nazwiska.
    if (body.imieKontakt !== undefined || body.nazwiskoKontakt !== undefined) {
      const imie = body.imieKontakt ?? existingLawFirm.user.imie ?? ""
      const nazwisko = body.nazwiskoKontakt ?? existingLawFirm.user.nazwisko ?? ""
      userContactUpdateData.name = `${imie} ${nazwisko}`.trim() || null
    }

    // Ręczne potwierdzenie adresu e-mail (bez niego użytkownik nie zaloguje się)
    if (body.emailVerified !== undefined) {
      userContactUpdateData.emailVerified = body.emailVerified
        ? existingLawFirm.user.emailVerified ?? new Date()
        : null
    }

    // Profile
    if (body.opis !== undefined) lawFirmUpdateData.opis = body.opis
    if (body.logo !== undefined) lawFirmUpdateData.logo = body.logo
    if (body.zdjecieGlowne !== undefined) lawFirmUpdateData.zdjecieGlowne = body.zdjecieGlowne
    if (body.galeriaZdjec !== undefined) lawFirmUpdateData.galeriaZdjec = body.galeriaZdjec
    if (body.filmYouTube !== undefined) lawFirmUpdateData.filmYouTube = body.filmYouTube
    if (body.okladkaFilmu !== undefined) lawFirmUpdateData.okladkaFilmu = body.okladkaFilmu
    if (body.kolejnoscMultimedia !== undefined) lawFirmUpdateData.kolejnoscMultimedia = body.kolejnoscMultimedia

    // Hours
    if (body.statusGodzinyOtwarcia !== undefined) lawFirmUpdateData.statusGodzinyOtwarcia = body.statusGodzinyOtwarcia
    if (body.godzinyOtwarcia !== undefined) lawFirmUpdateData.godzinyOtwarcia = body.godzinyOtwarcia

    // Social media
    if (body.linkLinkedIn !== undefined) lawFirmUpdateData.linkLinkedIn = body.linkLinkedIn
    if (body.linkFacebook !== undefined) lawFirmUpdateData.linkFacebook = body.linkFacebook
    if (body.linkInstagram !== undefined) lawFirmUpdateData.linkInstagram = body.linkInstagram
    if (body.linkTwitter !== undefined) lawFirmUpdateData.linkTwitter = body.linkTwitter
    if (body.linkTikTok !== undefined) lawFirmUpdateData.linkTikTok = body.linkTikTok
    if (body.stronaWww !== undefined) lawFirmUpdateData.stronaWww = body.stronaWww

    // Education
    if (body.edukacja !== undefined) lawFirmUpdateData.edukacja = body.edukacja

    // Registrations
    if (body.oirpMiasto !== undefined) lawFirmUpdateData.oirpMiasto = body.oirpMiasto
    if (body.oirpWpis !== undefined) lawFirmUpdateData.oirpWpis = body.oirpWpis
    if (body.oirpStatus !== undefined) lawFirmUpdateData.oirpStatus = body.oirpStatus
    if (body.oraMiasto !== undefined) lawFirmUpdateData.oraMiasto = body.oraMiasto
    if (body.oraWpis !== undefined) lawFirmUpdateData.oraWpis = body.oraWpis
    if (body.oraStatus !== undefined) lawFirmUpdateData.oraStatus = body.oraStatus

    // Services
    if (body.unikatowyOpisUslugi !== undefined) lawFirmUpdateData.unikatowyOpisUslugi = body.unikatowyOpisUslugi
    if (body.slowaKluczowe !== undefined) lawFirmUpdateData.slowaKluczowe = body.slowaKluczowe

    // Area
    if (body.calaPolska !== undefined) lawFirmUpdateData.calaPolska = body.calaPolska
    if (body.onlineOnly !== undefined) lawFirmUpdateData.onlineOnly = body.onlineOnly

    // Status biegłego sądowego (odznaka na profilu publicznym)
    if (body.bieglySadowy !== undefined) lawFirmUpdateData.bieglySadowy = body.bieglySadowy
    if (body.bieglySadowyNazwaSadu !== undefined) {
      lawFirmUpdateData.bieglySadowyNazwaSadu = body.bieglySadowyNazwaSadu || null
    }

    // Główna kategoria (specjalizacja wiodąca)
    if (body.mainCategoryId !== undefined) {
      lawFirmUpdateData.mainCategoryId = body.mainCategoryId || null
    }

    // Points and subscription
    if (body.punktySaldo !== undefined) lawFirmUpdateData.punktySaldo = body.punktySaldo
    if (body.pakietSubskrypcji !== undefined) {
      lawFirmUpdateData.pakietSubskrypcji = (body.pakietSubskrypcji === "" || body.pakietSubskrypcji === "none" || body.pakietSubskrypcji === null) ? null : body.pakietSubskrypcji
    }
    if (body.dataPakietuOd !== undefined) {
      lawFirmUpdateData.dataPakietuOd = body.dataPakietuOd === "" ? null : new Date(body.dataPakietuOd)
    }
    if (body.dataPakietuDo !== undefined) {
      lawFirmUpdateData.dataPakietuDo = body.dataPakietuDo === "" ? null : new Date(body.dataPakietuDo)
    }
    if (body.packageDurationDays !== undefined) {
      lawFirmUpdateData.packageDurationDays = body.packageDurationDays || null
      // Liczba dni wylicza datę końca tylko wtedy, gdy nie ma jej wprost albo gdy
      // zmieniła się data startu. Bezwarunkowe przeliczanie po cichu kasowało
      // datę końca ustawioną ręcznie przez admina przy każdym kolejnym zapisie.
      const previousStart = existingLawFirm.dataPakietuOd
        ? new Date(existingLawFirm.dataPakietuOd).toISOString().split("T")[0]
        : ""
      const startChanged = body.dataPakietuOd !== previousStart

      if (body.packageDurationDays && body.dataPakietuOd && (!body.dataPakietuDo || startChanged)) {
        const startDate = new Date(body.dataPakietuOd)
        lawFirmUpdateData.dataPakietuDo = new Date(startDate.getTime() + body.packageDurationDays * 24 * 60 * 60 * 1000)
      }
    }
    if (body.autoRenewal !== undefined) lawFirmUpdateData.autoRenewal = body.autoRenewal

    // Statistics
    if (body.wyswietleniaProfilu !== undefined) lawFirmUpdateData.wyswietleniaProfilu = body.wyswietleniaProfilu
    if (body.zlozoneOferty !== undefined) lawFirmUpdateData.zlozoneOferty = body.zlozoneOferty
    if (body.wygraneOferty !== undefined) lawFirmUpdateData.wygraneOferty = body.wygraneOferty
    if (body.konwersja !== undefined) lawFirmUpdateData.konwersja = body.konwersja
    if (body.pozycjaRanking !== undefined) lawFirmUpdateData.pozycjaRanking = body.pozycjaRanking

    // Consents
    if (body.zgodaRegulamin !== undefined) lawFirmUpdateData.zgodaRegulamin = body.zgodaRegulamin
    if (body.zgodaPrzetwarzanie !== undefined) lawFirmUpdateData.zgodaPrzetwarzanie = body.zgodaPrzetwarzanie

    // Status
    if (body.zweryfikowana !== undefined) lawFirmUpdateData.zweryfikowana = body.zweryfikowana
    if (body.aktywna !== undefined) lawFirmUpdateData.aktywna = body.aktywna

    // Account Manager
    if (body.accountManagerId !== undefined) {
      lawFirmUpdateData.accountManagerId = body.accountManagerId || null
    }

    // Perform update in a transaction (might need to update user too)
    const result = await prisma.$transaction(async (tx: any) => {
      // Update law firm
      const updatedLawFirm = await tx.lawFirm.update({
        where: { id },
        data: lawFirmUpdateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              status: true,
              ...USER_CONTACT_SELECT,
            },
          },
        },
      })

      // Ręczna korekta salda musi zostawić ślad w księdze punktowej — inaczej
      // `balanceAfter` w historii transakcji rozjeżdża się z faktycznym saldem.
      if (body.punktySaldo !== undefined && body.punktySaldo !== existingLawFirm.punktySaldo) {
        await tx.pointTransaction.create({
          data: {
            lawFirmId: id,
            amount: body.punktySaldo - existingLawFirm.punktySaldo,
            balanceAfter: body.punktySaldo,
            type: "ADMIN_ADJUSTMENT",
            description: `Korekta salda z panelu administratora (${existingLawFirm.punktySaldo} → ${body.punktySaldo})`,
          },
        })
      }

      // Specjalizacje prawne. Udziały procentowe (Skill Law Focus) przenosimy
      // z dotychczasowych wpisów, żeby edycja listy ich nie kasowała.
      if (body.categoryIds !== undefined && Array.isArray(body.categoryIds)) {
        const previous = await tx.lawFirmCategory.findMany({
          where: { lawFirmId: id },
          select: { categoryId: true, percentage: true },
        })
        const previousPercentage = new Map<string, number>(
          previous.map((c: { categoryId: string; percentage: number }) => [c.categoryId, c.percentage])
        )

        await tx.lawFirmCategory.deleteMany({ where: { lawFirmId: id } })

        if (body.categoryIds.length > 0) {
          await tx.lawFirmCategory.createMany({
            data: body.categoryIds.map((categoryId: string, index: number) => ({
              lawFirmId: id,
              categoryId,
              kolejnosc: index,
              percentage: previousPercentage.get(categoryId) ?? 0,
            })),
          })
        }
      }

      // Obszar działania — województwa
      if (body.voivodeshipsIds !== undefined && Array.isArray(body.voivodeshipsIds)) {
        await tx.lawFirmVoivodeship.deleteMany({ where: { lawFirmId: id } })

        if (body.voivodeshipsIds.length > 0) {
          await tx.lawFirmVoivodeship.createMany({
            data: body.voivodeshipsIds.map((voivodeshipId: string) => ({
              lawFirmId: id,
              voivodeshipId,
            })),
          })
        }
      }

      // Obszar działania — miasta
      if (body.citiesIds !== undefined && Array.isArray(body.citiesIds)) {
        await tx.lawFirmCity.deleteMany({ where: { lawFirmId: id } })

        if (body.citiesIds.length > 0) {
          await tx.lawFirmCity.createMany({
            data: body.citiesIds.map((cityId: string) => ({
              lawFirmId: id,
              cityId,
            })),
          })
        }
      }

      // Update user if email or password is provided
      const userUpdateData: any = { ...userContactUpdateData }

      if (body.userEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(body.userEmail)) {
          throw new Error("Invalid user email format")
        }

        // Check if email is already taken
        const duplicateUser = await tx.user.findFirst({
          where: {
            email: body.userEmail,
            id: { not: existingLawFirm.userId },
          },
        })

        if (duplicateUser) {
          throw new Error("Email is already taken by another user")
        }

        userUpdateData.email = body.userEmail
      }

      if (body.userPassword) {
        userUpdateData.password = await bcrypt.hash(body.userPassword, 10)
      }

      if (body.userStatus) {
        const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "BLOCKED"]
        if (!validStatuses.includes(body.userStatus)) {
          throw new Error("Invalid user status")
        }
        userUpdateData.status = body.userStatus
      }

      if (Object.keys(userUpdateData).length > 0) {
        const updatedUser = await tx.user.update({
          where: { id: existingLawFirm.userId },
          data: userUpdateData,
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            ...USER_CONTACT_SELECT,
          },
        })
        return { ...updatedLawFirm, user: updatedUser }
      }

      return updatedLawFirm
    })

    return NextResponse.json(flattenLawFirmUser(result))
  } catch (error) {
    console.error("Error updating law firm:", error)
    if (error instanceof Error && error.message.includes("already taken")) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    if (error instanceof Error && error.message.includes("Invalid")) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/law-firms/[id] - Delete law firm (ADMIN only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if law firm exists
    const existingLawFirm = await prisma.lawFirm.findUnique({
      where: { id },
      include: {
        user: true,
      },
    })

    if (!existingLawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    // Fizyczne usunięcie użytkownika kasuje kaskadowo faktury i dowody księgowe,
    // które muszą być przechowywane 5 lat (art. 74 ust. 2 pkt 4 ustawy
    // o rachunkowości, art. 86 § 1 Ordynacji podatkowej). Jeżeli takie dokumenty
    // istnieją, konto jest anonimizowane zamiast usuwane.
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
        reason: "Usunięcie konta eksperta z panelu administratora",
      })

      return NextResponse.json(
        {
          message:
            "Konto zostało zanonimizowane — dokumentacja księgowa musi zostać zachowana przez okres wymagany przepisami prawa",
          type: "anonymized",
          retentionUntil: result.retentionUntil,
          legalBasis: result.legalBasis,
        },
        { status: 200 }
      )
    }

    // Delete law firm and associated user in a transaction
    // Note: Due to onDelete: Cascade in schema, deleting the user will also delete the law firm
    await prisma.user.delete({
      where: { id: existingLawFirm.userId },
    })

    return NextResponse.json(
      { message: "Law firm deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting law firm:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
