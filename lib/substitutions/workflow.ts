import { InsufficientPointsError, applyPointsChange } from "@/lib/points-ledger"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"
import { sendSystemNotification } from "@/lib/notifications"
import { Prisma, type SubstitutionStatus } from "@prisma/client"
import { z } from "zod"
import type { AccessFirm, SubstitutionAccess } from "./access"
import { ELIGIBLE_FIRM_WHERE } from "./queries"
import { EMPTY_CONFIDENTIAL, openConfidential, sealConfidential, type ConfidentialData } from "./confidential"
import {
  CONFIRM_HOURS,
  CZYNNOSCI,
  DIRECT_REQUEST_HOURS,
  DZIEDZINY,
  KTORY_TERMIN,
  LATE_RESIGNATION_HOURS,
  MAX_TITLE_LENGTH,
  OFERTY_DO,
  PRZEBIEG_RAPORTU,
  ROLE_ZASTEPCY,
  TYPY_MIEJSCA,
  URGENT_POINTS,
  przebiegLabel,
  values,
  type TypMiejscaKey,
} from "./constants"
import { deleteOrderFiles } from "./files"
import { aplikantReadyFrom, canRoleSeeOrder } from "./matching"
import { displayName, resolveRole } from "./people"
import { WOJEWODZTWA, findPlace } from "./places"
import { ORDER_FULL_INCLUDE, isAcceptingOffers, type FullOrderRow } from "./serialize"
import {
  PANEL,
  broadcastNewOrder,
  geocodeCity,
  nextSubstitutionNumber,
  notifyFirmUser,
  orderSummary,
  personCard,
  type BroadcastOrder,
} from "./service"
import { computeOffersDeadline, formatShort, formatTermin, hoursUntil, termEnd, warsawToUtc } from "./time"

/**
 * Cykl życia zlecenia zastępstwa. Każde przejście sprawdza, kto działa
 * (zlecający / wybrany zastępca / zgłaszający) i zmienia status warunkowo
 * (`updateMany` z oczekiwanym statusem), więc dwa równoległe kliknięcia nie
 * przestawią zlecenia dwa razy. Powiadomienia wracają jako zadania do
 * uruchomienia po odpowiedzi (`after`), żeby wysyłka maili nie blokowała UI.
 */

export class SubstitutionError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = "SubstitutionError"
  }
}

export type Task = () => Promise<unknown>

export interface ActionResult {
  message: string
  tasks: Task[]
  order?: FullOrderRow
}

export interface ActorContext {
  firm: AccessFirm
  access: SubstitutionAccess
}

export async function runTasks(tasks: Task[]): Promise<void> {
  for (const task of tasks) {
    try {
      await task()
    } catch (error) {
      console.error("[ZASTEPSTWA] Zadanie po akcji nie powiodło się:", error)
    }
  }
}

// ---------------------------------------------------------------------------
// Dane z kreatora
// ---------------------------------------------------------------------------

const text = (max: number) => z.string().trim().max(max).nullish()

export const orderInputSchema = z.object({
  tytul: z.string().trim().max(MAX_TITLE_LENGTH, `Tytuł może mieć najwyżej ${MAX_TITLE_LENGTH} znaków`).optional(),
  czynnosc: z.enum(values(CZYNNOSCI)).optional(),
  dziedzina: z.enum(values(DZIEDZINY)).optional(),
  rolaZastepcy: z.enum(values(ROLE_ZASTEPCY)).optional(),
  ktoryTermin: z.enum(values(KTORY_TERMIN)).optional(),
  opis: text(2000),
  typMiejsca: z.enum(values(TYPY_MIEJSCA)).optional(),
  miejsce: text(200),
  wydzial: text(200),
  miasto: text(100),
  wojewodztwo: z.enum(WOJEWODZTWA).nullish(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Nieprawidłowa data").nullish(),
  godzina: z.string().regex(/^\d{2}:\d{2}$/, "Nieprawidłowa godzina").nullish(),
  terminDoUstalenia: z.boolean().optional(),
  ofertyDoTryb: z.enum(values(OFERTY_DO)).optional(),
  dlaAdwokatow: z.boolean().optional(),
  dlaRadcow: z.boolean().optional(),
  dlaAplikantow: z.boolean().optional(),
  stawka: z.number().int().min(1, "Stawka musi być większa od zera").max(100000).nullish(),
  fakturaVat: z.boolean().optional(),
  trybWyboru: z.enum(["WYBIERAM", "PIERWSZY"]).optional(),
  pilne: z.boolean().optional(),
  zapytanieDoId: z.string().min(1).max(64).nullish(),
  poufne: z
    .object({
      sygnatura: text(100),
      strony: text(500),
      instrukcja: text(4000),
    })
    .optional(),
})

export type OrderInput = z.infer<typeof orderInputSchema>

export function parseOrderInput(body: unknown): OrderInput {
  const parsed = orderInputSchema.safeParse(body)
  if (!parsed.success) {
    throw new SubstitutionError(400, parsed.error.issues[0]?.message ?? "Nieprawidłowe dane zlecenia")
  }
  return parsed.data
}

const PUBLIC_FIELDS = [
  "tytul", "czynnosc", "dziedzina", "rolaZastepcy", "ktoryTermin", "opis", "typMiejsca", "miejsce", "wydzial",
  "miasto", "wojewodztwo", "data", "godzina", "terminDoUstalenia", "ofertyDoTryb", "dlaAdwokatow", "dlaRadcow",
  "dlaAplikantow", "stawka", "fakturaVat", "trybWyboru",
] as const

/** Zamienia dane z kreatora na zmiany w rekordzie. Miejsce z listy uzupełnia miejscowość i województwo. */
function buildOrderData(
  input: OrderInput,
  current: { typMiejsca: string; miejsce: string | null; termin: Date | null; terminMaGodzine: boolean } | null,
  options: { allowPrivateFlags: boolean }
): Prisma.SubstitutionUncheckedUpdateInput {
  const data: Prisma.SubstitutionUncheckedUpdateInput = {}
  const set = <K extends keyof Prisma.SubstitutionUncheckedUpdateInput>(key: K, value: Prisma.SubstitutionUncheckedUpdateInput[K]) => {
    if (value !== undefined) data[key] = value
  }

  set("tytul", input.tytul)
  set("czynnosc", input.czynnosc)
  set("dziedzina", input.dziedzina)
  set("rolaZastepcy", input.rolaZastepcy)
  set("ktoryTermin", input.ktoryTermin)
  if (input.opis !== undefined) data.opis = input.opis || null
  set("typMiejsca", input.typMiejsca)
  if (input.wydzial !== undefined) data.wydzial = input.wydzial || null
  set("terminDoUstalenia", input.terminDoUstalenia)
  set("ofertyDoTryb", input.ofertyDoTryb)
  set("dlaAdwokatow", input.dlaAdwokatow)
  set("dlaRadcow", input.dlaRadcow)
  set("dlaAplikantow", input.dlaAplikantow)
  if (input.stawka !== undefined) data.stawka = input.stawka ?? null
  set("fakturaVat", input.fakturaVat)
  set("trybWyboru", input.trybWyboru)

  if (options.allowPrivateFlags) {
    set("pilne", input.pilne)
    if (input.zapytanieDoId !== undefined) data.zapytanieDoId = input.zapytanieDoId || null
  }

  // Miejsce: z listy bierzemy miejscowość i województwo, inaczej to, co wpisał użytkownik
  const typ = (input.typMiejsca ?? current?.typMiejsca ?? "SAD") as TypMiejscaKey
  if (input.miejsce !== undefined || input.typMiejsca !== undefined || input.miasto !== undefined) {
    const miejsce = input.miejsce !== undefined ? input.miejsce || null : current?.miejsce ?? null
    data.miejsce = miejsce
    const known = miejsce ? findPlace(typ, miejsce) : undefined
    if (typ === "ZDALNIE") {
      data.miasto = known?.miasto || null
      data.wojewodztwo = known?.wojewodztwo || null
    } else if (known) {
      data.miasto = known.miasto
      data.wojewodztwo = known.wojewodztwo
    } else {
      if (input.miasto !== undefined) data.miasto = input.miasto || null
      if (input.wojewodztwo !== undefined) data.wojewodztwo = input.wojewodztwo || null
    }
    // Nowa miejscowość — współrzędne policzymy ponownie przy publikacji
    data.latitude = null
    data.longitude = null
  }

  if (input.data !== undefined || input.godzina !== undefined || input.terminDoUstalenia === true) {
    if (input.terminDoUstalenia === true) {
      data.termin = null
    } else if (input.data) {
      data.termin = warsawToUtc(input.data, input.godzina)
      data.terminMaGodzine = !!input.godzina
    } else if (input.data === null) {
      data.termin = null
    }
  }

  return data
}

function confidentialFromInput(input: OrderInput, current: ConfidentialData): ConfidentialData | null {
  if (!input.poufne) return null
  return {
    sygnatura: input.poufne.sygnatura !== undefined ? input.poufne.sygnatura ?? "" : current.sygnatura,
    strony: input.poufne.strony !== undefined ? input.poufne.strony ?? "" : current.strony,
    instrukcja: input.poufne.instrukcja !== undefined ? input.poufne.instrukcja ?? "" : current.instrukcja,
  }
}

export interface PublishIssue {
  krok: number
  pole: string
}

/** Braki blokujące publikację — w kolejności kroków kreatora (jak w makiecie). */
export function validateForPublish(
  order: Pick<
    FullOrderRow,
    | "tytul" | "typMiejsca" | "miejsce" | "miasto" | "termin" | "terminMaGodzine" | "terminDoUstalenia"
    | "dlaAdwokatow" | "dlaRadcow" | "dlaAplikantow" | "stawka" | "trybWyboru" | "zapytanieDoId"
  >,
  now: Date = new Date()
): PublishIssue[] {
  const issues: PublishIssue[] = []
  if (!order.tytul.trim()) issues.push({ krok: 1, pole: "tytuł" })
  if (!order.miejsce?.trim()) issues.push({ krok: 2, pole: "miejsce" })
  else if (order.typMiejsca !== "ZDALNIE" && !order.miasto?.trim()) issues.push({ krok: 2, pole: "miejscowość" })
  if (!order.terminDoUstalenia) {
    if (!order.termin) issues.push({ krok: 2, pole: "datę" })
    else if (termEnd(order.termin, order.terminMaGodzine) <= now) issues.push({ krok: 2, pole: "termin w przyszłości" })
  }
  if (!order.dlaAdwokatow && !order.dlaRadcow && !order.dlaAplikantow) issues.push({ krok: 3, pole: "kogo szukasz" })
  if (!order.stawka && order.trybWyboru === "PIERWSZY") issues.push({ krok: 3, pole: "stawkę (tryb „pierwszy, kto przyjmie”)" })
  if (!order.stawka && order.zapytanieDoId) issues.push({ krok: 3, pole: "stawkę (zapytanie do konkretnej osoby)" })
  return issues
}

function toBroadcast(order: FullOrderRow): BroadcastOrder {
  return {
    id: order.id,
    numer: order.numer,
    tytul: order.tytul,
    zlecajacyId: order.zlecajacyId,
    pilne: order.pilne,
    typMiejsca: order.typMiejsca,
    miejsce: order.miejsce,
    miasto: order.miasto,
    latitude: order.latitude,
    longitude: order.longitude,
    czynnosc: order.czynnosc,
    dziedzina: order.dziedzina,
    stawka: order.stawka,
    termin: order.termin,
    terminMaGodzine: order.terminMaGodzine,
    terminDoUstalenia: order.terminDoUstalenia,
    dlaAdwokatow: order.dlaAdwokatow,
    dlaRadcow: order.dlaRadcow,
    dlaAplikantow: order.dlaAplikantow,
  }
}

// ---------------------------------------------------------------------------
// Wspólne
// ---------------------------------------------------------------------------

export async function loadOrder(id: string): Promise<FullOrderRow> {
  const order = await prisma.substitution.findUnique({ where: { id }, include: ORDER_FULL_INCLUDE })
  if (!order) throw new SubstitutionError(404, "Nie znaleziono zlecenia")
  return order
}

function assertOwner(ctx: ActorContext, order: FullOrderRow) {
  if (order.zlecajacyId !== ctx.firm.id) throw new SubstitutionError(403, "To nie jest Twoje zlecenie")
}

function assertSubstitute(ctx: ActorContext, order: FullOrderRow) {
  if (order.zastepcaId !== ctx.firm.id) throw new SubstitutionError(403, "Nie jesteś zastępcą w tym zleceniu")
}

function assertStatus(order: FullOrderRow, allowed: SubstitutionStatus[], message: string) {
  if (!allowed.includes(order.status)) throw new SubstitutionError(409, message)
}

/** Warunkowa zmiana statusu — 409, gdy ktoś zdążył zmienić zlecenie wcześniej. */
async function transition(
  tx: Prisma.TransactionClient,
  id: string,
  where: Prisma.SubstitutionWhereInput,
  data: Prisma.SubstitutionUncheckedUpdateInput
) {
  const { count } = await tx.substitution.updateMany({ where: { id, ...where }, data })
  if (count === 0) throw new SubstitutionError(409, "Zlecenie zmieniło się w międzyczasie — odśwież stronę")
}

const actorName = (ctx: ActorContext) => displayName(ctx.firm)
const nameOf = (firm: Parameters<typeof personCard>[0]) => personCard(firm).nazwa
const ownerLink = (order: { id: string }) => `${PANEL}/moje/${order.id}`
const acceptedLink = (order: { id: string }) => `${PANEL}/przyjete?zlecenie=${order.id}`
const label = (order: FullOrderRow) => order.numer ?? "zlecenia"
const termText = (order: FullOrderRow) => formatTermin(order.termin, order.terminMaGodzine, order.terminDoUstalenia)
const termStart = (order: FullOrderRow) =>
  order.termin && !order.terminDoUstalenia ? termEnd(order.termin, order.terminMaGodzine) : null

/** Termin na potwierdzenie przyjęcia: 24 h, ale nie później niż sam termin. */
function confirmDeadline(order: FullOrderRow, now: Date): Date {
  const deadline = new Date(now.getTime() + CONFIRM_HOURS * 3600_000)
  const start = termStart(order)
  return start && start < deadline ? start : deadline
}

/** Czas na odpowiedź na zapytanie: 13 h, krócej przy bliskim terminie (min. 30 min). */
function directRequestDeadline(order: FullOrderRow, now: Date): Date {
  let deadline = now.getTime() + DIRECT_REQUEST_HOURS * 3600_000
  const start = termStart(order)
  if (start) deadline = Math.min(deadline, start.getTime() - 3600_000)
  return new Date(Math.max(deadline, now.getTime() + 30 * 60_000))
}

/** Rola działającego musi być dopuszczona przez zlecającego (aplikant: także bez SN/NSA/TK). */
function assertCanTake(ctx: ActorContext, order: FullOrderRow) {
  if (order.zlecajacyId === ctx.firm.id) throw new SubstitutionError(400, "Nie możesz zgłosić się do własnego zlecenia")
  if (!ctx.access.mozePrzyjmowac || !ctx.access.rola) {
    throw new SubstitutionError(403, "Zastępstwa przyjmiesz po 6 miesiącach aplikacji")
  }
  if (!canRoleSeeOrder(order, ctx.access.rola)) {
    throw new SubstitutionError(403, "Zlecający szuka zastępcy z innym tytułem zawodowym")
  }
}

/** Po odwołaniu wyboru albo rezygnacji wracają oferty odrzucone przy wyborze. */
async function reopenOffers(tx: Prisma.TransactionClient, order: FullOrderRow, exceptFirmId: string) {
  await tx.substitutionOffer.updateMany({
    where: { substitutionId: order.id, status: "ODRZUCONA", lawFirmId: { not: exceptFirmId } },
    data: { status: "OCZEKUJE" },
  })
}

function notifyReopened(order: FullOrderRow, exceptFirmId: string): Task[] {
  return order.oferty
    .filter((offer) => offer.status === "ODRZUCONA" && offer.lawFirmId !== exceptFirmId)
    .map((offer) => () =>
      notifyFirmUser({
        userId: offer.lawFirm.userId,
        tytul: `Zlecenie ${label(order)} znów szuka zastępcy`,
        tresc: `${order.tytul} · Twoja oferta jest ponownie brana pod uwagę.`,
        link: `${PANEL}?zlecenie=${order.id}`,
        email: false,
      })
    )
}

// ---------------------------------------------------------------------------
// Szkic i edycja
// ---------------------------------------------------------------------------

export async function createDraft(ctx: ActorContext, input: OrderInput) {
  if (!ctx.access.mozeZlecac) throw new SubstitutionError(403, "Zlecenia dodają adwokaci i radcowie prawni")
  const data = buildOrderData(input, null, { allowPrivateFlags: true }) as Prisma.SubstitutionUncheckedCreateInput
  const poufne = confidentialFromInput(input, EMPTY_CONFIDENTIAL)
  return prisma.substitution.create({
    data: {
      ...data,
      zlecajacyId: ctx.firm.id,
      status: "SZKIC",
      ...(poufne ? { poufne: { create: sealConfidential(poufne) } } : {}),
    },
    select: { id: true },
  })
}

/**
 * Zapis zmian zlecenia. Szkic — wszystko. Opublikowane bez zastępcy — pola
 * publiczne (zgłaszający dostają informację o zmianie). Po wyborze zastępcy
 * — już tylko dane poufne, które można uzupełnić także później.
 */
export async function updateOrder(ctx: ActorContext, id: string, input: OrderInput): Promise<ActionResult> {
  const order = await loadOrder(id)
  assertOwner(ctx, order)
  if (["ZAMKNIETE", "WYGASLO", "ANULOWANE"].includes(order.status)) {
    throw new SubstitutionError(409, "Zakończonego zlecenia nie można zmieniać")
  }

  const isDraft = order.status === "SZKIC"
  const publicEditable = isDraft || order.status === "OPUBLIKOWANE" || order.status === "ZAPYTANIE"
  const touchesPublic = PUBLIC_FIELDS.some((field) => input[field] !== undefined)
  if (touchesPublic && !publicEditable) {
    throw new SubstitutionError(409, "Po wyborze zastępcy możesz zmieniać już tylko dane poufne")
  }

  const data = publicEditable ? buildOrderData(input, order, { allowPrivateFlags: isDraft }) : {}
  const current = openConfidential(order.poufne)
  const poufne = confidentialFromInput(input, current)
  const tasks: Task[] = []

  const updated = await prisma.$transaction(async (tx) => {
    if (Object.keys(data).length > 0) {
      await tx.substitution.update({ where: { id }, data })
    }
    if (poufne) {
      const sealed = sealConfidential(poufne)
      await tx.substitutionConfidential.upsert({
        where: { substitutionId: id },
        create: { substitutionId: id, ...sealed },
        update: sealed,
      })
    }
    let next = await tx.substitution.findUniqueOrThrow({ where: { id }, include: ORDER_FULL_INCLUDE })

    if (!isDraft && touchesPublic) {
      const issues = validateForPublish(next)
      if (issues.length > 0) {
        throw new SubstitutionError(400, `Uzupełnij: ${issues.map((i) => i.pole).join(", ")}.`, issues)
      }
      // Termin ofert liczymy od chwili wejścia na giełdę, ale z nowym terminem czynności
      if (next.status === "OPUBLIKOWANE") {
        await tx.substitution.update({
          where: { id },
          data: { ofertyDo: computeOffersDeadline(next, next.opublikowanoAt ?? new Date()) },
        })
        next = await tx.substitution.findUniqueOrThrow({ where: { id }, include: ORDER_FULL_INCLUDE })
      }
    }
    return next
  })

  if (!isDraft && touchesPublic && updated.typMiejsca !== "ZDALNIE" && updated.latitude == null && updated.miasto) {
    const coords = await geocodeCity(updated.miasto)
    if (coords) await prisma.substitution.update({ where: { id }, data: { latitude: coords.lat, longitude: coords.lng } })
  }

  if (!isDraft && touchesPublic) {
    for (const offer of updated.oferty.filter((o) => o.status === "OCZEKUJE")) {
      tasks.push(() =>
        notifyFirmUser({
          userId: offer.lawFirm.userId,
          tytul: `Zlecenie ${label(updated)} zostało zmienione`,
          tresc: `${updated.tytul} · ${termText(updated)}. Sprawdź szczegóły — Twoja oferta jest nadal aktywna.`,
          link: `${PANEL}?zlecenie=${updated.id}`,
          email: {
            heading: "Zlecający zmienił zlecenie",
            paragraphs: [`Zlecenie „${updated.tytul}”, do którego się zgłosiłeś, zostało zmienione. Sprawdź, czy nadal Ci odpowiada.`],
            rows: [
              ["Numer", updated.numer ?? ""],
              ["Miejsce", updated.miejsce ?? ""],
              ["Termin", termText(updated)],
            ],
            cta: "Zobacz zlecenie",
          },
        })
      )
    }
  }

  if (poufne && updated.zastepca && ["PRZYDZIELONE", "POTWIERDZONE"].includes(updated.status)) {
    const substitute = updated.zastepca
    tasks.push(() =>
      notifyFirmUser({
        userId: substitute.userId,
        tytul: `Zlecający uzupełnił dane sprawy ${label(updated)}`,
        tresc: `${updated.tytul} · sprawdź instrukcję i dokumenty przed terminem.`,
        link: acceptedLink(updated),
        email: false,
      })
    )
  }

  return { message: isDraft ? "Szkic zapisany." : "Zmiany zapisane.", tasks, order: updated }
}

export async function deleteDraft(ctx: ActorContext, id: string): Promise<ActionResult> {
  const order = await loadOrder(id)
  assertOwner(ctx, order)
  assertStatus(order, ["SZKIC"], "Usunąć można tylko szkic — opublikowane zlecenie anuluj")
  await prisma.substitution.delete({ where: { id } })
  await deleteOrderFiles(id).catch((error) => console.error("[ZASTEPSTWA] Sprzątanie plików szkicu:", error))
  return { message: "Szkic usunięty.", tasks: [] }
}

// ---------------------------------------------------------------------------
// Publikacja
// ---------------------------------------------------------------------------

function isNumberConflict(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    JSON.stringify(error.meta ?? {}).includes("numer")
  )
}

export async function publishOrder(ctx: ActorContext, id: string, body: { oswiadczenie?: boolean }): Promise<ActionResult> {
  if (!ctx.access.mozeZlecac) throw new SubstitutionError(403, "Zlecenia dodają adwokaci i radcowie prawni")
  const order = await loadOrder(id)
  assertOwner(ctx, order)
  assertStatus(order, ["SZKIC"], "To zlecenie jest już opublikowane")
  if (body.oswiadczenie !== true) {
    throw new SubstitutionError(400, "Potwierdź, że opis nie zawiera danych, po których da się rozpoznać klienta")
  }

  const now = new Date()
  const issues = validateForPublish(order, now)
  if (issues.length > 0) {
    throw new SubstitutionError(400, `Uzupełnij: ${issues.map((i) => i.pole).join(", ")}.`, issues)
  }

  let recipient: { id: string; userId: string } | null = null
  if (order.zapytanieDoId) {
    const firm = await prisma.lawFirm.findFirst({
      where: { id: order.zapytanieDoId, ...ELIGIBLE_FIRM_WHERE },
      select: {
        id: true, userId: true, oraStatus: true, oraWpis: true, oirpStatus: true, oirpWpis: true,
        aplikantRodzaj: true, aplikacjaOd: true, substitutionSettings: { select: { przyjmuje: true } },
      },
    })
    const role = firm ? resolveRole(firm) : null
    const ready = !!role && (role !== "APLIKANT" || (!!firm?.aplikacjaOd && aplikantReadyFrom(firm.aplikacjaOd) <= now))
    if (!firm || firm.id === ctx.firm.id || !ready || !canRoleSeeOrder(order, role!) || firm.substitutionSettings?.przyjmuje === false) {
      throw new SubstitutionError(400, "Wybrana osoba nie może teraz przyjąć tego zlecenia — wybierz giełdę albo inną osobę")
    }
    recipient = { id: firm.id, userId: firm.userId }
  }

  const coords =
    order.typMiejsca !== "ZDALNIE" && order.latitude == null ? await geocodeCity(order.miasto) : null

  let published: FullOrderRow | null = null
  for (let attempt = 0; attempt < 3 && !published; attempt++) {
    try {
      published = await prisma.$transaction(async (tx) => {
        const numer = await nextSubstitutionNumber(tx, now)
        let pilnePunkty: number | null = null
        if (order.pilne) {
          await applyPointsChange(tx, ctx.firm.id, -URGENT_POINTS, "SUBSTITUTION_URGENT", `Pilne zastępstwo ${numer}`)
          pilnePunkty = URGENT_POINTS
        }
        const data: Prisma.SubstitutionUncheckedUpdateInput = {
          numer,
          pilnePunkty,
          ...(coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
          ...(recipient
            ? { status: "ZAPYTANIE", zapytanieWazneDo: directRequestDeadline(order, now) }
            : { status: "OPUBLIKOWANE", opublikowanoAt: now, ofertyDo: computeOffersDeadline(order, now) }),
        }
        await transition(tx, id, { status: "SZKIC" }, data)
        return tx.substitution.findUniqueOrThrow({ where: { id }, include: ORDER_FULL_INCLUDE })
      })
    } catch (error) {
      if (isNumberConflict(error) && attempt < 2) continue
      if (error instanceof InsufficientPointsError) {
        throw new SubstitutionError(400, `Za mało punktów — oznaczenie „Pilne” kosztuje ${URGENT_POINTS} pkt.`)
      }
      throw error
    }
  }
  if (!published) throw new SubstitutionError(500, "Nie udało się nadać numeru zlecenia — spróbuj ponownie")

  const result = published
  const tasks: Task[] = []
  if (recipient) {
    const to = recipient
    tasks.push(() =>
      notifyFirmUser({
        userId: to.userId,
        tytul: `${actorName(ctx)} prosi Cię o zastępstwo`,
        tresc: `${result.tytul} · ${orderSummary(toBroadcast(result))} · ${result.stawka} zł netto. Odpowiedz do ${formatShort(result.zapytanieWazneDo!)}.`,
        link: PANEL,
        email: {
          heading: "Zapytanie o zastępstwo",
          paragraphs: [
            `${actorName(ctx)} prosi Cię o zastępstwo. Jeśli nie odpowiesz do ${formatShort(result.zapytanieWazneDo!)}, zlecenie trafi na giełdę.`,
          ],
          rows: [
            ["Czynność", result.tytul],
            ["Miejsce", result.miejsce ?? ""],
            ["Termin", termText(result)],
            ["Wynagrodzenie", `${result.stawka} zł netto${result.fakturaVat ? ", faktura VAT" : ""}`],
          ],
          cta: "Odpowiedz na zapytanie",
        },
      })
    )
  } else {
    tasks.push(() => broadcastNewOrder(toBroadcast(result)))
  }

  return { message: recipient ? "Zapytanie wysłane." : "Zlecenie opublikowane.", tasks, order: result }
}

// ---------------------------------------------------------------------------
// Oferty
// ---------------------------------------------------------------------------

const offerSchema = z.object({
  stawka: z.number().int().min(1, "Wpisz stawkę").max(100000).nullish(),
  przyjmujeStawke: z.boolean().optional(),
  notatka: z.string().trim().max(1000).nullish(),
  fakturaVat: z.boolean().optional(),
})

export async function submitOffer(ctx: ActorContext, id: string, body: unknown): Promise<ActionResult> {
  const parsed = offerSchema.safeParse(body)
  if (!parsed.success) throw new SubstitutionError(400, parsed.error.issues[0]?.message ?? "Nieprawidłowa oferta")
  const input = parsed.data

  const order = await loadOrder(id)
  assertCanTake(ctx, order)
  if (!isAcceptingOffers(order)) throw new SubstitutionError(409, "To zlecenie nie przyjmuje już ofert")

  const existing = order.oferty.find((offer) => offer.lawFirmId === ctx.firm.id)
  if (existing && ["ODRZUCONA", "REZYGNACJA", "WYBRANA"].includes(existing.status)) {
    throw new SubstitutionError(409, "Nie możesz ponownie zgłosić się do tego zlecenia")
  }
  const now = new Date()
  const owner = order.zlecajacy

  // Pierwszy, kto przyjmie stawkę, bierze zlecenie
  if (order.trybWyboru === "PIERWSZY") {
    if (!order.stawka) throw new SubstitutionError(409, "To zlecenie nie ma stawki do przyjęcia")
    await prisma.$transaction(async (tx) => {
      await transition(tx, id, { status: "OPUBLIKOWANE", zastepcaId: null }, {
        status: "PRZYDZIELONE",
        zastepcaId: ctx.firm.id,
        wybranoAt: now,
        potwierdzenieDo: confirmDeadline(order, now),
        stawkaUzgodniona: order.stawka,
      })
      const offerData = {
        stawka: order.stawka!,
        notatka: input.notatka || null,
        fakturaVat: input.fakturaVat ?? order.fakturaVat,
        status: "WYBRANA" as const,
      }
      await tx.substitutionOffer.upsert({
        where: { substitutionId_lawFirmId: { substitutionId: id, lawFirmId: ctx.firm.id } },
        create: { substitutionId: id, lawFirmId: ctx.firm.id, ...offerData },
        update: offerData,
      })
    })
    return {
      message: "Zlecenie jest Twoje. Potwierdź przyjęcie w „Przyjętych”.",
      tasks: [
        () =>
          notifyFirmUser({
            userId: owner.userId,
            tytul: `${actorName(ctx)} przyjmuje zlecenie ${label(order)}`,
            tresc: `${order.tytul} · ${order.stawka} zł netto. Odsłoniliśmy dane sprawy, czekamy na potwierdzenie przyjęcia.`,
            link: ownerLink(order),
            email: {
              heading: "Ktoś przyjął Twoje zlecenie",
              paragraphs: [
                `${actorName(ctx)} przyjmuje zlecenie „${order.tytul}” za ${order.stawka} zł netto.`,
                "Odsłoniliśmy mu sygnaturę, dane stron i pliki. Pełnomocnictwo substytucyjne (dla aplikanta: upoważnienie) wystawiasz sam — wzór pobierzesz w szczegółach zlecenia.",
              ],
              rows: [["Termin", termText(order)], ["Miejsce", order.miejsce ?? ""]],
              cta: "Zobacz zlecenie",
            },
          }),
      ],
    }
  }

  const stawka = input.przyjmujeStawke && order.stawka ? order.stawka : input.stawka
  if (!stawka) throw new SubstitutionError(400, "Wpisz stawkę")

  const offerData = {
    stawka,
    notatka: input.notatka || null,
    fakturaVat: input.fakturaVat ?? false,
    status: "OCZEKUJE" as const,
  }
  await prisma.substitutionOffer.upsert({
    where: { substitutionId_lawFirmId: { substitutionId: id, lawFirmId: ctx.firm.id } },
    create: { substitutionId: id, lawFirmId: ctx.firm.id, ...offerData },
    update: offerData,
  })

  const changed = existing?.status === "OCZEKUJE"
  return {
    message: changed ? "Oferta zmieniona." : "Oferta wysłana do zlecającego.",
    tasks: [
      () =>
        notifyFirmUser({
          userId: owner.userId,
          tytul: changed ? `Zmieniona oferta do ${label(order)}` : `Nowa oferta do ${label(order)}`,
          tresc: `${actorName(ctx)}, ${stawka} zł netto${input.fakturaVat ? ", faktura VAT" : ""}`,
          link: ownerLink(order),
          email: changed
            ? false
            : {
                heading: "Nowa oferta zastępstwa",
                paragraphs: [`${actorName(ctx)} zgłasza się do zlecenia „${order.tytul}”.`, ...(input.notatka ? [`„${input.notatka}”`] : [])],
                rows: [
                  ["Stawka", `${stawka} zł netto${input.fakturaVat ? ", faktura VAT" : ""}`],
                  ["Termin", termText(order)],
                ],
                cta: "Porównaj oferty",
              },
        }),
    ],
  }
}

export async function withdrawOffer(ctx: ActorContext, id: string): Promise<ActionResult> {
  const { count } = await prisma.substitutionOffer.updateMany({
    where: { substitutionId: id, lawFirmId: ctx.firm.id, status: "OCZEKUJE", substitution: { status: "OPUBLIKOWANE" } },
    data: { status: "WYCOFANA" },
  })
  if (count === 0) throw new SubstitutionError(409, "Nie masz aktywnej oferty do wycofania")
  return { message: "Oferta wycofana.", tasks: [] }
}

// ---------------------------------------------------------------------------
// Akcje na zleceniu
// ---------------------------------------------------------------------------

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel"), powod: z.string().trim().min(3, "Podaj powód anulowania").max(500) }),
  z.object({ action: z.literal("archive"), zarchiwizowane: z.boolean() }),
  z.object({ action: z.literal("select"), offerId: z.string().min(1) }),
  z.object({ action: z.literal("unassign") }),
  z.object({ action: z.literal("remind") }),
  z.object({ action: z.literal("respond"), decyzja: z.enum(["TAK", "NIE"]) }),
  z.object({ action: z.literal("confirm") }),
  z.object({ action: z.literal("resign"), powod: z.string().trim().max(500).nullish() }),
  z.object({ action: z.literal("on-site") }),
  z.object({
    action: z.literal("report"),
    przebieg: z.enum(values(PRZEBIEG_RAPORTU)),
    kolejnyTermin: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Nieprawidłowy kolejny termin").nullish(),
    notatka: z.string().trim().min(10, "Napisz w notatce, co się wydarzyło (min. 10 znaków)").max(4000),
  }),
  z.object({
    action: z.literal("complete"),
    ocena: z.number().int().min(1).max(5).nullish(),
    komentarz: z.string().trim().max(1000).nullish(),
  }),
  z.object({ action: z.literal("problem"), opis: z.string().trim().min(10, "Opisz problem (min. 10 znaków)").max(2000) }),
  z.object({ action: z.literal("invoice"), status: z.enum(["DO_WYSTAWIENIA", "WYSTAWIONA", "OPLACONA"]) }),
])

export type OrderAction = z.infer<typeof actionSchema>

export function parseAction(body: unknown): OrderAction {
  const parsed = actionSchema.safeParse(body)
  if (!parsed.success) throw new SubstitutionError(400, parsed.error.issues[0]?.message ?? "Nieznana akcja")
  return parsed.data
}

export async function performAction(ctx: ActorContext, id: string, action: OrderAction): Promise<ActionResult> {
  const order = await loadOrder(id)
  const now = new Date()

  switch (action.action) {
    case "cancel": {
      assertOwner(ctx, order)
      const allowed: SubstitutionStatus[] = ["ZAPYTANIE", "OPUBLIKOWANE", "PRZYDZIELONE", "POTWIERDZONE"]
      assertStatus(order, allowed, "Tego zlecenia nie można już anulować")
      await prisma.$transaction(async (tx) => {
        await transition(tx, id, { status: { in: allowed } }, {
          status: "ANULOWANE",
          anulowanoAt: now,
          powodAnulowania: action.powod,
        })
        await tx.substitutionOffer.updateMany({
          where: { substitutionId: id, status: { in: ["OCZEKUJE", "WYBRANA"] } },
          data: { status: "ODRZUCONA" },
        })
      })
      const affected = order.oferty.filter((o) => o.status === "OCZEKUJE" || o.status === "WYBRANA")
      const start = termStart(order)
      // Wybrany zastępca tuż przed terminem dostaje też SMS — żeby nie pojechał na próżno
      const smsToChosen = !!start && hoursUntil(start, now) < 24
      const tasks: Task[] = affected.map((offer) => () => {
        const chosen = offer.status === "WYBRANA"
        return notifyFirmUser({
          userId: offer.lawFirm.userId,
          tytul: `Zlecenie ${label(order)} zostało anulowane`,
          tresc: `${order.tytul} · powód: ${action.powod}`,
          link: chosen ? acceptedLink(order) : `${PANEL}?zlecenie=${order.id}`,
          email: {
            heading: "Zlecenie anulowane",
            paragraphs: [
              `${actorName(ctx)} anulował(a) zlecenie „${order.tytul}”.`,
              chosen ? "Nie musisz stawiać się na czynności." : "Twoja oferta jest nieaktualna.",
            ],
            rows: [["Powód", action.powod], ["Termin", termText(order)]],
          },
          sms:
            chosen && smsToChosen
              ? {
                  phone: offer.lawFirm.user.numerTelefonu,
                  text: `Prosta Sprawa: zastępstwo ${label(order)} (${termText(order)}) zostało anulowane. Nie musisz się stawiać.`,
                }
              : undefined,
        })
      })
      if (order.status === "ZAPYTANIE" && order.zapytanieDo) {
        const asked = order.zapytanieDo
        tasks.push(() =>
          notifyFirmUser({
            userId: asked.userId,
            tytul: `Zapytanie ${label(order)} zostało wycofane`,
            tresc: `${order.tytul} · zlecający anulował zlecenie.`,
            link: PANEL,
            email: false,
          })
        )
      }
      return { message: "Zlecenie anulowane. Powiadomiliśmy zgłoszonych.", tasks }
    }

    case "archive": {
      assertOwner(ctx, order)
      assertStatus(order, ["ZAMKNIETE", "WYGASLO", "ANULOWANE"], "Archiwizować można tylko zakończone zlecenia")
      await prisma.substitution.update({ where: { id }, data: { zarchiwizowane: action.zarchiwizowane } })
      return { message: action.zarchiwizowane ? "Zlecenie przeniesione do archiwum." : "Zlecenie przywrócone z archiwum.", tasks: [] }
    }

    case "select": {
      assertOwner(ctx, order)
      assertStatus(order, ["OPUBLIKOWANE"], "Zastępca jest już wybrany albo zlecenie jest zamknięte")
      const offer = order.oferty.find((o) => o.id === action.offerId)
      if (!offer || offer.status !== "OCZEKUJE") throw new SubstitutionError(409, "Ta oferta nie jest już aktualna")
      const start = termStart(order)
      if (start && start <= now) throw new SubstitutionError(409, "Termin czynności już minął")

      await prisma.$transaction(async (tx) => {
        await transition(tx, id, { status: "OPUBLIKOWANE", zastepcaId: null }, {
          status: "PRZYDZIELONE",
          zastepcaId: offer.lawFirmId,
          wybranoAt: now,
          potwierdzenieDo: confirmDeadline(order, now),
          stawkaUzgodniona: offer.stawka,
        })
        await tx.substitutionOffer.update({ where: { id: offer.id }, data: { status: "WYBRANA" } })
        await tx.substitutionOffer.updateMany({
          where: { substitutionId: id, status: "OCZEKUJE", id: { not: offer.id } },
          data: { status: "ODRZUCONA" },
        })
      })

      const deadline = confirmDeadline(order, now)
      const urgent = order.pilne || (start ? hoursUntil(start, now) < 48 : false)
      const tasks: Task[] = [
        () =>
          notifyFirmUser({
            userId: offer.lawFirm.userId,
            tytul: `Wybrano Cię do zastępstwa ${label(order)}`,
            tresc: `${order.tytul} · ${termText(order)}. Potwierdź przyjęcie do ${formatShort(deadline)}.`,
            link: acceptedLink(order),
            email: {
              heading: "Zlecający wybrał Twoją ofertę",
              paragraphs: [
                `${actorName(ctx)} wybrał(a) Cię do zlecenia „${order.tytul}”. Odsłoniliśmy Ci sygnaturę, dane stron, instrukcję i pliki.`,
                `Potwierdź przyjęcie do ${formatShort(deadline)}.`,
              ],
              rows: [
                ["Termin", termText(order)],
                ["Miejsce", [order.miejsce, order.wydzial].filter(Boolean).join(", ")],
                ["Stawka", `${offer.stawka} zł netto`],
              ],
              cta: "Potwierdź przyjęcie",
            },
            sms: urgent
              ? {
                  phone: offer.lawFirm.user.numerTelefonu,
                  text: `Prosta Sprawa: wybrano Cię do zastępstwa ${label(order)} (${termText(order)}). Potwierdź przyjęcie w panelu do ${formatShort(deadline)}.`,
                }
              : undefined,
          }),
        ...order.oferty
          .filter((o) => o.status === "OCZEKUJE" && o.id !== offer.id)
          .map((o) => () =>
            notifyFirmUser({
              userId: o.lawFirm.userId,
              tytul: `Zlecenie ${label(order)} jest obsadzone`,
              tresc: `${order.tytul} · zlecający wybrał innego zastępcę. Dziękujemy za zgłoszenie.`,
              link: `${PANEL}?zlecenie=${order.id}`,
              email: {
                heading: "Zlecenie obsadzone",
                paragraphs: [`Zlecający wybrał innego zastępcę do zlecenia „${order.tytul}”. Dziękujemy za zgłoszenie.`],
                cta: "Zobacz inne zlecenia",
              },
            })
          ),
      ]
      return { message: `Wybrano: ${nameOf(offer.lawFirm)}. Czekamy na potwierdzenie.`, tasks }
    }

    case "unassign": {
      assertOwner(ctx, order)
      assertStatus(order, ["PRZYDZIELONE"], "Zmienić zastępcę można przed potwierdzeniem przyjęcia")
      const previous = order.zastepca
      if (!previous) throw new SubstitutionError(409, "Zlecenie nie ma wybranego zastępcy")
      await prisma.$transaction(async (tx) => {
        await transition(tx, id, { status: "PRZYDZIELONE", zastepcaId: previous.id }, {
          status: "OPUBLIKOWANE",
          zastepcaId: null,
          wybranoAt: null,
          potwierdzenieDo: null,
          stawkaUzgodniona: null,
        })
        await reopenOffers(tx, order, previous.id)
        await tx.substitutionOffer.updateMany({
          where: { substitutionId: id, lawFirmId: previous.id },
          data: { status: "ODRZUCONA" },
        })
      })
      return {
        message: "Wybór odwołany. Wracasz do pozostałych ofert.",
        tasks: [
          () =>
            notifyFirmUser({
              userId: previous.userId,
              tytul: `Zlecający odwołał wybór w ${label(order)}`,
              tresc: `${order.tytul} · nie musisz już potwierdzać przyjęcia.`,
              link: `${PANEL}/przyjete`,
              email: {
                heading: "Wybór odwołany",
                paragraphs: [`${actorName(ctx)} odwołał(a) wybór w zleceniu „${order.tytul}”. Nie musisz stawiać się na czynności.`],
              },
            }),
          ...notifyReopened(order, previous.id),
        ],
      }
    }

    case "remind": {
      assertOwner(ctx, order)
      assertStatus(order, ["PRZYDZIELONE"], "Przypomnienie wysyłamy, gdy zastępca jeszcze nie potwierdził")
      const substitute = order.zastepca
      if (!substitute) throw new SubstitutionError(409, "Zlecenie nie ma wybranego zastępcy")
      const limit = rateLimit(`substitution-remind:${id}`, { limit: 1, windowMs: 2 * 3600_000 })
      if (!limit.success) throw new SubstitutionError(429, "Przypomnienie wysłaliśmy niedawno — spróbuj za jakiś czas")
      return {
        message: "Przypomnienie wysłane SMS-em i mailem.",
        tasks: [
          () =>
            notifyFirmUser({
              userId: substitute.userId,
              tytul: `Przypomnienie: potwierdź zastępstwo ${label(order)}`,
              tresc: `${order.tytul} · ${termText(order)}. Zlecający czeka na Twoje potwierdzenie.`,
              link: acceptedLink(order),
              force: true,
              email: {
                heading: "Zlecający czeka na Twoje potwierdzenie",
                paragraphs: [`${actorName(ctx)} prosi o potwierdzenie przyjęcia zastępstwa „${order.tytul}”.`],
                rows: [["Termin", termText(order)], ["Miejsce", order.miejsce ?? ""]],
                cta: "Potwierdź przyjęcie",
              },
              sms: {
                phone: substitute.user.numerTelefonu,
                text: `Prosta Sprawa: ${actorName(ctx)} prosi o potwierdzenie zastępstwa ${label(order)} (${termText(order)}).`,
              },
            }),
        ],
      }
    }

    case "respond": {
      if (order.zapytanieDoId !== ctx.firm.id) throw new SubstitutionError(403, "To zapytanie nie jest do Ciebie")
      assertStatus(order, ["ZAPYTANIE"], "Na to zapytanie odpowiedziano już wcześniej")
      if (order.zapytanieWazneDo && order.zapytanieWazneDo <= now) {
        throw new SubstitutionError(409, "Czas na odpowiedź minął — zlecenie trafiło na giełdę")
      }
      const owner = order.zlecajacy

      if (action.decyzja === "TAK") {
        assertCanTake(ctx, order)
        await prisma.$transaction(async (tx) => {
          await transition(tx, id, { status: "ZAPYTANIE", zapytanieDoId: ctx.firm.id }, {
            status: "POTWIERDZONE",
            zastepcaId: ctx.firm.id,
            wybranoAt: now,
            potwierdzonoAt: now,
            stawkaUzgodniona: order.stawka,
            zapytanieOdpowiedz: "PRZYJETE",
          })
          const offerData = { stawka: order.stawka ?? 0, fakturaVat: order.fakturaVat, status: "WYBRANA" as const }
          await tx.substitutionOffer.upsert({
            where: { substitutionId_lawFirmId: { substitutionId: id, lawFirmId: ctx.firm.id } },
            create: { substitutionId: id, lawFirmId: ctx.firm.id, ...offerData },
            update: offerData,
          })
        })
        return {
          message: `Potwierdzone. Zastępstwo dla: ${nameOf(owner)}, ${termText(order)}.`,
          tasks: [
            () =>
              notifyFirmUser({
                userId: owner.userId,
                tytul: `${actorName(ctx)} potwierdza zastępstwo ${label(order)}`,
                tresc: `${order.tytul} · ${termText(order)}. Dane sprawy i pliki są już odsłonięte.`,
                link: ownerLink(order),
                email: {
                  heading: "Zapytanie przyjęte",
                  paragraphs: [
                    `${actorName(ctx)} przyjmuje zastępstwo „${order.tytul}”.`,
                    "Pełnomocnictwo substytucyjne (dla aplikanta: upoważnienie) wystawiasz sam — wzór pobierzesz w szczegółach zlecenia.",
                  ],
                  rows: [["Termin", termText(order)], ["Stawka", `${order.stawka} zł netto`]],
                  cta: "Zobacz zlecenie",
                },
              }),
          ],
        }
      }

      await prisma.substitution.updateMany({
        where: { id, status: "ZAPYTANIE", zapytanieDoId: ctx.firm.id },
        data: {
          status: "OPUBLIKOWANE",
          opublikowanoAt: now,
          ofertyDo: computeOffersDeadline(order, now),
          zapytanieOdpowiedz: "ODRZUCONE",
        },
      })
      const fresh = await loadOrder(id)
      return {
        message: "Odmówiłeś. Zlecający dostał informację, a zlecenie trafiło na giełdę.",
        tasks: [
          () =>
            notifyFirmUser({
              userId: owner.userId,
              tytul: `${actorName(ctx)} nie może Cię zastąpić`,
              tresc: `${order.tytul} · zlecenie ${label(order)} trafiło na giełdę dla innych.`,
              link: ownerLink(order),
              email: {
                heading: "Zapytanie odrzucone — zlecenie na giełdzie",
                paragraphs: [
                  `${actorName(ctx)} odmówił(a). Zlecenie „${order.tytul}” trafiło na giełdę i powiadomiliśmy pasujących prawników.`,
                ],
                cta: "Zobacz zlecenie",
              },
            }),
          () => broadcastNewOrder(toBroadcast(fresh), [ctx.firm.id]),
        ],
      }
    }

    case "confirm": {
      assertSubstitute(ctx, order)
      assertStatus(order, ["PRZYDZIELONE"], "To zastępstwo jest już potwierdzone")
      await prisma.$transaction((tx) =>
        transition(tx, id, { status: "PRZYDZIELONE", zastepcaId: ctx.firm.id }, { status: "POTWIERDZONE", potwierdzonoAt: now })
      )
      const owner = order.zlecajacy
      return {
        message: "Przyjęcie potwierdzone. Zlecający dostał maila.",
        tasks: [
          () =>
            notifyFirmUser({
              userId: owner.userId,
              tytul: `${actorName(ctx)} potwierdza przyjęcie ${label(order)}`,
              tresc: `${order.tytul} · ${termText(order)}.`,
              link: ownerLink(order),
              email: {
                heading: "Zastępca potwierdził przyjęcie",
                paragraphs: [`${actorName(ctx)} potwierdza przyjęcie zastępstwa „${order.tytul}”.`],
                rows: [["Termin", termText(order)], ["Miejsce", order.miejsce ?? ""]],
                cta: "Zobacz zlecenie",
              },
            }),
        ],
      }
    }

    case "resign": {
      assertSubstitute(ctx, order)
      assertStatus(order, ["PRZYDZIELONE", "POTWIERDZONE"], "Na tym etapie nie można już zrezygnować")
      const start = termStart(order)
      if (start && start <= now) {
        throw new SubstitutionError(409, "Termin już minął — skontaktuj się bezpośrednio ze zlecającym")
      }
      const late = !!start && hoursUntil(start, now) < LATE_RESIGNATION_HOURS
      await prisma.$transaction(async (tx) => {
        await transition(tx, id, { status: { in: ["PRZYDZIELONE", "POTWIERDZONE"] }, zastepcaId: ctx.firm.id }, {
          status: "OPUBLIKOWANE",
          zastepcaId: null,
          wybranoAt: null,
          potwierdzenieDo: null,
          potwierdzonoAt: null,
          naMiejscuAt: null,
          stawkaUzgodniona: null,
          ...(order.opublikowanoAt ? {} : { opublikowanoAt: now, ofertyDo: computeOffersDeadline(order, now) }),
        })
        await reopenOffers(tx, order, ctx.firm.id)
        await tx.substitutionOffer.updateMany({
          where: { substitutionId: id, lawFirmId: ctx.firm.id },
          data: { status: "REZYGNACJA", rezygnacjaAt: now, rezygnacjaPozno: late },
        })
      })
      const owner = order.zlecajacy
      const reason = action.powod ? ` Powód: ${action.powod}` : ""
      return {
        message: late
          ? "Zrezygnowałeś. Rezygnacja na mniej niż 24 h przed terminem zostaje w Twojej statystyce."
          : "Zrezygnowałeś. Zlecający dostał informację.",
        tasks: [
          () =>
            notifyFirmUser({
              userId: owner.userId,
              tytul: `${actorName(ctx)} rezygnuje z ${label(order)}`,
              tresc: `${order.tytul} · ${termText(order)}. Wybierz innego zastępcę.${reason}`,
              link: ownerLink(order),
              force: true,
              email: {
                heading: "Zastępca zrezygnował",
                paragraphs: [
                  `${actorName(ctx)} zrezygnował(a) z zastępstwa „${order.tytul}”.${reason}`,
                  "Zlecenie wróciło na giełdę — możesz wybrać kogoś z pozostałych ofert.",
                ],
                rows: [["Termin", termText(order)]],
                cta: "Wybierz innego zastępcę",
              },
              sms: late
                ? {
                    phone: owner.user.numerTelefonu,
                    text: `Prosta Sprawa: ${actorName(ctx)} rezygnuje z zastepstwa ${label(order)} (${termText(order)}). Wybierz innego zastepce w panelu.`,
                  }
                : undefined,
            }),
          ...notifyReopened(order, ctx.firm.id),
        ],
      }
    }

    case "on-site": {
      assertSubstitute(ctx, order)
      assertStatus(order, ["POTWIERDZONE"], "Najpierw potwierdź przyjęcie zastępstwa")
      if (order.naMiejscuAt) return { message: "Zlecający już wie, że jesteś na miejscu.", tasks: [] }
      await prisma.substitution.update({ where: { id }, data: { naMiejscuAt: now } })
      const owner = order.zlecajacy
      return {
        message: "Zlecający wie, że jesteś na miejscu.",
        tasks: [
          () =>
            notifyFirmUser({
              userId: owner.userId,
              tytul: `${actorName(ctx)} jest na miejscu`,
              tresc: `${order.tytul} · ${order.miejsce ?? ""}`,
              link: ownerLink(order),
              email: false,
            }),
        ],
      }
    }

    case "report": {
      assertSubstitute(ctx, order)
      assertStatus(order, ["PRZYDZIELONE", "POTWIERDZONE"], "Raport do tego zlecenia jest już wysłany")
      const [day, time] = action.kolejnyTermin ? action.kolejnyTermin.split("T") : [null, null]
      await prisma.$transaction((tx) =>
        transition(tx, id, { status: { in: ["PRZYDZIELONE", "POTWIERDZONE"] }, zastepcaId: ctx.firm.id }, {
          status: "WYKONANE",
          wykonanoAt: now,
          potwierdzonoAt: order.potwierdzonoAt ?? now,
          raportPrzebieg: action.przebieg,
          raportKolejnyTermin: day ? warsawToUtc(day, time) : null,
          raportNotatka: action.notatka,
        })
      )
      const owner = order.zlecajacy
      return {
        message: "Raport wysłany do zlecającego.",
        tasks: [
          () =>
            notifyFirmUser({
              userId: owner.userId,
              tytul: `Raport z zastępstwa ${label(order)}`,
              tresc: `${actorName(ctx)}: ${przebiegLabel(action.przebieg)}. Potwierdź wykonanie w ciągu 48 h.`,
              link: ownerLink(order),
              email: {
                heading: "Zastępca wysłał raport",
                paragraphs: [
                  `${actorName(ctx)} oznaczył(a) zastępstwo „${order.tytul}” jako wykonane.`,
                  action.notatka,
                  "Masz 48 godzin na potwierdzenie — potem zamkniemy zlecenie automatycznie.",
                ],
                rows: [
                  ["Przebieg", przebiegLabel(action.przebieg)],
                  ["Kolejny termin", day ? formatTermin(warsawToUtc(day, time), !!time, false) : ""],
                ],
                cta: "Potwierdź wykonanie",
              },
            }),
        ],
      }
    }

    case "complete": {
      assertOwner(ctx, order)
      if (order.status === "ZAMKNIETE") {
        if (order.ocena != null || !action.ocena) throw new SubstitutionError(409, "Zlecenie jest już zamknięte")
        await prisma.substitution.update({
          where: { id },
          data: { ocena: action.ocena, ocenaKomentarz: action.komentarz || null },
        })
        return { message: "Dziękujemy za ocenę.", tasks: [] }
      }
      assertStatus(order, ["WYKONANE"], "Potwierdzić można zlecenie z raportem zastępcy")
      await prisma.$transaction((tx) =>
        transition(tx, id, { status: "WYKONANE" }, {
          status: "ZAMKNIETE",
          zamknietoAt: now,
          ocena: action.ocena ?? null,
          ocenaKomentarz: action.komentarz || null,
        })
      )
      const substitute = order.zastepca
      return {
        message: "Zlecenie zamknięte. Trafiło do rozliczeń.",
        tasks: substitute
          ? [
              () =>
                notifyFirmUser({
                  userId: substitute.userId,
                  tytul: `Zlecający potwierdził wykonanie ${label(order)}`,
                  tresc: `${order.tytul} · zlecenie trafiło do Twoich rozliczeń (${order.stawkaUzgodniona ?? order.stawka ?? 0} zł netto).`,
                  link: `${PANEL}/rozliczenia`,
                  email: {
                    heading: "Wykonanie potwierdzone",
                    paragraphs: [
                      `${actorName(ctx)} potwierdził(a) wykonanie zastępstwa „${order.tytul}”. Zlecenie jest w Twoich rozliczeniach — rozliczacie się bezpośrednio między sobą.`,
                    ],
                    rows: [["Stawka", `${order.stawkaUzgodniona ?? order.stawka ?? 0} zł netto`]],
                    cta: "Przejdź do rozliczeń",
                  },
                }),
            ]
          : [],
      }
    }

    case "problem": {
      assertOwner(ctx, order)
      assertStatus(order, ["WYKONANE"], "Problem zgłosisz po raporcie zastępcy, przed zamknięciem zlecenia")
      if (order.problemZgloszonoAt) throw new SubstitutionError(409, "Problem jest już zgłoszony")
      await prisma.substitution.update({ where: { id }, data: { problemZgloszonoAt: now, problemOpis: action.opis } })
      const admins = await prisma.user.findMany({ where: { role: "ADMIN", status: "ACTIVE", deletedAt: null }, select: { id: true } })
      const substitute = order.zastepca
      return {
        message: "Zgłoszenie trafiło do opiekuna. Zlecenie nie zamknie się automatycznie.",
        tasks: [
          ...admins.map((admin) => () =>
            sendSystemNotification({
              userId: admin.id,
              typ: "SYSTEM",
              tytul: `Problem z zastępstwem ${label(order)}`,
              tresc: `${actorName(ctx)} zgłasza problem z zastępstwem „${order.tytul}”${substitute ? ` (zastępca: ${nameOf(substitute)})` : ""}: ${action.opis}`,
              linkUrl: substitute ? `/admin/law-firms/${substitute.id}/edit` : undefined,
              force: true,
            })
          ),
          ...(substitute
            ? [
                () =>
                  notifyFirmUser({
                    userId: substitute.userId,
                    tytul: `Zlecający zgłosił problem w ${label(order)}`,
                    tresc: `${order.tytul} · opiekun skontaktuje się z Wami. Zlecenie nie zamknie się automatycznie.`,
                    link: acceptedLink(order),
                    email: false,
                  }),
              ]
            : []),
        ],
      }
    }

    case "invoice": {
      assertSubstitute(ctx, order)
      assertStatus(order, ["ZAMKNIETE"], "Status faktury ustawisz po zamknięciu zlecenia")
      await prisma.substitution.update({ where: { id }, data: { fakturaStatus: action.status } })
      return { message: "Status faktury zapisany.", tasks: [] }
    }
  }
}
