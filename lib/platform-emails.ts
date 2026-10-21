/**
 * Wysyłka maili z szablonów dodanych w październiku 2026 (prisma/seeds/email-templates/
 * platform-templates.ts). Wyzwalacze wołają te funkcje z tras API i z harmonogramu.
 *
 * Każda funkcja łapie własne błędy — nieudany mail nie może wycofać operacji,
 * która go wywołała (blokady konta, zmiany statusu płatności itd.).
 */
import { sendEmailWithTemplate } from "@/lib/email"
import { formatCurrency, formatDate } from "@/lib/format"
import { prisma } from "@/lib/prisma"
import { ContactSubject, EmailType } from "@prisma/client"

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

function baseUrl(): string {
  return (process.env.NEXTAUTH_URL || process.env.URL || "http://localhost:3000").replace(/\/$/, "")
}

/** Imię i nazwisko / nazwa eksperta do zwrotów w mailu. */
async function displayNameForUser(userId: string): Promise<{ email: string; name: string } | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      imie: true,
      nazwisko: true,
      deletedAt: true,
      client: { select: { imie: true, nazwisko: true } },
      lawFirm: { select: { nazwa: true } },
    },
  })
  if (!user || user.deletedAt) return null

  const name =
    user.lawFirm?.nazwa ||
    [user.client?.imie ?? user.imie, user.client?.nazwisko ?? user.nazwisko].filter(Boolean).join(" ") ||
    user.name ||
    user.email
  return { email: user.email, name }
}

// ============================================================================
// KONTO
// ============================================================================

/**
 * Potwierdzenie usunięcia konta. Wołane po anonimizacji — adres odbiorcy już nie
 * istnieje w bazie, więc w EmailLog zapisujemy zanonimizowany adres (`logTo`).
 */
export async function sendAccountDeletedEmail(params: {
  originalEmail: string
  imie: string | null
  logTo: string
}): Promise<void> {
  try {
    await sendEmailWithTemplate({
      to: params.originalEmail,
      templateType: EmailType.KONTO_USUNIETE,
      variables: { "{imie}": params.imie || "" },
      logTo: params.logTo,
    })
  } catch (error) {
    console.error("[platform-emails] KONTO_USUNIETE:", error)
  }
}

// ============================================================================
// MODERACJA (DSA art. 17 — uzasadnienie decyzji)
// ============================================================================

/** Statusy konta, których nadanie przez admina jest decyzją moderacyjną. */
export function isModerationStatus(status: unknown): status is "BLOCKED" | "SUSPENDED" {
  return status === "BLOCKED" || status === "SUSPENDED"
}

export function moderationDecisionLabel(status: "BLOCKED" | "SUSPENDED"): string {
  return status === "BLOCKED" ? "Blokada konta" : "Zawieszenie konta"
}

/**
 * Informuje użytkownika o decyzji moderacyjnej z uzasadnieniem i linkiem do
 * odwołania, a decyzję zapisuje w SystemLog (rozliczalność).
 */
export async function sendContentModeratedEmail(params: {
  userId: string
  decyzja: string
  tresc: string
  powod: string
  moderatorId?: string
}): Promise<void> {
  try {
    const recipient = await displayNameForUser(params.userId)
    if (!recipient) return

    const linkOdwolania =
      `${baseUrl()}/kontakt?temat=${ContactSubject.REKLAMACJA}&odwolanie=${encodeURIComponent(params.tresc)}`

    await sendEmailWithTemplate({
      to: recipient.email,
      templateType: EmailType.TRESC_ZABLOKOWANA,
      variables: {
        "{odbiorca}": recipient.name,
        "{decyzja}": params.decyzja,
        "{tresc}": params.tresc,
        "{powod}": params.powod,
        "{linkOdwolania}": linkOdwolania,
      },
    })

    await prisma.systemLog.create({
      data: {
        level: "INFO",
        action: "MODERATION_DECISION",
        message: `${params.decyzja}: ${params.tresc}`,
        userId: params.userId,
        metadata: JSON.stringify({ powod: params.powod, moderatorId: params.moderatorId ?? null }),
      },
    })
  } catch (error) {
    console.error("[platform-emails] TRESC_ZABLOKOWANA:", error)
  }
}

// ============================================================================
// OPINIE
// ============================================================================

export async function sendReviewRejectedEmail(reviewId: string): Promise<void> {
  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        powodOdrzucenia: true,
        lawFirm: { select: { slug: true } },
        client: { select: { imie: true, nazwisko: true, user: { select: { email: true, deletedAt: true } } } },
      },
    })
    if (!review?.client.user.email || review.client.user.deletedAt) return

    await sendEmailWithTemplate({
      to: review.client.user.email,
      templateType: EmailType.OPINIA_ODRZUCONA,
      variables: {
        "{klient}": `${review.client.imie} ${review.client.nazwisko}`.trim(),
        "{powod}": review.powodOdrzucenia || "",
        "{linkDoOceny}": `${baseUrl()}/ekspert/${review.lawFirm.slug}#reviews`,
      },
    })
  } catch (error) {
    console.error("[platform-emails] OPINIA_ODRZUCONA:", error)
  }
}

// ============================================================================
// WERYFIKACJA EKSPERTA
// ============================================================================

export async function sendLawFirmVerificationEmail(
  lawFirmId: string,
  result: { accepted: true } | { accepted: false; powod: string }
): Promise<void> {
  try {
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { id: lawFirmId },
      select: { nazwa: true, slug: true, user: { select: { email: true, deletedAt: true } } },
    })
    if (!lawFirm?.user.email || lawFirm.user.deletedAt) return

    const linkDoPanelu = `${baseUrl()}/panel-eksperta`
    if (result.accepted) {
      await sendEmailWithTemplate({
        to: lawFirm.user.email,
        templateType: EmailType.WERYFIKACJA_ZAAKCEPTOWANA,
        variables: {
          "{nazwa}": lawFirm.nazwa,
          "{linkDoPanelu}": linkDoPanelu,
          "{linkDoProfilu}": `${baseUrl()}/ekspert/${lawFirm.slug}`,
        },
      })
    } else {
      await sendEmailWithTemplate({
        to: lawFirm.user.email,
        templateType: EmailType.WERYFIKACJA_ODRZUCONA,
        variables: {
          "{nazwa}": lawFirm.nazwa,
          "{powod}": result.powod,
          "{linkDoPanelu}": `${linkDoPanelu}/profil`,
        },
      })
    }
  } catch (error) {
    console.error("[platform-emails] WERYFIKACJA:", error)
  }
}

// ============================================================================
// PŁATNOŚCI
// ============================================================================

/**
 * Mail po zmianie statusu zamówienia na ANULOWANE — przez operatora płatności
 * (PayU, Przelewy24) albo ręcznie w panelu admina. Wołać tylko wtedy, gdy wywołujący
 * faktycznie zmienił status na ANULOWANE (inaczej przyjdzie dwa razy).
 */
export async function sendPaymentFailedEmail(orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        orderType: true,
        kwota: true,
        liczbaPunktow: true,
        subscriptionPeriod: true,
        subscriptionPlan: { select: { nazwa: true } },
        lawFirm: { select: { user: { select: { email: true, deletedAt: true } } } },
      },
    })
    if (!order?.lawFirm.user.email || order.lawFirm.user.deletedAt) return

    const isSubscription = order.orderType === "SUBSCRIPTION"
    const produkt = isSubscription
      ? `pakiet ${order.subscriptionPlan?.nazwa ?? ""}${order.subscriptionPeriod ? ` (${order.subscriptionPeriod} mies.)` : ""}`.trim()
      : `${order.liczbaPunktow ?? ""} pkt`.trim()

    await sendEmailWithTemplate({
      to: order.lawFirm.user.email,
      templateType: EmailType.PLATNOSC_NIEUDANA,
      variables: {
        "{produkt}": produkt,
        "{kwota}": formatCurrency(order.kwota),
        "{linkPonow}": `${baseUrl()}/panel-eksperta/${isSubscription ? "pakiet" : "punkty"}`,
      },
    })
  } catch (error) {
    console.error("[platform-emails] PLATNOSC_NIEUDANA:", error)
  }
}

// ============================================================================
// FORMULARZ KONTAKTOWY
// ============================================================================

export function contactTicketNumber(contactFormId: string): string {
  return `ZG-${contactFormId.replace(/-/g, "").slice(0, 8).toUpperCase()}`
}

export async function sendContactFormReceivedEmail(params: {
  to: string
  imie: string
  contactFormId: string
  temat: string
  replyTo: string
}): Promise<void> {
  try {
    await sendEmailWithTemplate({
      to: params.to,
      templateType: EmailType.ZGLOSZENIE_PRZYJETE,
      variables: {
        "{imie}": params.imie,
        "{numerZgloszenia}": contactTicketNumber(params.contactFormId),
        "{temat}": params.temat,
      },
      // „Jeśli chcesz coś dopisać, odpowiedz na tę wiadomość” — odpowiedź ma trafić do BOK
      replyTo: params.replyTo,
    })
  } catch (error) {
    console.error("[platform-emails] ZGLOSZENIE_PRZYJETE:", error)
  }
}

// ============================================================================
// ZADANIA CYKLICZNE
// ============================================================================

/**
 * Sprawy dodane ponad 48 h temu, wciąż bez żadnej oferty. Okno 7 dni chroni przed
 * zasypaniem mailami klientów ze starymi sprawami przy pierwszym uruchomieniu.
 */
export async function sendCaseNoOffersReminders(now: Date = new Date()): Promise<number> {
  const cases = await prisma.case.findMany({
    where: {
      createdAt: { lte: new Date(now.getTime() - 48 * HOUR), gte: new Date(now.getTime() - 7 * DAY) },
      status: "NOWA",
      isArchived: false,
      czekaNaAktywacjeEmail: false,
      przypomnienieBezOfertAt: null,
      offers: { none: {} },
      client: { user: { deletedAt: null } },
    },
    select: {
      id: true,
      nazwaSprawy: true,
      client: { select: { imie: true, nazwisko: true, user: { select: { email: true } } } },
    },
    take: 200,
  })

  let sent = 0
  for (const c of cases) {
    // Zajęcie rekordu przed wysyłką — równoległe uruchomienie nie wyśle drugi raz
    const claimed = await prisma.case.updateMany({
      where: { id: c.id, przypomnienieBezOfertAt: null },
      data: { przypomnienieBezOfertAt: now },
    })
    if (claimed.count === 0 || !c.client.user.email) continue

    try {
      const ok = await sendEmailWithTemplate({
        to: c.client.user.email,
        templateType: EmailType.SPRAWA_BEZ_OFERT,
        variables: {
          "{klient}": `${c.client.imie} ${c.client.nazwisko}`.trim(),
          "{nazwaSprawy}": c.nazwaSprawy,
          "{linkDoSprawy}": `${baseUrl()}/panel-klienta/sprawy/${c.id}`,
        },
      })
      if (ok) sent++
    } catch (error) {
      console.error(`[platform-emails] SPRAWA_BEZ_OFERT (${c.id}):`, error)
    }
  }
  return sent
}

/**
 * Eksperci, którym za ≤ 7 dni kończy się bezpłatny pakiet Biznes przyznany przy
 * rejestracji. Zakup pakietu (opłacone zamówienie subskrypcji) wyklucza przypomnienie.
 */
export async function sendTrialEndingReminders(now: Date = new Date()): Promise<number> {
  const lawFirms = await prisma.lawFirm.findMany({
    where: {
      pakietProbny: true,
      pakietSubskrypcji: "BIZNES",
      dataPakietuDo: { gt: now, lte: new Date(now.getTime() + 7 * DAY) },
      przypomnienieKoniecProbnegoAt: null,
      orders: { none: { orderType: "SUBSCRIPTION", statusPlatnosci: "ZAPLACONE" } },
      user: { deletedAt: null },
    },
    select: { id: true, nazwa: true, dataPakietuDo: true, user: { select: { email: true } } },
  })

  let sent = 0
  for (const lf of lawFirms) {
    const claimed = await prisma.lawFirm.updateMany({
      where: { id: lf.id, przypomnienieKoniecProbnegoAt: null },
      data: { przypomnienieKoniecProbnegoAt: now },
    })
    if (claimed.count === 0 || !lf.user.email || !lf.dataPakietuDo) continue

    try {
      const ok = await sendEmailWithTemplate({
        to: lf.user.email,
        templateType: EmailType.OKRES_PROBNY_KONCZY_SIE,
        variables: {
          "{nazwa}": lf.nazwa,
          "{dataKonca}": formatDate(lf.dataPakietuDo),
          "{linkDoPakietow}": `${baseUrl()}/panel-eksperta/pakiet`,
        },
      })
      if (ok) sent++
    } catch (error) {
      console.error(`[platform-emails] OKRES_PROBNY_KONCZY_SIE (${lf.id}):`, error)
    }
  }
  return sent
}
