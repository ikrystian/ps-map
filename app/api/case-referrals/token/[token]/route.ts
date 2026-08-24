import { auth } from "@/auth"
import { isReferralUsable, maskEmail } from "@/lib/case-referrals"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/**
 * GET /api/case-referrals/token/[token] — publiczny odczyt polecenia.
 *
 * Trasa obsługuje zarówno landing `/polecenie/[token]` (bez sesji), jak i prefill
 * kreatora sprawy dla zalogowanego klienta. Dane wrażliwe (pełny e-mail, identyfikatory
 * do prefillu) wychodzą wyłącznie, gdy zalogowany klient ma adres zgodny z poleceniem.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params

    const referral = await prisma.caseReferral.findUnique({
      where: { token },
      include: {
        lawFirm: { select: { id: true, nazwa: true, slug: true, logo: true } },
        categories: { include: { category: { select: { id: true, nazwa: true } } } },
        city: { select: { id: true, nazwa: true } },
        voivodeship: { select: { id: true, nazwa: true, slug: true } },
      },
    })

    if (!referral) {
      return NextResponse.json(
        { error: "Link polecający nie istnieje.", reason: "not_found" },
        { status: 404 }
      )
    }

    const usability = isReferralUsable(referral)

    if (!usability.ok) {
      return NextResponse.json({ error: usability.message, reason: usability.reason }, { status: 410 })
    }

    const session = await auth()
    const sessionEmail = session?.user?.email?.toLowerCase() ?? null
    const isMatchingClient = session?.user?.role === "CLIENT" && sessionEmail === referral.email

    // Pierwsze wejście w link – oznacz jako otwarte
    if (referral.status === "WYSLANE") {
      await prisma.caseReferral.update({
        where: { id: referral.id },
        data: { status: "OTWARTE", otwarteAt: new Date() },
      })
    }

    // Klient z pasującym adresem wszedł w link – wiążemy polecenie z jego kontem.
    // Obsługuje też ścieżkę „mam już konto, loguję się" (bez przechodzenia przez rejestrację).
    if (isMatchingClient && !referral.clientId) {
      const client = await prisma.client.findUnique({ where: { userId: session!.user.id } })
      if (client) {
        await prisma.caseReferral.update({
          where: { id: referral.id },
          data: {
            clientId: client.id,
            status: "ZAREJESTROWANO",
            zarejestrowanoAt: referral.zarejestrowanoAt ?? new Date(),
          },
        })
      }
    }

    // Czy pod adresem z polecenia istnieje już konto — landing decyduje na tej podstawie,
    // czy pokazać CTA „Załóż konto", czy „Zaloguj się".
    const existingUser = await prisma.user.findUnique({
      where: { email: referral.email },
      select: { id: true, deletedAt: true },
    })

    return NextResponse.json({
      token: referral.token,
      ekspert: referral.lawFirm,
      kategorie: referral.categories.map((c) => c.category),
      miasto: referral.city,
      wojewodztwo: referral.voivodeship,
      typSprawy: referral.typSprawy,
      nazwaSprawy: referral.nazwaSprawy,
      wiadomosc: referral.wiadomosc,
      expiresAt: referral.expiresAt,
      emailMasked: maskEmail(referral.email),
      emailZarejestrowany: Boolean(existingUser && !existingUser.deletedAt),

      // Tylko dla właściciela adresu – dane potrzebne do prefillu kreatora sprawy
      ...(isMatchingClient
        ? {
            email: referral.email,
            prefill: {
              typSprawy: referral.typSprawy,
              categoryIds: referral.categories.map((c) => c.categoryId),
              cityId: referral.cityId,
              cityName: referral.city.nazwa,
              voivodeshipSlug: referral.voivodeship.slug,
              nazwaSprawy: referral.nazwaSprawy,
            },
          }
        : {}),
    })
  } catch (error) {
    console.error("Error fetching case referral by token:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
