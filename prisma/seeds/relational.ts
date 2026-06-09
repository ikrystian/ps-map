import { faker } from '@faker-js/faker/locale/pl'
import crypto from 'crypto'
import {
  CaseStatus,
  CaseType,
  ClientType,
  ConsultationStatus,
  InvoiceStatus,
  JobRunStatus,
  LawFirmType,
  NotificationType,
  OfferStatus,
  OfferType,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  PaymentTerms,
  PointTransactionType,
  PreferredContact,
  PrismaClient,
  ServiceUnit,
  SubscriptionPackage,
  UserRole,
  UserStatus,
} from '@prisma/client'
import bcrypt from 'bcryptjs'
import { encryptMessage } from '../../lib/encryption'
import { generateSlug } from '../../lib/utils'
import { REALISTIC_CASES } from './data/realistic-cases'
import { REALISTIC_LAW_FIRMS } from './data/realistic-law-firms'
import { REALISTIC_REVIEWS } from './data/realistic-reviews'

// ============================================================================
// KONFIGURACJA WOLUMENU
// ============================================================================
const NUM_LAW_FIRMS = 2000     // eksperci
const NUM_CLIENTS = 5000       // klienci  => 7000 użytkowników
const NUM_CASES = 6000
const TARGET_OFFERS = 10000
const TARGET_ORDERS = 10000
const TARGET_INVOICES = 8000   // = liczba opłaconych zamówień (każde opłacone => faktura)
const TARGET_POINT_TX = 30000
const TARGET_REVIEWS = 30000
const TARGET_CONSULTATIONS = 40000
const TARGET_CONVERSATIONS = 8000
const TARGET_JOB_RUNS = 20000
const TARGET_NEWSLETTER = 5000
const MAX_OFFERS_PER_CASE = 8

// Powtarzalność danych pomiędzy uruchomieniami
faker.seed(20260609)

const uuid = () => crypto.randomUUID()
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]
const chance = (p: number) => Math.random() < p
const randInt = (min: number, max: number) => faker.number.int({ min, max })
const round2 = (n: number) => Math.round(n * 100) / 100
// Bezpieczny zakres dat — nie rzuca gdy from ~= to
const dateBetween = (from: Date, to: Date) =>
  from.getTime() >= to.getTime() ? new Date(to.getTime()) : faker.date.between({ from, to })

const EMAIL_DOMAINS = ['gmail.com', 'wp.pl', 'onet.pl', 'interia.pl', 'o2.pl', 'poczta.fm']

const OFFER_INTROS = [
  'Szanowni Państwo, po zapoznaniu się z opisem sprawy chętnie podejmiemy się jej prowadzenia. Posiadamy wieloletnie doświadczenie w analogicznych postępowaniach.',
  'Dzień dobry, analizując przedstawione zagadnienie jesteśmy w stanie zaproponować korzystne i transparentne warunki współpracy oraz pełne zaangażowanie zespołu.',
  'W odpowiedzi na zgłoszenie przedstawiamy ofertę kompleksowego prowadzenia sprawy, obejmującą analizę dokumentacji, przygotowanie pism procesowych oraz reprezentację.',
  'Zapraszamy do współpracy. Gwarantujemy profesjonalizm, terminowość oraz indywidualne podejście do zgłoszonego problemu prawnego.',
  'Po wstępnej ocenie szans procesowych proponujemy podjęcie się sprawy. Na każdym etapie zapewniamy bieżący kontakt i pełną informację o postępach.',
]
const OFFER_SCOPES = [
  'Analiza dokumentacji, doradztwo prawne, sporządzenie pism procesowych oraz reprezentacja przed sądem I instancji.',
  'Pełna obsługa prawna sprawy, w tym przygotowanie strategii procesowej, negocjacje oraz reprezentacja w postępowaniu.',
  'Kompleksowe doradztwo, przygotowanie niezbędnej dokumentacji oraz udział w rozprawach i mediacjach.',
  'Konsultacja prawna, opracowanie stanowiska procesowego, redakcja pism oraz monitorowanie terminów sądowych.',
]
const NEGOTIATION_REASONS = [
  'Dziękuję za ofertę. Czy istnieje możliwość obniżenia ceny? Dysponuję ograniczonym budżetem na ten moment.',
  'Oferta wygląda interesująco, jednak proponowana kwota nieco przekracza moje możliwości. Proszę o rozważenie rabatu.',
  'Czy cena podlega negocjacji? Otrzymałem korzystniejsze propozycje od innych ekspertów.',
  'Zależy mi na współpracy z Państwem, ale prosiłbym o rozłożenie płatności na raty lub niższą stawkę.',
  'Proszę o weryfikację wyceny — zakres prac w mojej ocenie jest nieco mniejszy niż opisany.',
]
const SERVICE_NAMES = [
  'Porada prawna', 'Sporządzenie pisma procesowego', 'Reprezentacja przed sądem', 'Analiza umowy',
  'Sporządzenie umowy', 'Windykacja należności', 'Obsługa prawna firm', 'Pomoc w sprawie rozwodowej',
  'Doradztwo spadkowe', 'Rejestracja spółki', 'Sprawy odszkodowawcze', 'Negocjacje z kontrahentem',
]
const CERT_NAMES = [
  'Certyfikat ukończenia aplikacji adwokackiej', 'Mediator sądowy', 'Doradca podatkowy',
  'Specjalista prawa pracy', 'Certyfikat ODO / RODO', 'Kurs prawa zamówień publicznych',
]
const CONSULT_TOPICS = [
  'Pytanie o postęp sprawy', 'Uzupełnienie dokumentów', 'Ustalenie terminu spotkania', 'Prośba o wycenę',
  'Potwierdzenie współpracy', 'Konsultacja w sprawie rozwodowej', 'Analiza umowy najmu', 'Sprawa spadkowa',
  'Porada w sprawie odszkodowania', 'Założenie działalności gospodarczej',
]
const CHAT_LINES = [
  'Dzień dobry, dziękuję za ofertę. Chciałbym dopytać o kilka szczegółów.',
  'Oczywiście, służę pomocą. Proszę śmiało pytać.',
  'Jaki jest przewidywany czas trwania całego postępowania?',
  'W typowych sprawach tego rodzaju to około 3-6 miesięcy, zależnie od obciążenia sądu.',
  'Czy w cenę wliczona jest reprezentacja na rozprawie?',
  'Tak, oferta obejmuje udział w jednej rozprawie. Kolejne rozliczamy osobno.',
  'Rozumiem. Czy możemy umówić się na spotkanie w przyszłym tygodniu?',
  'Jak najbardziej. Proponuję wtorek o 12:00, pasuje Państwu?',
  'Świetnie, potwierdzam termin. Dziękuję za sprawną komunikację.',
  'Dziękuję, do zobaczenia. W razie pytań pozostaję do dyspozycji.',
]
const JOB_NAMES = [
  'verify-partner-banners', 'send-scheduled-emails', 'expire-promotions', 'subscription-reminders',
  'recalc-rankings', 'cleanup-sessions', 'award-partner-points', 'send-review-requests',
  'consultation-reminders', 'low-points-alerts', 'archive-old-cases', 'refresh-statistics',
]

type FirmAgg = {
  zlozone: number
  wygrane: number
  monthly: Map<string, { submitted: number; accepted: number }>
  byCategory: Map<string, { submitted: number; accepted: number }>
}
type Tx = { amount: number; type: PointTransactionType; description: string; createdAt: Date }

function jsonGodziny() {
  return JSON.stringify({
    pon: '09:00-17:00', wt: '09:00-17:00', sr: '09:00-17:00',
    czw: '09:00-17:00', pt: '09:00-16:00', sob: 'Zamknięte', nd: 'Zamknięte',
  })
}

/** Wstawia rekordy partiami (limit parametrów SQLite) z odpornością na sporadyczne błędy adaptera. */
async function insertMany(
  label: string,
  model: { createMany: (args: { data: any[] }) => Promise<unknown> },
  rows: any[],
  approxCols: number,
) {
  if (rows.length === 0) {
    console.log(`  • ${label}: 0`)
    return
  }
  const chunkSize = Math.max(1, Math.min(1000, Math.floor(900 / Math.max(1, approxCols))))
  for (let i = 0; i < rows.length; i += chunkSize) {
    await createChunkResilient(model, rows.slice(i, i + chunkSize))
  }
  console.log(`  ✓ ${label}: ${rows.length}`)
}

/**
 * Adapter @prisma/adapter-libsql potrafi sporadycznie zgłosić P2028 ("Transaction already closed")
 * przy createMany. Ponawiamy z backoffem. Każdy wiersz ma unikalne `id`, więc jeśli poprzednia próba
 * jednak się zacommitowała, ponowienie zwróci P2002 — traktujemy to jako "już zapisane" i pomijamy.
 */
async function createChunkResilient(
  model: { createMany: (args: { data: any[] }) => Promise<unknown> },
  chunk: any[],
) {
  const maxAttempts = 6
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await model.createMany({ data: chunk })
      return
    } catch (e: any) {
      const code = e?.code
      const msg = String(e?.message ?? '')
      if (code === 'P2002') return
      const transient = code === 'P2028' || /Transaction (already closed|not found)|rollback|timeout|database is locked/i.test(msg)
      if (transient && attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 150 * attempt))
        continue
      }
      throw e
    }
  }
}

export async function seedRelationalData(prisma: PrismaClient) {
  console.log('🌱 Seedowanie spójnych, powiązanych danych (duży wolumen)...')

  // --------------------------------------------------------------------------
  // 0. DANE SŁOWNIKOWE
  // --------------------------------------------------------------------------
  const voivodeships = await prisma.voivodeship.findMany({ select: { id: true, nazwa: true } })
  const categories = await prisma.category.findMany({ select: { id: true, nazwa: true, typ: true, parentId: true } })
  const cities = await prisma.city.findMany({ select: { id: true, nazwa: true, voivodeshipId: true } })
  const accountManagers = await prisma.accountManager.findMany({ select: { id: true } })
  const subscriptionPlans = await prisma.subscriptionPlan.findMany()

  if (voivodeships.length === 0 || categories.length === 0) {
    console.error('❌ Brak województw lub kategorii. Najpierw uruchom seedery słownikowe.')
    return
  }

  const citiesByVoiv = new Map<string, { id: string; nazwa: string }[]>()
  for (const c of cities) {
    if (!citiesByVoiv.has(c.voivodeshipId)) citiesByVoiv.set(c.voivodeshipId, [])
    citiesByVoiv.get(c.voivodeshipId)!.push({ id: c.id, nazwa: c.nazwa })
  }
  const cityInVoiv = (voivId: string) => {
    const arr = citiesByVoiv.get(voivId)
    return arr && arr.length ? pick(arr) : null
  }
  const leafCats = categories.filter((c) => c.parentId)
  const catsPrivate = (leafCats.length ? leafCats : categories).filter((c) => c.typ === 'SPRAWY_PRYWATNE')
  const catsBusiness = (leafCats.length ? leafCats : categories).filter((c) => c.typ === 'SPRAWY_FIRMOWE')
  const catByName = new Map(categories.map((c) => [c.nazwa, c]))
  const planByType = new Map(subscriptionPlans.map((p: any) => [p.typ, p]))

  const sharedPassword = await bcrypt.hash('Password123', 10)
  const now = new Date()
  const earliest = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 540) // ~18 miesięcy
  const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}`

  // ==========================================================================
  // 1. UŻYTKOWNICY + ustawienia powiadomień + status online
  // ==========================================================================
  type UserRow = { id: string; email: string; name: string; createdAt: Date }
  let users: any[] = []
  let notifSettings: any[] = []
  let onlineStatuses: any[] = []
  const firmUsers: UserRow[] = []
  const clientUsers: UserRow[] = []

  const makeUser = (role: UserRole, idx: number, bucket: UserRow[]) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const local = generateSlug(`${firstName} ${lastName}`).replace(/-/g, '.')
    const email = `${local}.${idx}@${pick(EMAIL_DOMAINS)}`
    const createdAt = dateBetween(earliest, now)
    const id = uuid()
    users.push({
      id, email, name: `${firstName} ${lastName}`, image: faker.image.avatar(),
      password: sharedPassword, role, status: UserStatus.ACTIVE, emailVerified: createdAt,
      lastLogin: chance(0.8) ? dateBetween(createdAt, now) : null, createdAt, updatedAt: createdAt,
    })
    notifSettings.push({
      id: uuid(), userId: id, isConfigured: true,
      emailNoweOferty: true, emailWiadomosci: true, emailStatusy: true, smsPilne: chance(0.3),
      kontaktKlienci: true, kluczowe: true, wskazowkiPorady: chance(0.7), ofertPromocje: chance(0.6),
      przypomnienieWiadomosci: true, noweFunkcje: chance(0.7), zmianyCenniki: true, zmianyRegulamin: true,
      kontaktDoradca: chance(0.3), wyswietlanieAwatara: true, autoProsbOpinie: chance(0.4),
      powiadomienieDzwiekowe: chance(0.5), ustawieniaOgloszenia: true, powiadomieniaSmNowa: chance(0.2),
      wiadomosciZbiorcze: true, urlop: chance(0.05), welcomePackageSeen: true, updatedAt: createdAt,
    })
    const isOnline = chance(0.12)
    onlineStatuses.push({ id: uuid(), userId: id, isOnline, lastSeen: isOnline ? now : dateBetween(createdAt, now), updatedAt: now })
    bucket.push({ id, email, name: `${firstName} ${lastName}`, createdAt })
  }

  let idxCounter = 0
  for (let i = 0; i < NUM_LAW_FIRMS; i++) makeUser(UserRole.LAW_FIRM, idxCounter++, firmUsers)
  for (let i = 0; i < NUM_CLIENTS; i++) makeUser(UserRole.CLIENT, idxCounter++, clientUsers)

  await insertMany('Użytkownicy', prisma.user, users, 11)
  await insertMany('Ustawienia powiadomień', prisma.notificationSettings, notifSettings, 26)
  await insertMany('Status online', prisma.userOnlineStatus, onlineStatuses, 5)
  users = []; notifSettings = []; onlineStatuses = []

  // ==========================================================================
  // 2. KLIENCI
  // ==========================================================================
  type ClientRow = { id: string; userId: string; email: string; imie: string; nazwisko: string; telefon: string; clientType: ClientType; createdAt: Date }
  let clients: any[] = []
  const clientRows: ClientRow[] = []
  for (const u of clientUsers) {
    const [imie, ...rest] = u.name.split(' ')
    const nazwisko = rest.join(' ')
    const isB2B = chance(0.4)
    const voiv = pick(voivodeships)
    const city = cityInVoiv(voiv.id)
    const telefon = faker.phone.number()
    const id = uuid()
    clients.push({
      id, userId: u.id, clientType: isB2B ? ClientType.BUSINESS : ClientType.INDIVIDUAL, imie, nazwisko, telefon,
      nazwaFirmy: isB2B ? `${faker.company.name()} ${pick(['Sp. z o.o.', 'S.A.', 'Sp. k.', 'Sp. j.'])}` : null,
      nip: isB2B ? faker.string.numeric(10) : null, regon: isB2B ? faker.string.numeric(9) : null,
      krs: isB2B && chance(0.5) ? faker.string.numeric(10) : null,
      adres: faker.location.streetAddress(), kodPocztowy: faker.location.zipCode('##-###'),
      miasto: city?.nazwa ?? faker.location.city(), voivodeshipId: voiv.id,
      zgodaRegulamin: true, zgodaNewsletter: chance(0.6), zgodaMarketing: chance(0.5), punktySaldo: 0,
      createdAt: u.createdAt, updatedAt: u.createdAt,
    })
    clientRows.push({ id, userId: u.id, email: u.email, imie, nazwisko, telefon, clientType: isB2B ? ClientType.BUSINESS : ClientType.INDIVIDUAL, createdAt: u.createdAt })
  }
  await insertMany('Klienci', prisma.client, clients, 20)
  clients = []

  // ==========================================================================
  // 3. KANCELARIE (obiekty trzymamy do uzupełnienia statystyk i salda)
  // ==========================================================================
  type FirmRow = { id: string; userId: string; nazwa: string; nazwaFirmy: string; nip: string; adres: string; kodPocztowy: string; miasto: string; createdAt: Date; pakiet: SubscriptionPackage }
  const lawFirms: any[] = []
  const firmRows: FirmRow[] = []
  let lawFirmVoiv: any[] = []
  let lawFirmCity: any[] = []
  let lawFirmCategory: any[] = []
  let services: any[] = []
  let certificates: any[] = []
  let consultAvail: any[] = []

  for (let i = 0; i < NUM_LAW_FIRMS; i++) {
    const u = firmUsers[i]
    const tmpl = pick(REALISTIC_LAW_FIRMS)
    const id = uuid()
    const voiv = pick(voivodeships)
    const homeCity = cityInVoiv(voiv.id)
    const nip = (1000000000 + i).toString()
    const slug = `${generateSlug(tmpl.nazwa)}-${i}`
    const displayName = `${tmpl.nazwa} (${homeCity?.nazwa ?? 'Polska'})`
    const [imieKontakt, ...restK] = u.name.split(' ')
    const nazwiskoKontakt = restK.join(' ') || faker.person.lastName()
    const hasOirp = chance(0.5)
    const hasOra = chance(0.5)
    const pakiet = pick(Object.values(SubscriptionPackage))
    const adres = faker.location.streetAddress()
    const kodPocztowy = faker.location.zipCode('##-###')
    const miasto = homeCity?.nazwa ?? faker.location.city()
    const descHtml = `<p><strong>${tmpl.tagline}</strong></p><p>${tmpl.opis}</p>` +
      faker.lorem.paragraphs(2, '\n\n').split('\n\n').map((p) => `<p>${p}</p>`).join('')

    lawFirms.push({
      id, userId: u.id, typ: pick(Object.values(LawFirmType)), nazwa: displayName, nazwaFirmy: tmpl.nazwa, slug, nip,
      regon: faker.string.numeric(9), krs: chance(0.5) ? faker.string.numeric(10) : null,
      imieKontakt, nazwiskoKontakt, stanowisko: pick(['Adwokat', 'Radca prawny', 'Partner zarządzający', 'Aplikant adwokacki', 'Doradca podatkowy']),
      numerTelefonu: faker.phone.number(), numerTelefonu2: chance(0.4) ? faker.phone.number() : null, emailKontakt: u.email,
      adres, kodPocztowy, miasto, voivodeshipId: voiv.id,
      latitude: round2(faker.number.float({ min: 49.0, max: 54.8 })), longitude: round2(faker.number.float({ min: 14.1, max: 24.1 })),
      opis: descHtml, logo: faker.image.avatar(), zdjecieGlowne: faker.image.url({ width: 1920, height: 400 }),
      galeriaZdjec: JSON.stringify(Array.from({ length: randInt(2, 6) }, () => faker.image.url())),
      filmYouTube: chance(0.3) ? 'https://www.youtube.com/watch?v=quC2GkURViU' : null,
      okladkaFilmu: chance(0.3) ? faker.image.url() : null, kolejnoscMultimedia: 'zdjecia',
      statusGodzinyOtwarcia: true, godzinyOtwarcia: jsonGodziny(),
      linkLinkedIn: `https://linkedin.com/in/${faker.internet.username()}`, linkFacebook: `https://facebook.com/${faker.internet.username()}`,
      linkInstagram: chance(0.5) ? `https://instagram.com/${faker.internet.username()}` : null, linkTwitter: null, linkTikTok: null,
      stronaWww: faker.internet.url(),
      edukacja: JSON.stringify(Array.from({ length: randInt(1, 3) }, () => ({
        uczelnia: `Uniwersytet ${faker.location.city()}`, wydzial: 'Wydział Prawa i Administracji', stopien: 'magister',
        rokOd: 2000 + randInt(0, 8), rokDo: 2009 + randInt(0, 8),
      }))),
      oirpMiasto: hasOirp ? faker.location.city() : null, oirpWpis: hasOirp ? `WR-${faker.string.numeric(4)}` : null, oirpStatus: hasOirp,
      oraMiasto: hasOra ? faker.location.city() : null, oraWpis: hasOra ? `WAW/${faker.string.numeric(5)}` : null, oraStatus: hasOra,
      unikatowyOpisUslugi: tmpl.tagline, slowaKluczowe: JSON.stringify(faker.lorem.words(4).split(' ')),
      mainCategoryId: null as string | null, callaPolska: chance(0.3), onlineOnly: chance(0.2),
      typOferty: pick(Object.values(OfferType)), punktySaldo: 0, pakietSubskrypcji: pakiet,
      dataPakietuOd: null as Date | null, dataPakietuDo: null as Date | null, autoRenewal: chance(0.4),
      wyswietleniaProfilu: randInt(40, 8000), zlozoneOferty: 0, wygraneOferty: 0, konwersja: 0, pozycjaRanking: null as number | null,
      zgodaRegulamin: true, zgodaPrzetwarzanie: true, zweryfikowana: chance(0.7), aktywna: true,
      accountManagerId: accountManagers.length ? pick(accountManagers).id : null, createdAt: u.createdAt, updatedAt: u.createdAt,
    })
    firmRows.push({ id, userId: u.id, nazwa: displayName, nazwaFirmy: tmpl.nazwa, nip, adres, kodPocztowy, miasto, createdAt: u.createdAt, pakiet })

    const voivSet = new Set<string>([voiv.id])
    for (const v of faker.helpers.arrayElements(voivodeships, randInt(1, 4))) voivSet.add(v.id)
    for (const vId of voivSet) lawFirmVoiv.push({ id: uuid(), lawFirmId: id, voivodeshipId: vId, createdAt: u.createdAt })

    const citySet = new Set<string>()
    if (homeCity) citySet.add(homeCity.id)
    for (const vId of voivSet) { const c = cityInVoiv(vId); if (c) citySet.add(c.id) }
    for (const cId of citySet) lawFirmCity.push({ id: uuid(), lawFirmId: id, cityId: cId, createdAt: u.createdAt })

    const firmCats = faker.helpers.arrayElements(categories, randInt(2, 8))
    firmCats.forEach((cat, order) => lawFirmCategory.push({ id: uuid(), lawFirmId: id, categoryId: cat.id, kolejnosc: order, createdAt: u.createdAt }))
    lawFirms[lawFirms.length - 1].mainCategoryId = firmCats[0]?.id ?? null

    for (const nazwaUslugi of faker.helpers.arrayElements(SERVICE_NAMES, randInt(2, 6))) {
      const od = randInt(100, 800)
      services.push({ id: uuid(), lawFirmId: id, nazwaUslugi, opisUslugi: faker.lorem.sentence(), cenaOd: od, cenaDo: od + randInt(200, 2000), jednostka: pick(Object.values(ServiceUnit)), aktywna: true, createdAt: u.createdAt, updatedAt: u.createdAt })
    }
    for (const nazwaCert of faker.helpers.arrayElements(CERT_NAMES, randInt(0, 3))) {
      certificates.push({ id: uuid(), lawFirmId: id, nazwaCertyfikatu: nazwaCert, wydawca: pick(['Okręgowa Rada Adwokacka', 'Krajowa Izba Radców Prawnych', 'Ministerstwo Sprawiedliwości', 'Krajowa Izba Doradców Podatkowych']), dataUzyskania: dateBetween(new Date('2012-01-01'), u.createdAt), dataWaznosci: chance(0.5) ? faker.date.future({ years: 3, refDate: now }) : null, numerCertyfikatu: faker.string.alphanumeric(8).toUpperCase(), skanCertyfikatu: faker.image.url(), aktywny: true, createdAt: u.createdAt, updatedAt: u.createdAt })
    }
    if (chance(0.5)) {
      for (const day of faker.helpers.arrayElements([1, 2, 3, 4, 5], randInt(2, 5))) {
        consultAvail.push({ id: uuid(), lawFirmId: id, dayOfWeek: day, startTime: '09:00', endTime: '17:00', price15min: pick([50, 80, 100, 120]), price30min: pick([90, 150, 180, 220]), createdAt: u.createdAt, updatedAt: u.createdAt })
      }
    }
  }
  const firmById = new Map(firmRows.map((f) => [f.id, f]))

  // ==========================================================================
  // 4. SPRAWY (status zależny od ofert)
  // ==========================================================================
  type Lifecycle = 'NOWA' | 'OFERTY' | 'W_TRAKCIE' | 'ZAKONCZONA' | 'ANULOWANA'
  const lifecycleOf = (): Lifecycle => {
    const r = Math.random()
    if (r < 0.12) return 'NOWA'
    if (r < 0.57) return 'OFERTY'
    if (r < 0.77) return 'W_TRAKCIE'
    if (r < 0.95) return 'ZAKONCZONA'
    return 'ANULOWANA'
  }
  type CaseRow = { id: string; clientId: string; clientUserId: string; categoryId: string; nazwaSprawy: string; createdAt: Date; lifecycle: Lifecycle; offerCount: number }
  const cases: any[] = []
  const caseRows: CaseRow[] = []
  const caseById = new Map<string, any>()

  for (let i = 0; i < NUM_CASES; i++) {
    const client = pick(clientRows)
    const isBusiness = client.clientType === ClientType.BUSINESS
    const possible = REALISTIC_CASES.filter((c) => {
      const cat = catByName.get(c.category)
      return cat && (isBusiness ? cat.typ === 'SPRAWY_FIRMOWE' : cat.typ === 'SPRAWY_PRYWATNE')
    })
    const tmpl = possible.length ? pick(possible) : pick(REALISTIC_CASES)
    let category = catByName.get(tmpl.category)
    if (!category || (isBusiness ? category.typ !== 'SPRAWY_FIRMOWE' : category.typ !== 'SPRAWY_PRYWATNE')) {
      category = pick(isBusiness ? (catsBusiness.length ? catsBusiness : categories) : (catsPrivate.length ? catsPrivate : categories))
    }
    const voiv = pick(voivodeships)
    const city = cityInVoiv(voiv.id)
    const createdAt = dateBetween(client.createdAt, now)
    const lifecycle = lifecycleOf()
    const budzetOd = chance(0.7) ? randInt(500, 3000) : null
    const budzetDo = budzetOd ? budzetOd + randInt(1000, 12000) : (chance(0.5) ? randInt(2000, 15000) : null)
    const caseType = isBusiness ? pick([CaseType.FIRMA, CaseType.ORGANIZACJA]) : CaseType.OSOBA_PRYWATNA
    const id = uuid()
    const row = {
      id, clientId: client.id, typSprawy: caseType, categoryId: category.id, wybranadziedzinaPrawa: category.nazwa,
      wybranaSpecyfikacja: chance(0.5) ? faker.lorem.words(3) : null, specjalizacja: chance(0.4) ? faker.lorem.sentence() : null,
      nazwaSprawy: tmpl.nazwa, opisSprawy: `${tmpl.opis} ${faker.lorem.sentence()}`,
      zalaczniki: chance(0.3) ? JSON.stringify(Array.from({ length: randInt(1, 3) }, () => faker.system.commonFileName('pdf'))) : null,
      oczekiwanyTerminRealizacji: chance(0.6) ? faker.date.soon({ days: 90, refDate: createdAt }) : null,
      trybPilny: chance(0.25), budzetOd, budzetDo, doNegocjacji: chance(0.6),
      imieNazwisko: `${client.imie} ${client.nazwisko}`, emailKontakt: client.email, telefonKontakt: client.telefon,
      preferowanyKontakt: pick(Object.values(PreferredContact)), voivodeshipId: voiv.id, cityId: city?.id ?? null,
      status: CaseStatus.NOWA, isArchived: false, archivedAt: null, akceptujeKlauzule: true, createdAt, updatedAt: createdAt, zamknieto: null as Date | null,
    }
    cases.push(row)
    caseById.set(id, row)
    caseRows.push({ id, clientId: client.id, clientUserId: client.userId, categoryId: category.id, nazwaSprawy: tmpl.nazwa, createdAt, lifecycle, offerCount: 0 })
  }

  // Rozkład liczby ofert => dokładnie TARGET_OFFERS
  const offerEligible = caseRows.filter((c) => c.lifecycle !== 'NOWA')
  for (const c of offerEligible) c.offerCount = c.lifecycle === 'ANULOWANA' ? (chance(0.5) ? 0 : 1) : 1
  let totalOffers = offerEligible.reduce((s, c) => s + c.offerCount, 0)
  const expandable = offerEligible.filter((c) => c.offerCount > 0)
  let guard = 0
  while (totalOffers < TARGET_OFFERS && expandable.length && guard < TARGET_OFFERS * 50) {
    const c = pick(expandable)
    if (c.offerCount < MAX_OFFERS_PER_CASE) { c.offerCount++; totalOffers++ }
    guard++
  }

  // ==========================================================================
  // 5. OFERTY + NEGOCJACJE + agregaty + powiadomienia o ofertach
  // ==========================================================================
  const offers: any[] = []
  let negotiations: any[] = []
  let offerNotifications: any[] = []
  const firmAgg = new Map<string, FirmAgg>()
  for (const f of firmRows) firmAgg.set(f.id, { zlozone: 0, wygrane: 0, monthly: new Map(), byCategory: new Map() })
  const txByFirm = new Map<string, Tx[]>()
  for (const f of firmRows) txByFirm.set(f.id, [])

  type WonPair = { clientId: string; clientUserId: string; firmId: string; firmUserId: string; acceptedAt: Date; lifecycle: Lifecycle }
  const wonPairs: WonPair[] = []

  for (const c of caseRows) {
    const caseObj = caseById.get(c.id)
    if (c.offerCount === 0) {
      if (c.lifecycle === 'ANULOWANA') { caseObj.status = CaseStatus.ANULOWANA; caseObj.zamknieto = dateBetween(c.createdAt, now); caseObj.updatedAt = caseObj.zamknieto }
      else caseObj.status = CaseStatus.NOWA
      continue
    }
    const selectedFirms = faker.helpers.arrayElements(firmRows, Math.min(c.offerCount, firmRows.length))
    const winnerIndex = c.lifecycle === 'W_TRAKCIE' || c.lifecycle === 'ZAKONCZONA' ? randInt(0, selectedFirms.length - 1) : -1
    let acceptedAt: Date | null = null

    selectedFirms.forEach((firm, fi) => {
      const offerFrom = firm.createdAt > c.createdAt ? firm.createdAt : c.createdAt
      const offerCreatedAt = dateBetween(offerFrom, now)
      const netto = randInt(500, 8000)
      const brutto = round2(netto * 1.23)
      const wyroznienie = chance(0.15)
      const punktyWyroznienia = wyroznienie ? pick([20, 50]) : null
      const offerId = uuid()
      let status: OfferStatus
      let zaakceptowanaData: Date | null = null
      let odrzuconaData: Date | null = null

      if (fi === winnerIndex) { status = OfferStatus.ZAAKCEPTOWANA; zaakceptowanaData = dateBetween(offerCreatedAt, now); acceptedAt = zaakceptowanaData }
      else if (winnerIndex >= 0) { status = chance(0.8) ? OfferStatus.ODRZUCONA : OfferStatus.WYGASLA; if (status === OfferStatus.ODRZUCONA) odrzuconaData = dateBetween(offerCreatedAt, now) }
      else if (c.lifecycle === 'ANULOWANA') { status = chance(0.6) ? OfferStatus.ODRZUCONA : OfferStatus.WYGASLA; if (status === OfferStatus.ODRZUCONA) odrzuconaData = dateBetween(offerCreatedAt, now) }
      else { const r = Math.random(); status = r < 0.7 ? OfferStatus.ZLOZONA : r < 0.9 ? OfferStatus.NEGOCJACJE : OfferStatus.ODRZUCONA; if (status === OfferStatus.ODRZUCONA) odrzuconaData = dateBetween(offerCreatedAt, now) }

      offers.push({
        id: offerId, caseId: c.id, lawFirmId: firm.id, kwotaNetto: netto, vat: 23, kwotaBrutto: brutto,
        terminRealizacjiDni: randInt(3, 60), opisOferty: `${pick(OFFER_INTROS)} ${faker.lorem.paragraph()}`, zakresUslug: pick(OFFER_SCOPES),
        warunkiPlatnosci: pick(Object.values(PaymentTerms)), dodatkoweWarunki: chance(0.4) ? faker.lorem.sentence() : null,
        wyroznienie, punktyWyroznienia, status, createdAt: offerCreatedAt, updatedAt: zaakceptowanaData ?? odrzuconaData ?? offerCreatedAt, zaakceptowanaData, odrzuconaData,
      })

      const agg = firmAgg.get(firm.id)!
      agg.zlozone++
      if (wyroznienie) txByFirm.get(firm.id)!.push({ amount: -punktyWyroznienia!, type: PointTransactionType.OFFER_HIGHLIGHT, description: 'Wyróżnienie oferty', createdAt: offerCreatedAt })
      const mk = monthKey(offerCreatedAt)
      if (!agg.monthly.has(mk)) agg.monthly.set(mk, { submitted: 0, accepted: 0 })
      agg.monthly.get(mk)!.submitted++
      if (!agg.byCategory.has(c.categoryId)) agg.byCategory.set(c.categoryId, { submitted: 0, accepted: 0 })
      agg.byCategory.get(c.categoryId)!.submitted++

      if (status === OfferStatus.ZAAKCEPTOWANA) {
        agg.wygrane++
        const amk = monthKey(zaakceptowanaData!)
        if (!agg.monthly.has(amk)) agg.monthly.set(amk, { submitted: 0, accepted: 0 })
        agg.monthly.get(amk)!.accepted++
        agg.byCategory.get(c.categoryId)!.accepted++
        wonPairs.push({ clientId: c.clientId, clientUserId: c.clientUserId, firmId: firm.id, firmUserId: firm.userId, acceptedAt: zaakceptowanaData!, lifecycle: c.lifecycle })
        offerNotifications.push({ id: uuid(), userId: firm.userId, typ: NotificationType.ZMIANA_STATUSU, tytul: 'Twoja oferta została zaakceptowana', tresc: `Klient zaakceptował Twoją ofertę do sprawy "${c.nazwaSprawy}".`, linkUrl: `/panel-eksperta/sprawy/${c.id}`, przeczytane: chance(0.6), createdAt: zaakceptowanaData! })
      }
      offerNotifications.push({ id: uuid(), userId: c.clientUserId, typ: NotificationType.NOWA_OFERTA, tytul: 'Otrzymałeś nową ofertę', tresc: `Ekspert ${firm.nazwa} złożył ofertę do sprawy "${c.nazwaSprawy}".`, linkUrl: `/panel-klienta/sprawy/${c.id}`, przeczytane: chance(0.55), createdAt: offerCreatedAt })

      if (status === OfferStatus.NEGOCJACJE) {
        for (let n = 0; n < randInt(1, 3); n++) {
          negotiations.push({ id: uuid(), offerId, clientId: c.clientId, propozycjaKwoty: round2(brutto * faker.number.float({ min: 0.7, max: 0.95 })), uzasadnienie: pick(NEGOTIATION_REASONS), terminRealizacji: chance(0.5) ? faker.date.soon({ days: 60, refDate: offerCreatedAt }) : null, createdAt: dateBetween(offerCreatedAt, now) })
        }
      }
    })

    if (c.lifecycle === 'ANULOWANA') { caseObj.status = CaseStatus.ANULOWANA; caseObj.zamknieto = dateBetween(c.createdAt, now) }
    else if (c.lifecycle === 'ZAKONCZONA') { caseObj.status = CaseStatus.ZAKONCZONA; caseObj.zamknieto = acceptedAt ? dateBetween(acceptedAt, now) : dateBetween(c.createdAt, now) }
    else if (c.lifecycle === 'W_TRAKCIE') caseObj.status = CaseStatus.W_TRAKCIE
    else caseObj.status = CaseStatus.OFERTY_OTRZYMANE
    caseObj.updatedAt = caseObj.zamknieto ?? acceptedAt ?? c.createdAt
  }

  // ==========================================================================
  // 6. ZAMÓWIENIA + FAKTURY + bazowe transakcje punktowe
  // ==========================================================================
  let orders: any[] = []
  let invoices: any[] = []
  const latestSub = new Map<string, { start: Date; end: Date; pkg: SubscriptionPackage }>()
  let orderSeq = 1, invoiceSeq = 1
  for (let k = 0; k < TARGET_ORDERS; k++) {
    const f = pick(firmRows)
    const paid = k < TARGET_INVOICES // dokładnie TARGET_INVOICES opłaconych => tyle samo faktur
    const createdAt = dateBetween(f.createdAt, now)
    const status = paid ? PaymentStatus.ZAPLACONE : pick([PaymentStatus.OCZEKUJE, PaymentStatus.ANULOWANE])
    const zaplaconoData = paid ? dateBetween(createdAt, now) : null
    const metoda = pick([PaymentMethod.PAYU, PaymentMethod.PRZELEWY24, PaymentMethod.TPAY, PaymentMethod.PRZELEW])
    const orderId = uuid()
    const orderNumber = `ZAM/${createdAt.getFullYear()}/${String(orderSeq++).padStart(6, '0')}`
    const daneFaktury = JSON.stringify({ nazwa: f.nazwaFirmy, nip: f.nip, adres: `${f.adres}, ${f.kodPocztowy} ${f.miasto}` })
    const isSub = chance(0.5)

    if (isSub && subscriptionPlans.length) {
      const plan: any = planByType.get(f.pakiet) ?? pick(subscriptionPlans)
      const period = pick([1, 6, 12])
      const kwota = period === 1 ? (plan.cena1Miesiac ?? plan.cena12Miesiecy / 12) : period === 6 ? (plan.cena6Miesiecy ?? plan.cena12Miesiecy / 2) : plan.cena12Miesiecy
      const startDate = createdAt
      const endDate = new Date(startDate); endDate.setMonth(endDate.getMonth() + period)
      orders.push({ id: orderId, orderNumber, lawFirmId: f.id, orderType: OrderType.SUBSCRIPTION, pakietPunktow: null, liczbaPunktow: null, subscriptionPlanId: plan.id, subscriptionPeriod: period, packageStartDate: startDate, packageEndDate: endDate, kwota, punktyKoszt: null, metodaPlatnosci: metoda, statusPlatnosci: status, daneFaktury, externalOrderId: faker.string.alphanumeric(16), transactionId: paid ? faker.string.alphanumeric(20) : null, createdAt, updatedAt: zaplaconoData ?? createdAt, zaplaconoData })
      if (paid) {
        if (plan.punktyGratis > 0) txByFirm.get(f.id)!.push({ amount: plan.punktyGratis, type: PointTransactionType.SUBSCRIPTION_BONUS, description: `Punkty gratis za pakiet ${plan.nazwa}`, createdAt: zaplaconoData! })
        const prev = latestSub.get(f.id)
        if (!prev || startDate > prev.start) latestSub.set(f.id, { start: startDate, end: endDate, pkg: plan.typ })
        invoices.push(buildInvoice(orderId, f, kwota, createdAt, zaplaconoData!, invoiceSeq++))
      }
    } else {
      const liczbaPunktow = pick([100, 250, 500, 1000])
      const kwota = liczbaPunktow * 0.9
      orders.push({ id: orderId, orderNumber, lawFirmId: f.id, orderType: OrderType.POINTS, pakietPunktow: `${liczbaPunktow}_pkt`, liczbaPunktow, subscriptionPlanId: null, subscriptionPeriod: null, packageStartDate: null, packageEndDate: null, kwota, punktyKoszt: null, metodaPlatnosci: metoda, statusPlatnosci: status, daneFaktury, externalOrderId: faker.string.alphanumeric(16), transactionId: paid ? faker.string.alphanumeric(20) : null, createdAt, updatedAt: zaplaconoData ?? createdAt, zaplaconoData })
      if (paid) {
        txByFirm.get(f.id)!.push({ amount: liczbaPunktow, type: PointTransactionType.POINTS_PURCHASE, description: `Zakup pakietu ${liczbaPunktow} punktów`, createdAt: zaplaconoData! })
        invoices.push(buildInvoice(orderId, f, kwota, createdAt, zaplaconoData!, invoiceSeq++))
      }
    }
  }

  // Pakiet powitalny (gwarantuje pokrycie wyróżnień) + uzupełnienie transakcji do TARGET_POINT_TX
  for (const f of firmRows) {
    const list = txByFirm.get(f.id)!
    const highlightCost = list.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0)
    list.push({ amount: highlightCost + randInt(50, 400), type: PointTransactionType.SUBSCRIPTION_BONUS, description: 'Pakiet powitalny — punkty na start', createdAt: f.createdAt })
  }
  let baseCount = 0
  for (const list of txByFirm.values()) baseCount += list.length
  let extrasNeeded = Math.max(0, TARGET_POINT_TX - baseCount)
  const extraTypes = [PointTransactionType.PARTNER_BONUS, PointTransactionType.ADMIN_ADJUSTMENT, PointTransactionType.SUBSCRIPTION_BONUS, PointTransactionType.POINTS_PURCHASE]
  const extraDesc: Record<string, string> = {
    PARTNER_BONUS: 'Miesięczny bonus partnerski', ADMIN_ADJUSTMENT: 'Korekta administratora', SUBSCRIPTION_BONUS: 'Bonus za aktywność', POINTS_PURCHASE: 'Doładowanie punktów',
  }
  let fi = 0
  while (extrasNeeded > 0) {
    const f = firmRows[fi % firmRows.length]; fi++
    const type = pick(extraTypes)
    txByFirm.get(f.id)!.push({ amount: randInt(50, 300), type, description: extraDesc[type], createdAt: dateBetween(f.createdAt, now) })
    extrasNeeded--
  }

  // Policz salda chronologicznie i ustaw na kancelariach
  let pointTransactions: any[] = []
  for (const f of lawFirms) {
    const list = txByFirm.get(f.id)!
    list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    let balance = 0
    for (const t of list) { balance += t.amount; pointTransactions.push({ id: uuid(), lawFirmId: f.id, amount: t.amount, balanceAfter: balance, type: t.type, description: t.description, createdAt: t.createdAt }) }
    f.punktySaldo = balance
    const sub = latestSub.get(f.id)
    if (sub) { f.pakietSubskrypcji = sub.pkg; f.dataPakietuOd = sub.start; f.dataPakietuDo = sub.end }
  }

  // Statystyki kancelarii (denormalizacja jak w aplikacji)
  let lawFirmStats: any[] = []
  let lawFirmCategoryStats: any[] = []
  for (const f of lawFirms) {
    const agg = firmAgg.get(f.id)!
    f.zlozoneOferty = agg.zlozone
    f.wygraneOferty = agg.wygrane
    f.konwersja = agg.zlozone > 0 ? (agg.wygrane / agg.zlozone) * 100 : 0
    for (const [mk, v] of agg.monthly) {
      const [year, month] = mk.split('-').map(Number)
      lawFirmStats.push({ id: uuid(), lawFirmId: f.id, year, month, profileViews: randInt(0, 400), offersSubmitted: v.submitted, offersAccepted: v.accepted, offersRejected: Math.max(0, v.submitted - v.accepted), casesViewed: v.submitted + randInt(0, 50), createdAt: now, updatedAt: now })
    }
    for (const [catId, v] of agg.byCategory) lawFirmCategoryStats.push({ id: uuid(), lawFirmId: f.id, categoryId: catId, offersSubmitted: v.submitted, offersAccepted: v.accepted, createdAt: now, updatedAt: now })
  }
  const ranked = [...lawFirms].sort((a, b) => b.wyswietleniaProfilu - a.wyswietleniaProfilu)
  ranked.forEach((f, i) => { f.pozycjaRanking = i + 1 })

  // --- ZAPIS RDZENIA (kolejność FK) ---
  console.log('💾 Zapis rdzenia (kancelarie, sprawy, oferty, zamówienia, transakcje)...')
  await insertMany('Kancelarie/Eksperci', prisma.lawFirm, lawFirms, 60)
  await insertMany('Województwa kancelarii', prisma.lawFirmVoivodeship, lawFirmVoiv, 4); lawFirmVoiv = []
  await insertMany('Miasta kancelarii', prisma.lawFirmCity, lawFirmCity, 4); lawFirmCity = []
  await insertMany('Kategorie kancelarii', prisma.lawFirmCategory, lawFirmCategory, 5); lawFirmCategory = []
  await insertMany('Usługi', prisma.service, services, 9); services = []
  await insertMany('Certyfikaty', prisma.certificate, certificates, 10); certificates = []
  await insertMany('Dostępność konsultacji', prisma.consultationAvailability, consultAvail, 8); consultAvail = []
  await insertMany('Sprawy', prisma.case, cases, 28)
  await insertMany('Oferty', prisma.offer, offers, 18); offers.length = 0
  await insertMany('Negocjacje', prisma.negotiation, negotiations, 6); negotiations = []
  await insertMany('Zamówienia', prisma.order, orders, 20); orders = []
  await insertMany('Faktury', prisma.invoice, invoices, 22); invoices = []
  await insertMany('Transakcje punktowe', prisma.pointTransaction, pointTransactions, 7); pointTransactions = []
  await insertMany('Statystyki miesięczne', prisma.lawFirmStats, lawFirmStats, 11); lawFirmStats = []
  await insertMany('Statystyki wg kategorii', prisma.lawFirmCategoryStats, lawFirmCategoryStats, 7); lawFirmCategoryStats = []

  // ==========================================================================
  // 7. KONSULTACJE (umówienia klient–ekspert) — duży wolumen
  // ==========================================================================
  type Engagement = { clientId: string; firmId: string; firmUserId: string; clientUserId: string; when: Date }
  const engagements: Engagement[] = wonPairs.map((w) => ({ clientId: w.clientId, firmId: w.firmId, firmUserId: w.firmUserId, clientUserId: w.clientUserId, when: w.acceptedAt }))
  let bookings: any[] = []
  for (let i = 0; i < TARGET_CONSULTATIONS; i++) {
    const client = pick(clientRows)
    const firm = pick(firmRows)
    const duration = pick([15, 30])
    const status = (() => { const r = Math.random(); return r < 0.62 ? ConsultationStatus.COMPLETED : r < 0.75 ? ConsultationStatus.ACCEPTED : r < 0.85 ? ConsultationStatus.PENDING : r < 0.95 ? ConsultationStatus.CANCELLED : ConsultationStatus.REJECTED })()
    const isPast = status === ConsultationStatus.COMPLETED || status === ConsultationStatus.CANCELLED || status === ConsultationStatus.REJECTED
    const from = firm.createdAt > client.createdAt ? firm.createdAt : client.createdAt
    const consultationDate = isPast ? dateBetween(from, now) : faker.date.soon({ days: 30, refDate: now })
    const created = dateBetween(from, consultationDate < now ? consultationDate : now)
    bookings.push({ id: uuid(), lawFirmId: firm.id, clientId: client.id, consultationDate, duration, price: duration === 15 ? pick([50, 80, 100, 120]) : pick([90, 150, 180, 220]), topic: pick(CONSULT_TOPICS), clientContact: client.telefon, status, paymentStatus: status === ConsultationStatus.COMPLETED || status === ConsultationStatus.ACCEPTED ? PaymentStatus.ZAPLACONE : PaymentStatus.OCZEKUJE, googleMeetUrl: status === ConsultationStatus.ACCEPTED || status === ConsultationStatus.COMPLETED ? `https://meet.google.com/${faker.string.alphanumeric(3)}-${faker.string.alphanumeric(4)}-${faker.string.alphanumeric(3)}` : null, isArchived: status === ConsultationStatus.COMPLETED && chance(0.3), createdAt: created, updatedAt: created })
    if (status === ConsultationStatus.COMPLETED) engagements.push({ clientId: client.id, firmId: firm.id, firmUserId: firm.userId, clientUserId: client.userId, when: consultationDate })
  }
  await insertMany('Rezerwacje konsultacji', prisma.consultationBooking, bookings, 13); bookings = []

  // ==========================================================================
  // 8. OPINIE — tylko od klientów z realnym zakończonym kontaktem (sprawa wygrana lub odbyta konsultacja)
  // ==========================================================================
  // tasujemy pulę zaangażowań i bierzemy dokładnie TARGET_REVIEWS
  for (let i = engagements.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[engagements[i], engagements[j]] = [engagements[j], engagements[i]] }
  const reviewEngagements = engagements.slice(0, Math.min(TARGET_REVIEWS, engagements.length))
  let reviews: any[] = []
  let reviewNotifications: any[] = []
  for (const e of reviewEngagements) {
    const firm = firmById.get(e.firmId)!
    const tmpl = pick(REALISTIC_REVIEWS)
    const createdAt = dateBetween(e.when, now)
    const hasReply = chance(0.4)
    reviews.push({ id: uuid(), lawFirmId: e.firmId, clientId: e.clientId, ocenaOgolna: tmpl.ocena, profesjonalizm: tmpl.ocena, komunikacja: randInt(Math.max(1, tmpl.ocena - 1), 5), terminowosc: randInt(Math.max(1, tmpl.ocena - 1), 5), stosunekJakosci: randInt(Math.max(1, tmpl.ocena - 1), 5), tytulOpinii: tmpl.tytul, trescOpinii: tmpl.tresc, polecam: tmpl.ocena >= 4, anonimowa: chance(0.25), odpowiedz: hasReply ? 'Dziękujemy za opinię i zaufanie. Cieszymy się ze współpracy i pozostajemy do dyspozycji w razie kolejnych spraw.' : null, dataOdpowiedzi: hasReply ? dateBetween(createdAt, now) : null, zweryfikowana: true, aktywna: chance(0.97), createdAt, updatedAt: createdAt })
    reviewNotifications.push({ id: uuid(), userId: firm.userId, typ: NotificationType.NOWA_OPINIA, tytul: 'Nowa opinia o Twojej kancelarii', tresc: `Otrzymałeś nową opinię: "${tmpl.tytul}".`, linkUrl: `/panel-eksperta/opinie`, przeczytane: chance(0.5), createdAt })
  }
  await insertMany('Opinie', prisma.review, reviews, 18); reviews = []

  // ==========================================================================
  // 9. POWIADOMIENIA (oferty + akceptacje + opinie)
  // ==========================================================================
  await insertMany('Powiadomienia (oferty/opinie)', prisma.notification, offerNotifications.concat(reviewNotifications), 7)
  offerNotifications = []; reviewNotifications = []

  // ==========================================================================
  // 10. ULUBIONE KANCELARIE
  // ==========================================================================
  let favorites: any[] = []
  const favSet = new Set<string>()
  for (const client of clientRows) {
    for (const firm of faker.helpers.arrayElements(firmRows, randInt(0, 4))) {
      const key = `${client.id}:${firm.id}`
      if (favSet.has(key)) continue
      favSet.add(key)
      favorites.push({ id: uuid(), clientId: client.id, lawFirmId: firm.id, createdAt: dateBetween(client.createdAt, now) })
    }
  }
  await insertMany('Ulubione kancelarie', prisma.favoriteLawFirm, favorites, 4); favorites = []; favSet.clear()

  // ==========================================================================
  // 11. KONWERSACJE + WIADOMOŚCI CZATU (szyfrowane)
  // ==========================================================================
  let conversations: any[] = []
  let chatMessages: any[] = []
  const convSet = new Set<string>()
  const addConversation = (clientUserId: string, lawFirmUserId: string, startFrom: Date) => {
    const key = `${clientUserId}:${lawFirmUserId}`
    if (convSet.has(key)) return
    convSet.add(key)
    const convId = uuid()
    const startedAt = dateBetween(startFrom, now)
    const msgCount = randInt(3, 10)
    let lastAt = startedAt, lastText = '', lastSender = ''
    for (let m = 0; m < msgCount; m++) {
      const fromClient = m % 2 === 0
      const senderId = fromClient ? clientUserId : lawFirmUserId
      const plain = CHAT_LINES[m % CHAT_LINES.length]
      const { encrypted, iv } = encryptMessage(plain)
      const createdAt = m === 0 ? startedAt : dateBetween(lastAt, now)
      lastAt = createdAt; lastText = plain; lastSender = senderId
      const isLast = m === msgCount - 1
      chatMessages.push({ id: uuid(), conversationId: convId, senderId, content: encrypted, contentIv: iv, attachments: null, status: 'READ', deliveredAt: createdAt, isRead: !isLast || chance(0.5), readAt: !isLast ? dateBetween(createdAt, now) : (chance(0.5) ? dateBetween(createdAt, now) : null), createdAt, updatedAt: createdAt })
    }
    conversations.push({ id: convId, clientUserId, lawFirmUserId, lastMessageText: lastText, lastMessageAt: lastAt, lastMessageSenderId: lastSender, isArchivedByClient: false, isArchivedByLawFirm: false, isDeletedByClient: false, isDeletedByLawFirm: false, createdAt: startedAt, updatedAt: lastAt })
  }
  // najpierw pary z akceptacją (realna współpraca), potem losowe pary do TARGET_CONVERSATIONS
  for (const w of wonPairs) { if (conversations.length >= TARGET_CONVERSATIONS) break; addConversation(w.clientUserId, w.firmUserId, w.acceptedAt) }
  let cguard = 0
  while (conversations.length < TARGET_CONVERSATIONS && cguard < TARGET_CONVERSATIONS * 20) {
    const cu = pick(clientUsers); const fu = pick(firmUsers)
    addConversation(cu.id, fu.id, dateBetween(cu.createdAt > fu.createdAt ? cu.createdAt : fu.createdAt, now))
    cguard++
  }
  await insertMany('Konwersacje', prisma.conversation, conversations, 14); conversations = []; convSet.clear()
  await insertMany('Wiadomości czatu', prisma.chatMessage, chatMessages, 12); chatMessages = []

  // ==========================================================================
  // 12. WIADOMOŚCI (model Message) powiązane ze sprawami
  // ==========================================================================
  let messages: any[] = []
  for (const w of wonPairs) {
    if (!chance(0.4)) continue
    const count = randInt(1, 4)
    for (let m = 0; m < count; m++) {
      const fromClient = m % 2 === 0
      messages.push({ id: uuid(), senderId: fromClient ? w.clientUserId : w.firmUserId, receiverId: fromClient ? w.firmUserId : w.clientUserId, caseId: null, temat: pick(CONSULT_TOPICS), tresc: faker.lorem.paragraph(), zalaczniki: null, przeczytana: chance(0.6), createdAt: dateBetween(w.acceptedAt, now) })
    }
  }
  await insertMany('Wiadomości', prisma.message, messages, 8); messages = []

  // ==========================================================================
  // 13. HARMONOGRAM ZADAŃ — definicje + historia uruchomień (20000)
  // ==========================================================================
  const jobs: any[] = []
  for (const name of JOB_NAMES) {
    const lastRunAt = dateBetween(new Date(now.getTime() - 1000 * 60 * 60 * 24), now)
    jobs.push({ jobName: name, lastRunAt, lastStatus: chance(0.9) ? JobRunStatus.SUCCESS : JobRunStatus.FAILED, lockedAt: null, lockedBy: null, createdAt: earliest, updatedAt: lastRunAt })
  }
  await insertMany('Harmonogram zadań (definicje)', prisma.scheduledJob, jobs, 7)

  let jobRuns: any[] = []
  for (let i = 0; i < TARGET_JOB_RUNS; i++) {
    const jobName = pick(JOB_NAMES)
    const startedAt = dateBetween(earliest, now)
    const durationMs = randInt(20, 15000)
    const finishedAt = new Date(startedAt.getTime() + durationMs)
    const failed = chance(0.08)
    jobRuns.push({ id: uuid(), jobName, status: failed ? JobRunStatus.FAILED : JobRunStatus.SUCCESS, attempt: failed ? randInt(1, 3) : 1, startedAt, finishedAt, durationMs, error: failed ? pick(['Timeout połączenia', 'Błąd zewnętrznego API', 'Brak odpowiedzi SMTP', 'Naruszenie ograniczenia bazy']) : null, result: failed ? null : JSON.stringify({ processed: randInt(0, 500) }), instanceId: `instance-${randInt(1, 4)}`, createdAt: startedAt })
  }
  await insertMany('Historia harmonogramu (uruchomienia)', prisma.scheduledJobRun, jobRuns, 11); jobRuns = []

  // ==========================================================================
  // 14. NEWSLETTER — zapisy
  // ==========================================================================
  let newsletter: any[] = []
  const nlEmails = new Set<string>()
  // część z istniejących klientów (zgoda), reszta zewnętrzni
  const consentClients = clientRows.filter(() => chance(0.5))
  for (const c of consentClients) {
    if (newsletter.length >= TARGET_NEWSLETTER) break
    if (nlEmails.has(c.email)) continue
    nlEmails.add(c.email)
    const confirmed = chance(0.85)
    const zapis = dateBetween(c.createdAt, now)
    const unsub = chance(0.1)
    newsletter.push({ id: uuid(), email: c.email, imie: c.imie, zgoda: true, aktywny: !unsub, potwierdzony: confirmed, tokenPotwierdzajacy: confirmed ? null : uuid(), unsubscribeToken: uuid(), dataPotwierdzenia: confirmed ? dateBetween(zapis, now) : null, dataZapisu: zapis, dataRezygnacji: unsub ? dateBetween(zapis, now) : null })
  }
  let nlIdx = 0
  while (newsletter.length < TARGET_NEWSLETTER) {
    const email = `newsletter.${nlIdx++}@${pick(EMAIL_DOMAINS)}`
    if (nlEmails.has(email)) continue
    nlEmails.add(email)
    const confirmed = chance(0.8)
    const zapis = dateBetween(earliest, now)
    const unsub = chance(0.12)
    newsletter.push({ id: uuid(), email, imie: chance(0.6) ? faker.person.firstName() : null, zgoda: true, aktywny: !unsub, potwierdzony: confirmed, tokenPotwierdzajacy: confirmed ? null : uuid(), unsubscribeToken: uuid(), dataPotwierdzenia: confirmed ? dateBetween(zapis, now) : null, dataZapisu: zapis, dataRezygnacji: unsub ? dateBetween(zapis, now) : null })
  }
  await insertMany('Newsletter (zapisy)', prisma.newsletter, newsletter, 11); newsletter = []; nlEmails.clear()

  console.log('✅ Dane powiązane zaseedowane spójnie!')
}

function buildInvoice(orderId: string, firm: any, kwota: number, issueDate: Date, paymentDate: Date, seq: number) {
  const net = round2(kwota / 1.23)
  const vatAmount = round2(kwota - net)
  const due = new Date(issueDate); due.setDate(due.getDate() + 14)
  return {
    id: uuid(), invoiceNumber: `FV/${issueDate.getFullYear()}/${String(seq).padStart(6, '0')}`, orderId, lawFirmId: firm.id,
    buyerName: firm.nazwaFirmy, buyerNIP: firm.nip, buyerAddress: firm.adres, buyerPostalCode: firm.kodPocztowy, buyerCity: firm.miasto, buyerCountry: 'Polska',
    netAmount: net, vatRate: 23.0, vatAmount, grossAmount: round2(kwota), status: InvoiceStatus.PAID,
    issueDate, saleDate: issueDate, paymentDate, dueDate: due, pdfUrl: null, createdAt: issueDate, updatedAt: paymentDate,
  }
}
