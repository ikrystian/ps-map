import { auth } from "@/auth"
import {
  buildReferralLink,
  generateReferralToken,
  getReferralExpiryDate,
  resolveDisplayStatus,
} from "@/lib/case-referrals"
import { sendEmailWithTemplate } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { CaseType, EmailType } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

const referralInclude = {
  categories: { include: { category: true } },
  city: true,
  voivodeship: true,
  case: { select: { id: true, nazwaSprawy: true, status: true } },
} as const

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const CASE_TYPES: CaseType[] = ["OSOBA_PRYWATNA", "FIRMA", "ORGANIZACJA"]

/**
 * GET /api/case-referrals — lista polecenia zalogowanego eksperta wraz ze statystykami lejka.
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 })
    }

    if (session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Dostęp tylko dla ekspertów" }, { status: 403 })
    }

    const lawFirm = await prisma.lawFirm.findUnique({ where: { userId: session.user.id } })

    if (!lawFirm) {
      return NextResponse.json({ error: "Nie znaleziono profilu eksperta" }, { status: 404 })
    }

    const referrals = await prisma.caseReferral.findMany({
      where: { lawFirmId: lawFirm.id },
      include: referralInclude,
      orderBy: { createdAt: "desc" },
    })

    // Wygaśnięcie liczymy w locie – nie ma zadania cyklicznego przestawiającego status.
    const withDisplayStatus = referrals.map((referral) => ({
      ...referral,
      status: resolveDisplayStatus(referral),
      link: buildReferralLink(referral.token),
    }))

    const sprawy = withDisplayStatus.filter((r) => r.status === "SPRAWA_UTWORZONA").length
    // Lejek jest kumulatywny: kto utworzył sprawę, ten też się zarejestrował i otworzył link.
    const zarejestrowane = withDisplayStatus.filter((r) => r.zarejestrowanoAt).length
    const otwarte = withDisplayStatus.filter((r) => r.otwarteAt).length
    const wyslane = withDisplayStatus.filter((r) => r.status !== "ANULOWANE").length

    return NextResponse.json({
      referrals: withDisplayStatus,
      stats: {
        wyslane,
        otwarte,
        zarejestrowane,
        sprawy,
        konwersja: wyslane > 0 ? Math.round((sprawy / wyslane) * 1000) / 10 : 0,
      },
    })
  } catch (error) {
    console.error("Error fetching case referrals:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/case-referrals — ekspert generuje jednorazowy link i wysyła go mailem klientowi.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 })
    }

    if (session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Tylko eksperci mogą polecać sprawy" }, { status: 403 })
    }

    const rl = rateLimit(`case-referral:${session.user.id}:${getClientIp(request)}`, {
      limit: 20,
      windowMs: 60 * 60 * 1000,
    })
    if (!rl.success) return tooManyRequestsResponse(rl.retryAfterSeconds)

    const lawFirm = await prisma.lawFirm.findUnique({ where: { userId: session.user.id } })

    if (!lawFirm) {
      return NextResponse.json({ error: "Nie znaleziono profilu eksperta" }, { status: 404 })
    }

    if (!lawFirm.aktywna) {
      return NextResponse.json(
        { error: "Twój profil jest nieaktywny — nie możesz polecać spraw" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : ""
    const nazwaSprawy = typeof body.nazwaSprawy === "string" ? body.nazwaSprawy.trim() : ""
    const wiadomosc = typeof body.wiadomosc === "string" ? body.wiadomosc.trim() : ""

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Podaj poprawny adres e-mail klienta" }, { status: 400 })
    }

    if (!CASE_TYPES.includes(body.typSprawy)) {
      return NextResponse.json({ error: "Wybierz typ sprawy" }, { status: 400 })
    }

    const categoryIds: string[] = Array.isArray(body.categoryIds)
      ? [...new Set<string>(body.categoryIds.filter((id: unknown): id is string => typeof id === "string" && !!id))]
      : []

    if (categoryIds.length === 0) {
      return NextResponse.json({ error: "Wybierz przynajmniej jedną kategorię" }, { status: 400 })
    }

    const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } })

    if (categories.length !== categoryIds.length) {
      return NextResponse.json({ error: "Wybrana kategoria nie istnieje" }, { status: 404 })
    }

    if (!body.cityId || typeof body.cityId !== "string") {
      return NextResponse.json({ error: "Wybierz miasto" }, { status: 400 })
    }

    const city = await prisma.city.findUnique({
      where: { id: body.cityId },
      include: { voivodeship: true },
    })

    if (!city) {
      return NextResponse.json({ error: "Wybrane miasto nie istnieje" }, { status: 404 })
    }

    // Ekspert nie powinien zasypywać jednego adresu wieloma aktywnymi linkami.
    const existing = await prisma.caseReferral.findFirst({
      where: {
        lawFirmId: lawFirm.id,
        email,
        status: { in: ["WYSLANE", "OTWARTE", "ZAREJESTROWANO"] },
        expiresAt: { gt: new Date() },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Masz już aktywne polecenie wysłane na ten adres e-mail" },
        { status: 400 }
      )
    }

    const expiresAt = getReferralExpiryDate()

    const referral = await prisma.caseReferral.create({
      data: {
        token: generateReferralToken(),
        lawFirmId: lawFirm.id,
        email,
        typSprawy: body.typSprawy,
        nazwaSprawy: nazwaSprawy || null,
        wiadomosc: wiadomosc || null,
        voivodeshipId: city.voivodeshipId,
        cityId: city.id,
        expiresAt,
        categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
      },
      include: referralInclude,
    })

    const link = buildReferralLink(referral.token)

    try {
      await sendEmailWithTemplate({
        to: email,
        templateType: EmailType.POLECENIE_SPRAWY,
        variables: {
          "{ekspert}": lawFirm.nazwa,
          "{kategorie}": categories.map((c) => c.nazwa).join(", "),
          "{lokalizacja}": `${city.nazwa}, ${city.voivodeship.nazwa}`,
          "{nazwaSprawy}": nazwaSprawy || "Do uzupełnienia przez klienta",
          "{wiadomosc}": wiadomosc || "Brak dodatkowej wiadomości.",
          "{linkPolecenia}": link,
          "{waznyDo}": expiresAt.toLocaleDateString("pl-PL", { timeZone: "Europe/Warsaw" }),
        },
      })
    } catch (emailError) {
      console.error("Failed to send case referral email:", emailError)
    }

    return NextResponse.json({ ...referral, link }, { status: 201 })
  } catch (error) {
    console.error("Error creating case referral:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
