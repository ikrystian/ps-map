import { auth } from "@/lib/auth"
import { EXPERTISE_CATEGORY_PATH_SELECT } from "@/lib/expertise-category"
import { USER_CONTACT_SELECT, flattenLawFirmUser } from "@/lib/law-firm-user"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/law-firms - Fetch all law firms with pagination and filters (ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit
    const search = searchParams.get("search") || ""
    const verified = searchParams.get("verified") || ""
    const active = searchParams.get("active") || ""
    const subscription = searchParams.get("subscription") || ""

    // Build where clause for filters
    const where: any = {}

    // Search by name, NIP, or contact info
    if (search) {
      where.OR = [
        { nazwa: { contains: search } },
        { user: { imie: { contains: search } } },
        { user: { nazwisko: { contains: search } } },
      ]
    }

    // Filter by verification status
    if (verified === "true") {
      where.zweryfikowana = true
    } else if (verified === "false") {
      where.zweryfikowana = false
    }

    // Filter by active status
    if (active === "true") {
      where.aktywna = true
    } else if (active === "false") {
      where.aktywna = false
    }

    // Filter by subscription package
    if (subscription) {
      where.pakietSubskrypcji = subscription
    }

    // Fetch law firms with related data
    const [lawFirms, total] = await Promise.all([
      prisma.lawFirm.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              status: true,
              emailVerified: true,
              createdAt: true,
              lastLogin: true,
              ...USER_CONTACT_SELECT,
            },
          },
          // Ścieżkę specjalizacji („Kategoria > Specjalizacja”) budujemy z drzewa.
          expertiseCategory: EXPERTISE_CATEGORY_PATH_SELECT,
          _count: {
            select: {
              offers: true,
              reviews: true,
              blogPosts: true,
              orders: true,
              categories: true,
              services: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.lawFirm.count({ where }),
    ])

    return NextResponse.json({
      lawFirms: lawFirms.map(flattenLawFirmUser),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching law firms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/law-firms - Create a new law firm (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      // User data
      email,
      password,
      // Basic info
      expertiseCategoryId,
      nazwa,
      nip,
      regon,
      krs,
      // Contact
      imieKontakt,
      nazwiskoKontakt,
      numerTelefonu,
      numerTelefonu2,
      // Address
      adres,
      kodPocztowy,
      miasto,
      voivodeshipId,
      // Profile
      opis,
      // Subscription
      pakietSubskrypcji,
      // Status
      zweryfikowana,
      aktywna,
    } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (!nazwa || !imieKontakt || !nazwiskoKontakt || !numerTelefonu || !adres || !kodPocztowy || !miasto || !voivodeshipId) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate NIP format (10 digits) if provided
    if (nip) {
      const nipRegex = /^\d{10}$/
      if (!nipRegex.test(nip.replace(/[-\s]/g, ""))) {
        return NextResponse.json(
          { error: "NIP must be 10 digits" },
          { status: 400 }
        )
      }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Check if NIP already exists (if provided)
    if (nip) {
      const existingLawFirm = await prisma.lawFirm.findUnique({
        where: { nip: nip.replace(/[-\s]/g, "") },
      })

      if (existingLawFirm) {
        return NextResponse.json(
          { error: "Law firm with this NIP already exists" },
          { status: 409 }
        )
      }
    }

    // Check if voivodeship exists
    const voivodeshipExists = await prisma.voivodeship.findUnique({
      where: { id: voivodeshipId },
    })

    if (!voivodeshipExists) {
      return NextResponse.json(
        { error: "Invalid voivodeship" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and law firm in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create user (dane kontaktowe i adres należą do użytkownika)
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "LAW_FIRM",
          status: "ACTIVE",
          imie: imieKontakt,
          nazwisko: nazwiskoKontakt,
          numerTelefonu,
          numerTelefonu2: numerTelefonu2 || null,
          adres,
          kodPocztowy,
          miasto,
          voivodeshipId,
        },
      })

      // Create law firm
      const cleanNip = nip ? nip.replace(/[-\s]/g, "") : null
      const suffix = cleanNip ? cleanNip.slice(-4) : Math.random().toString(36).substring(2, 6)
      const slug = nazwa
        .toLowerCase()
        .replace(/[ąćęłńóśźż]/g, (char: string) => {
          const map: Record<string, string> = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' }
          return map[char] || char
        })
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + suffix

      const lawFirm = await tx.lawFirm.create({
        data: {
          userId: user.id,
          expertiseCategoryId: expertiseCategoryId || null,
          nazwa,
          slug,
          nip: cleanNip || null,
          regon: regon || null,
          krs: krs || null,
          opis: opis || "",
          pakietSubskrypcji: (pakietSubskrypcji === "" || pakietSubskrypcji === "none" || pakietSubskrypcji === null) ? null : (pakietSubskrypcji || "PODSTAWOWY"),
          zweryfikowana: zweryfikowana || false,
          aktywna: aktywna !== undefined ? aktywna : true,
          zgodaRegulamin: true,
          zgodaPrzetwarzanie: true,
        },
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

      return { user, lawFirm }
    })

    return NextResponse.json(flattenLawFirmUser(result.lawFirm), { status: 201 })
  } catch (error) {
    console.error("Error creating law firm:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
