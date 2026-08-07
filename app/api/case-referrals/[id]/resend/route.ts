import { auth } from "@/auth"
import { buildReferralLink, getReferralExpiryDate } from "@/lib/case-referrals"
import { sendEmailWithTemplate } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { EmailType } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/case-referrals/[id]/resend — ponowna wysyłka maila i przedłużenie ważności linku.
 * Token pozostaje ten sam, żeby wcześniej wysłana wiadomość nadal działała.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 })
    }

    if (session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Dostęp tylko dla ekspertów" }, { status: 403 })
    }

    const rl = rateLimit(`case-referral-resend:${session.user.id}:${getClientIp(request)}`, {
      limit: 10,
      windowMs: 60 * 60 * 1000,
    })
    if (!rl.success) return tooManyRequestsResponse(rl.retryAfterSeconds)

    const lawFirm = await prisma.lawFirm.findUnique({ where: { userId: session.user.id } })

    if (!lawFirm) {
      return NextResponse.json({ error: "Nie znaleziono profilu eksperta" }, { status: 404 })
    }

    const referral = await prisma.caseReferral.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        city: { include: { voivodeship: true } },
      },
    })

    if (!referral) {
      return NextResponse.json({ error: "Nie znaleziono polecenia" }, { status: 404 })
    }

    if (referral.lawFirmId !== lawFirm.id) {
      return NextResponse.json({ error: "Brak dostępu do tego polecenia" }, { status: 403 })
    }

    if (referral.caseId || referral.status === "SPRAWA_UTWORZONA") {
      return NextResponse.json(
        { error: "Z tego polecenia powstała już sprawa" },
        { status: 400 }
      )
    }

    if (referral.status === "ANULOWANE") {
      return NextResponse.json({ error: "Polecenie zostało anulowane" }, { status: 400 })
    }

    const expiresAt = getReferralExpiryDate()

    const updated = await prisma.caseReferral.update({
      where: { id },
      data: {
        expiresAt,
        // Wygasły link wraca do obiegu jako świeżo wysłany
        status: referral.status === "WYGASLE" ? "WYSLANE" : referral.status,
      },
    })

    const link = buildReferralLink(referral.token)

    try {
      await sendEmailWithTemplate({
        to: referral.email,
        templateType: EmailType.POLECENIE_SPRAWY,
        variables: {
          "{ekspert}": lawFirm.nazwa,
          "{kategorie}": referral.categories.map((c) => c.category.nazwa).join(", "),
          "{lokalizacja}": `${referral.city.nazwa}, ${referral.city.voivodeship.nazwa}`,
          "{nazwaSprawy}": referral.nazwaSprawy || "Do uzupełnienia przez klienta",
          "{wiadomosc}": referral.wiadomosc || "Brak dodatkowej wiadomości.",
          "{linkPolecenia}": link,
          "{waznyDo}": expiresAt.toLocaleDateString("pl-PL", { timeZone: "Europe/Warsaw" }),
        },
      })
    } catch (emailError) {
      console.error("Failed to resend case referral email:", emailError)
      return NextResponse.json(
        { error: "Nie udało się wysłać wiadomości. Spróbuj ponownie." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, referral: updated, link })
  } catch (error) {
    console.error("Error resending case referral:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
