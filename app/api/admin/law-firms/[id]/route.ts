import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
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
            createdAt: true,
            updatedAt: true,
            lastLogin: true,
          },
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

    return NextResponse.json(lawFirm)
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

    // Validate email formats if provided
    if (body.emailKontakt) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.emailKontakt)) {
        return NextResponse.json({ error: "Invalid contact email format" }, { status: 400 })
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

    // Build update data for law firm
    const lawFirmUpdateData: any = {}

    // Type and basic info
    if (body.typ !== undefined) lawFirmUpdateData.typ = body.typ
    if (body.typInny !== undefined) lawFirmUpdateData.typInny = body.typInny
    if (body.nazwa !== undefined) lawFirmUpdateData.nazwa = body.nazwa
    if (body.nazwaFirmy !== undefined) lawFirmUpdateData.nazwaFirmy = body.nazwaFirmy
    if (body.nip !== undefined) lawFirmUpdateData.nip = body.nip.replace(/[-\s]/g, "")
    if (body.regon !== undefined) lawFirmUpdateData.regon = body.regon
    if (body.krs !== undefined) lawFirmUpdateData.krs = body.krs

    // Contact info
    if (body.imieKontakt !== undefined) lawFirmUpdateData.imieKontakt = body.imieKontakt
    if (body.nazwiskoKontakt !== undefined) lawFirmUpdateData.nazwiskoKontakt = body.nazwiskoKontakt
    if (body.stanowisko !== undefined) lawFirmUpdateData.stanowisko = body.stanowisko
    if (body.numerTelefonu !== undefined) lawFirmUpdateData.numerTelefonu = body.numerTelefonu
    if (body.numerTelefonu2 !== undefined) lawFirmUpdateData.numerTelefonu2 = body.numerTelefonu2
    if (body.emailKontakt !== undefined) lawFirmUpdateData.emailKontakt = body.emailKontakt

    // Address
    if (body.adres !== undefined) lawFirmUpdateData.adres = body.adres
    if (body.kodPocztowy !== undefined) lawFirmUpdateData.kodPocztowy = body.kodPocztowy
    if (body.miasto !== undefined) lawFirmUpdateData.miasto = body.miasto
    if (body.voivodeshipId !== undefined) lawFirmUpdateData.voivodeshipId = body.voivodeshipId

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
    if (body.callaPolska !== undefined) lawFirmUpdateData.callaPolska = body.callaPolska
    if (body.onlineOnly !== undefined) lawFirmUpdateData.onlineOnly = body.onlineOnly

    // Offer type
    if (body.typOferty !== undefined) lawFirmUpdateData.typOferty = body.typOferty

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
            },
          },
          voivodeship: true,
        },
      })

      // Update user if email or password is provided
      const userUpdateData: any = {}

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
        await tx.user.update({
          where: { id: existingLawFirm.userId },
          data: userUpdateData,
        })
      }

      return updatedLawFirm
    })

    return NextResponse.json(result)
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
