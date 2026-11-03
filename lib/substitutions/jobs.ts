import { prisma } from "@/lib/prisma"
import { ELIGIBLE_FIRM_WHERE } from "./queries"
import {
  AUTO_CLOSE_HOURS,
  DIGEST_HOUR,
  DIGEST_MINUTE,
  FILE_RETENTION_DAYS,
  REMINDER_HOUR,
  czynnoscLabel,
} from "./constants"
import { deleteOrderFiles, deleteSubstitutionFile, listOrderDirectories } from "./files"
import { aplikantReadyFrom, canRoleSeeOrder, matchesSettings } from "./matching"
import { resolveRole } from "./people"
import { findPlace } from "./places"
import { ORDER_FULL_INCLUDE, isAcceptingOffers, type FullOrderRow } from "./serialize"
import { PANEL, broadcastNewOrder, notifyFirmUser, personCard, toMatchSettings, type BroadcastOrder } from "./service"
import type { TypMiejscaKey } from "./constants"
import { computeOffersDeadline, formatTermin, shiftDay, termEnd, warsawDay, warsawMinutesOfDay, warsawToUtc } from "./time"

/**
 * Zadanie cykliczne modułu zastępstw (lib/scheduler.ts → „substitutions”).
 * Każdy krok jest idempotentny: zmiany statusów idą przez warunkowe
 * `updateMany`, a wysłane przypomnienia i zestawienia mają znacznik czasu.
 */

const HOUR = 3600_000
const DAY = 24 * HOUR

const termText = (o: FullOrderRow) => formatTermin(o.termin, o.terminMaGodzine, o.terminDoUstalenia)
const label = (o: FullOrderRow) => o.numer ?? "zlecenia"

function toBroadcast(o: FullOrderRow): BroadcastOrder {
  return {
    id: o.id, numer: o.numer, tytul: o.tytul, zlecajacyId: o.zlecajacyId, pilne: o.pilne, typMiejsca: o.typMiejsca,
    miejsce: o.miejsce, miasto: o.miasto, latitude: o.latitude, longitude: o.longitude, czynnosc: o.czynnosc,
    dziedzina: o.dziedzina, stawka: o.stawka, termin: o.termin, terminMaGodzine: o.terminMaGodzine,
    terminDoUstalenia: o.terminDoUstalenia, dlaAdwokatow: o.dlaAdwokatow, dlaRadcow: o.dlaRadcow,
    dlaAplikantow: o.dlaAplikantow,
  }
}

/** Zapytanie bez odpowiedzi przez 13 h — zlecenie samo trafia na giełdę. */
export async function expireDirectRequests(now = new Date()): Promise<number> {
  const due = await prisma.substitution.findMany({
    where: { status: "ZAPYTANIE", zapytanieWazneDo: { lte: now } },
    include: ORDER_FULL_INCLUDE,
  })
  let moved = 0
  for (const order of due) {
    const { count } = await prisma.substitution.updateMany({
      where: { id: order.id, status: "ZAPYTANIE" },
      data: {
        status: "OPUBLIKOWANE",
        opublikowanoAt: now,
        ofertyDo: computeOffersDeadline(order, now),
        zapytanieOdpowiedz: "BRAK_ODPOWIEDZI",
      },
    })
    if (count === 0) continue
    moved++
    const fresh = await prisma.substitution.findUniqueOrThrow({ where: { id: order.id }, include: ORDER_FULL_INCLUDE })
    const asked = order.zapytanieDo
    await notifyFirmUser({
      userId: order.zlecajacy.userId,
      tytul: `Zapytanie bez odpowiedzi — ${label(order)} jest na giełdzie`,
      tresc: `${asked ? personCard(asked).nazwa : "Zapytana osoba"} nie odpowiedział(a) w czasie. Powiadomiliśmy pasujących prawników.`,
      link: `${PANEL}/moje/${order.id}`,
      email: {
        heading: "Zlecenie trafiło na giełdę",
        paragraphs: [
          `Nie dostaliśmy odpowiedzi na zapytanie w zleceniu „${order.tytul}”, więc zlecenie trafiło na giełdę. Każdą ofertę zobaczysz w „Moich zleceniach”.`,
        ],
        rows: [["Termin", termText(order)]],
        cta: "Zobacz zlecenie",
      },
    })
    if (asked) {
      await notifyFirmUser({
        userId: asked.userId,
        tytul: `Minął czas na odpowiedź w ${label(order)}`,
        tresc: `${order.tytul} · zlecenie trafiło na giełdę dla innych.`,
        link: PANEL,
        email: false,
      })
    }
    await broadcastNewOrder(toBroadcast(fresh), asked ? [asked.id] : [])
  }
  return moved
}

/** Raport bez potwierdzenia zlecającego przez 48 h — zamykamy (chyba że zgłosił problem). */
export async function autoCloseReported(now = new Date()): Promise<number> {
  const due = await prisma.substitution.findMany({
    where: {
      status: "WYKONANE",
      problemZgloszonoAt: null,
      wykonanoAt: { lte: new Date(now.getTime() - AUTO_CLOSE_HOURS * HOUR) },
    },
    include: ORDER_FULL_INCLUDE,
  })
  let closed = 0
  for (const order of due) {
    const { count } = await prisma.substitution.updateMany({
      where: { id: order.id, status: "WYKONANE", problemZgloszonoAt: null },
      data: { status: "ZAMKNIETE", zamknietoAt: now, zamknietoAutomatycznie: true },
    })
    if (count === 0) continue
    closed++
    await notifyFirmUser({
      userId: order.zlecajacy.userId,
      tytul: `Zlecenie ${label(order)} zamknięte automatycznie`,
      tresc: `${order.tytul} · minęło 48 h od raportu zastępcy. Możesz jeszcze ocenić współpracę.`,
      link: `${PANEL}/moje/${order.id}`,
      email: false,
    })
    if (order.zastepca) {
      await notifyFirmUser({
        userId: order.zastepca.userId,
        tytul: `Zlecenie ${label(order)} zamknięte`,
        tresc: `${order.tytul} · trafiło do Twoich rozliczeń.`,
        link: `${PANEL}/rozliczenia`,
        email: false,
      })
    }
  }
  return closed
}

/** Termin minął bez zastępcy — status „Wygasło”. Zlecenia bez terminu wygasają tydzień po końcu ofert. */
export async function expireUnassigned(now = new Date()): Promise<number> {
  const candidates = await prisma.substitution.findMany({
    where: {
      status: { in: ["OPUBLIKOWANE", "ZAPYTANIE"] },
      OR: [
        { termin: { lte: new Date(now.getTime() + DAY) }, terminDoUstalenia: false },
        { terminDoUstalenia: true, ofertyDo: { lte: new Date(now.getTime() - 7 * DAY) } },
      ],
    },
    include: ORDER_FULL_INCLUDE,
  })
  let expired = 0
  for (const order of candidates) {
    const ended = order.terminDoUstalenia
      ? !!order.ofertyDo && order.ofertyDo.getTime() + 7 * DAY <= now.getTime()
      : !!order.termin && termEnd(order.termin, order.terminMaGodzine) <= now
    if (!ended) continue
    const { count } = await prisma.substitution.updateMany({
      where: { id: order.id, status: { in: ["OPUBLIKOWANE", "ZAPYTANIE"] } },
      data: { status: "WYGASLO" },
    })
    if (count === 0) continue
    expired++
    await prisma.substitutionOffer.updateMany({
      where: { substitutionId: order.id, status: "OCZEKUJE" },
      data: { status: "ODRZUCONA" },
    })
    await notifyFirmUser({
      userId: order.zlecajacy.userId,
      tytul: `Zlecenie ${label(order)} wygasło`,
      tresc: `${order.tytul} · termin minął bez wybranego zastępcy.`,
      link: `${PANEL}/moje/${order.id}`,
      email: false,
    })
  }
  return expired
}

/** Dzień przed terminem o 18:00 — mail i SMS do zastępcy z adresem i salą. */
export async function sendDayBeforeReminders(now = new Date()): Promise<number> {
  if (warsawMinutesOfDay(now) < REMINDER_HOUR * 60) return 0
  const tomorrow = shiftDay(warsawDay(now), 1)
  const due = await prisma.substitution.findMany({
    where: {
      status: { in: ["PRZYDZIELONE", "POTWIERDZONE"] },
      przypomnienieWyslanoAt: null,
      terminDoUstalenia: false,
      termin: { gte: warsawToUtc(tomorrow), lt: warsawToUtc(shiftDay(tomorrow, 1)) },
    },
    include: { ...ORDER_FULL_INCLUDE, zastepca: { select: { ...ORDER_FULL_INCLUDE.zastepca.select, substitutionSettings: { select: { przypomnienie: true } } } } },
  })
  let sent = 0
  for (const order of due) {
    const { count } = await prisma.substitution.updateMany({
      where: { id: order.id, przypomnienieWyslanoAt: null },
      data: { przypomnienieWyslanoAt: now },
    })
    if (count === 0 || !order.zastepca || order.zastepca.substitutionSettings?.przypomnienie === false) continue
    sent++
    const where = [order.miejsce, order.wydzial].filter(Boolean).join(", ")
    const address = order.miejsce ? findPlace(order.typMiejsca as TypMiejscaKey, order.miejsce)?.adres : undefined
    const term = formatTermin(order.termin, order.terminMaGodzine, false)
    await notifyFirmUser({
      userId: order.zastepca.userId,
      tytul: `Jutro zastępstwo ${label(order)}`,
      tresc: `${term} · ${where}`,
      link: `${PANEL}/przyjete?zlecenie=${order.id}`,
      email: {
        heading: "Przypomnienie: jutro zastępstwo",
        paragraphs: [`Jutro masz zastępstwo dla: ${personCard(order.zlecajacy).nazwa} — „${order.tytul}”.`],
        rows: [
          ["Kiedy", term],
          ["Gdzie", where],
          ["Adres", address ?? ""],
          ["Czynność", czynnoscLabel(order.czynnosc)],
        ],
        cta: "Dane sprawy i instrukcja",
      },
      sms: {
        phone: order.zastepca.user.numerTelefonu,
        text: `Prosta Sprawa: jutro zastępstwo ${label(order)} - ${term}, ${where}${address ? `, ${address}` : ""}.`,
      },
    })
  }
  return sent
}

/** Poranne zestawienie (7:30) nowych pasujących zleceń dla tych, którzy wolą jeden mail dziennie. */
export async function sendDailyDigests(now = new Date()): Promise<number> {
  if (warsawMinutesOfDay(now) < DIGEST_HOUR * 60 + DIGEST_MINUTE) return 0
  const todaySlot = warsawToUtc(warsawDay(now), `${String(DIGEST_HOUR).padStart(2, "0")}:${String(DIGEST_MINUTE).padStart(2, "0")}`)

  const subscribers = await prisma.substitutionSettings.findMany({
    where: {
      zestawienieDzienne: true,
      przyjmuje: true,
      OR: [{ ostatnieZestawienieAt: null }, { ostatnieZestawienieAt: { lt: todaySlot } }],
      lawFirm: ELIGIBLE_FIRM_WHERE,
    },
    include: {
      lawFirm: {
        select: {
          id: true, userId: true, oraStatus: true, oraWpis: true, oirpStatus: true, oirpWpis: true,
          aplikantRodzaj: true, aplikacjaOd: true,
          user: { select: { miasto: true, latitude: true, longitude: true } },
        },
      },
    },
  })
  if (subscribers.length === 0) return 0

  const since = new Date(now.getTime() - DAY)
  const recent = await prisma.substitution.findMany({
    where: { status: "OPUBLIKOWANE", opublikowanoAt: { gte: since } },
    include: ORDER_FULL_INCLUDE,
    orderBy: { termin: "asc" },
  })

  let sent = 0
  for (const settings of subscribers) {
    await prisma.substitutionSettings.update({ where: { id: settings.id }, data: { ostatnieZestawienieAt: now } })
    const firm = settings.lawFirm
    const role = resolveRole(firm)
    if (!role || (role === "APLIKANT" && (!firm.aplikacjaOd || aplikantReadyFrom(firm.aplikacjaOd) > now))) continue
    const windowStart = settings.ostatnieZestawienieAt && settings.ostatnieZestawienieAt > since ? settings.ostatnieZestawienieAt : since
    const match = toMatchSettings(settings, firm.user)
    const orders = recent.filter(
      (order) =>
        order.zlecajacyId !== firm.id &&
        order.opublikowanoAt! >= windowStart &&
        isAcceptingOffers(order, now) &&
        canRoleSeeOrder(order, role) &&
        matchesSettings(order, match)
    )
    if (orders.length === 0) continue
    sent++
    await notifyFirmUser({
      userId: firm.userId,
      tytul: `Zastępstwa na dziś: ${orders.length} ${orders.length === 1 ? "nowe zlecenie" : "nowych zleceń"}`,
      tresc: orders.slice(0, 3).map((o) => o.tytul).join(" · "),
      link: PANEL,
      email: {
        heading: "Poranne zestawienie zastępstw",
        paragraphs: [`Od ostatniego zestawienia pojawiło się ${orders.length} zleceń pasujących do Twoich ustawień.`],
        rows: orders.slice(0, 15).map((o): [string, string] => [o.numer ?? "", `${o.tytul} · ${o.miejsce ?? ""} · ${termText(o)}`]),
        cta: "Otwórz giełdę zastępstw",
      },
    })
  }
  return sent
}

/** Pliki znikają 30 dni po zamknięciu, anulowaniu albo wygaśnięciu zlecenia (+ osierocone katalogi). */
export async function purgeExpiredFiles(now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - FILE_RETENTION_DAYS * DAY)
  const orders = await prisma.substitution.findMany({
    where: {
      pliki: { some: {} },
      OR: [
        { status: "ZAMKNIETE", zamknietoAt: { lte: cutoff } },
        { status: "ANULOWANE", anulowanoAt: { lte: cutoff } },
        { status: "WYGASLO", updatedAt: { lte: cutoff } },
      ],
    },
    select: { id: true, pliki: { select: { id: true, sciezka: true } } },
  })
  let removed = 0
  for (const order of orders) {
    for (const file of order.pliki) {
      await deleteSubstitutionFile(file.sciezka).catch((error) =>
        console.error(`[ZASTEPSTWA] Nie usunięto pliku ${file.sciezka}:`, error)
      )
      removed++
    }
    await prisma.substitutionFile.deleteMany({ where: { substitutionId: order.id } })
    await deleteOrderFiles(order.id).catch(() => undefined)
  }

  // Katalogi po zleceniach usuniętych z bazy (np. kaskadowo z kontem)
  const dirs = await listOrderDirectories()
  if (dirs.length > 0) {
    const existing = new Set(
      (await prisma.substitution.findMany({ where: { id: { in: dirs } }, select: { id: true } })).map((o) => o.id)
    )
    for (const dir of dirs.filter((d) => !existing.has(d))) {
      await deleteOrderFiles(dir).catch(() => undefined)
    }
  }
  return removed
}

export async function runSubstitutionMaintenance(now = new Date()) {
  const zapytaniaNaGielde = await expireDirectRequests(now)
  const zamknieteAutomatycznie = await autoCloseReported(now)
  const wygasle = await expireUnassigned(now)
  const przypomnienia = await sendDayBeforeReminders(now)
  const zestawienia = await sendDailyDigests(now)
  const usunietePliki = await purgeExpiredFiles(now)
  return { zapytaniaNaGielde, zamknieteAutomatycznie, wygasle, przypomnienia, zestawienia, usunietePliki }
}
