import { faker } from '@faker-js/faker/locale/pl'
import crypto from 'crypto'
import {
  CaseStatus,
  CaseType,
  ClientType,
  ConsultationStatus,
  InvoiceStatus,
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
const NUM_LAW_FIRMS = 400
const NUM_CLIENTS = 600 //  => 1000 użytkowników (400 + 600)
const NUM_CASES = 2000
const TARGET_OFFERS = 5000

// Powtarzalność danych pomiędzy uruchomieniami
faker.seed(20260609)

const uuid = () => crypto.randomUUID()
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]
const chance = (p: number) => Math.random() < p
const randInt = (min: number, max: number) => faker.number.int({ min, max })
const dateBetween = (from: Date, to: Date) => faker.date.between({ from, to })
const round2 = (n: number) => Math.round(n * 100) / 100

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

const NOTIF_SOUND_TOPICS = [
  'Pytanie o postęp sprawy', 'Uzupełnienie dokumentów', 'Ustalenie terminu spotkania',
  'Prośba o wycenę', 'Potwierdzenie współpracy', 'Dodatkowe informacje do sprawy',
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

type FirmAgg = {
  zlozone: number
  wygrane: number
  highlightCost: number
  monthly: Map<string, { submitted: number; accepted: number }>
  byCategory: Map<string, { submitted: number; accepted: number }>
}

function jsonGodziny() {
  return JSON.stringify({
    pon: '09:00-17:00', wt: '09:00-17:00', sr: '09:00-17:00',
    czw: '09:00-17:00', pt: '09:00-16:00', sob: 'Zamknięte', nd: 'Zamknięte',
  })
}

/**
 * Wstawia rekordy partiami, aby nie przekroczyć limitu parametrów SQLite.
 */
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
  // Limit ~900 parametrów na zapytanie — bezpieczny dla SQLite (SQLITE_MAX_VARIABLE_NUMBER)
  const chunkSize = Math.max(1, Math.min(1000, Math.floor(900 / Math.max(1, approxCols))))
  for (let i = 0; i < rows.length; i += chunkSize) {
    await model.createMany({ data: rows.slice(i, i + chunkSize) })
  }
  console.log(`  ✓ ${label}: ${rows.length}`)
}

export async function seedRelationalData(prisma: PrismaClient) {
  console.log('🌱 Seedowanie spójnych, powiązanych danych...')

  // --------------------------------------------------------------------------
  // 0. DANE SŁOWNIKOWE (muszą już istnieć)
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

  // Wspólny hash hasła (bcrypt jest wolny — liczymy raz)
  const sharedPassword = await bcrypt.hash('Password123', 10)
  const now = new Date()
  const earliest = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 540) // ~18 miesięcy wstecz

  // --------------------------------------------------------------------------
  // 1. UŻYTKOWNICY (1000)  +  ustawienia powiadomień + status online
  // --------------------------------------------------------------------------
  type UserRow = { id: string; email: string; name: string; role: UserRole; createdAt: Date }
  const users: any[] = []
  const userMeta: UserRow[] = []
  const notifSettings: any[] = []
  const onlineStatuses: any[] = []

  const makeUser = (role: UserRole, idx: number) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const local = generateSlug(`${firstName} ${lastName}`).replace(/-/g, '.')
    const email = `${local}.${idx}@${pick(EMAIL_DOMAINS)}`
    const createdAt = dateBetween(earliest, now)
    const id = uuid()
    users.push({
      id,
      email,
      name: `${firstName} ${lastName}`,
      image: faker.image.avatar(),
      password: sharedPassword,
      role,
      status: UserStatus.ACTIVE,
      emailVerified: createdAt,
      lastLogin: chance(0.8) ? dateBetween(createdAt, now) : null,
      createdAt,
      updatedAt: createdAt,
    })
    notifSettings.push({
      id: uuid(),
      userId: id,
      isConfigured: true,
      emailNoweOferty: true,
      emailWiadomosci: true,
      emailStatusy: true,
      smsPilne: chance(0.3),
      kontaktKlienci: true,
      kluczowe: true,
      wskazowkiPorady: chance(0.7),
      ofertPromocje: chance(0.6),
      przypomnienieWiadomosci: true,
      noweFunkcje: chance(0.7),
      zmianyCenniki: true,
      zmianyRegulamin: true,
      kontaktDoradca: chance(0.3),
      wyswietlanieAwatara: true,
      autoProsbOpinie: chance(0.4),
      powiadomienieDzwiekowe: chance(0.5),
      ustawieniaOgloszenia: true,
      powiadomieniaSmNowa: chance(0.2),
      wiadomosciZbiorcze: true,
      urlop: chance(0.05),
      welcomePackageSeen: true,
      updatedAt: createdAt,
    })
    const isOnline = chance(0.15)
    onlineStatuses.push({
      id: uuid(),
      userId: id,
      isOnline,
      lastSeen: isOnline ? now : dateBetween(createdAt, now),
      updatedAt: now,
    })
    const meta: UserRow = { id, email, name: `${firstName} ${lastName}`, role, createdAt }
    userMeta.push(meta)
    return meta
  }

  let idxCounter = 0
  const firmUsers: UserRow[] = []
  const clientUsers: UserRow[] = []
  for (let i = 0; i < NUM_LAW_FIRMS; i++) firmUsers.push(makeUser(UserRole.LAW_FIRM, idxCounter++))
  for (let i = 0; i < NUM_CLIENTS; i++) clientUsers.push(makeUser(UserRole.CLIENT, idxCounter++))

  // --------------------------------------------------------------------------
  // 2. KLIENCI (powiązani z użytkownikami CLIENT)
  // --------------------------------------------------------------------------
  type ClientRow = {
    id: string; userId: string; email: string; imie: string; nazwisko: string
    telefon: string; clientType: ClientType; createdAt: Date
  }
  const clients: any[] = []
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
      id,
      userId: u.id,
      clientType: isB2B ? ClientType.BUSINESS : ClientType.INDIVIDUAL,
      imie,
      nazwisko,
      telefon,
      nazwaFirmy: isB2B ? `${faker.company.name()} ${pick(['Sp. z o.o.', 'S.A.', 'Sp. k.', 'Sp. j.'])}` : null,
      nip: isB2B ? faker.string.numeric(10) : null,
      regon: isB2B ? faker.string.numeric(9) : null,
      krs: isB2B && chance(0.5) ? faker.string.numeric(10) : null,
      adres: faker.location.streetAddress(),
      kodPocztowy: faker.location.zipCode('##-###'),
      miasto: city?.nazwa ?? faker.location.city(),
      voivodeshipId: voiv.id,
      zgodaRegulamin: true,
      zgodaNewsletter: chance(0.6),
      zgodaMarketing: chance(0.5),
      punktySaldo: 0,
      createdAt: u.createdAt,
      updatedAt: u.createdAt,
    })
    clientRows.push({ id, userId: u.id, email: u.email, imie, nazwisko, telefon, clientType: isB2B ? ClientType.BUSINESS : ClientType.INDIVIDUAL, createdAt: u.createdAt })
  }

  // --------------------------------------------------------------------------
  // 3. KANCELARIE / EKSPERCI (statystyki uzupełnimy po wygenerowaniu ofert)
  // --------------------------------------------------------------------------
  type FirmRow = {
    id: string; userId: string; nazwa: string; nazwaFirmy: string; nip: string
    emailKontakt: string; adres: string; kodPocztowy: string; miasto: string
    voivodeshipId: string; createdAt: Date
  }
  const lawFirms: any[] = []
  const firmRows: FirmRow[] = []
  const lawFirmVoiv: any[] = []
  const lawFirmCity: any[] = []
  const lawFirmCategory: any[] = []
  const services: any[] = []
  const certificates: any[] = []
  const consultAvail: any[] = []

  for (let i = 0; i < NUM_LAW_FIRMS; i++) {
    const u = firmUsers[i]
    const tmpl = pick(REALISTIC_LAW_FIRMS)
    const id = uuid()
    const voiv = pick(voivodeships)
    const homeCity = cityInVoiv(voiv.id)
    const nip = (1000000000 + i).toString()
    const slug = `${generateSlug(tmpl.nazwa)}-${i}`
    // Nazwa wyświetlana zróżnicowana miastem (pula szablonów jest mała) — nazwaFirmy zostaje "prawna"
    const displayName = `${tmpl.nazwa} (${homeCity?.nazwa ?? 'Polska'})`
    const [imieKontakt, ...restK] = u.name.split(' ')
    const nazwiskoKontakt = restK.join(' ') || faker.person.lastName()
    const hasOirp = chance(0.5)
    const hasOra = chance(0.5)
    const pakiet = pick(Object.values(SubscriptionPackage))

    const descHtml =
      `<p><strong>${tmpl.tagline}</strong></p><p>${tmpl.opis}</p>` +
      faker.lorem.paragraphs(2, '\n\n').split('\n\n').map((p) => `<p>${p}</p>`).join('')

    lawFirms.push({
      id,
      userId: u.id,
      typ: pick(Object.values(LawFirmType)),
      nazwa: displayName,
      nazwaFirmy: tmpl.nazwa,
      slug,
      nip,
      regon: faker.string.numeric(9),
      krs: chance(0.5) ? faker.string.numeric(10) : null,
      imieKontakt,
      nazwiskoKontakt,
      stanowisko: pick(['Adwokat', 'Radca prawny', 'Partner zarządzający', 'Aplikant adwokacki', 'Doradca podatkowy']),
      numerTelefonu: faker.phone.number(),
      numerTelefonu2: chance(0.4) ? faker.phone.number() : null,
      emailKontakt: u.email,
      adres: faker.location.streetAddress(),
      kodPocztowy: faker.location.zipCode('##-###'),
      miasto: homeCity?.nazwa ?? faker.location.city(),
      voivodeshipId: voiv.id,
      latitude: round2(faker.number.float({ min: 49.0, max: 54.8 })),
      longitude: round2(faker.number.float({ min: 14.1, max: 24.1 })),
      opis: descHtml,
      logo: faker.image.avatar(),
      zdjecieGlowne: faker.image.url({ width: 1920, height: 400 }),
      galeriaZdjec: JSON.stringify(Array.from({ length: randInt(2, 6) }, () => faker.image.url())),
      filmYouTube: chance(0.3) ? 'https://www.youtube.com/watch?v=quC2GkURViU' : null,
      okladkaFilmu: chance(0.3) ? faker.image.url() : null,
      kolejnoscMultimedia: 'zdjecia',
      statusGodzinyOtwarcia: true,
      godzinyOtwarcia: jsonGodziny(),
      linkLinkedIn: `https://linkedin.com/in/${faker.internet.username()}`,
      linkFacebook: `https://facebook.com/${faker.internet.username()}`,
      linkInstagram: chance(0.5) ? `https://instagram.com/${faker.internet.username()}` : null,
      linkTwitter: null,
      linkTikTok: null,
      stronaWww: faker.internet.url(),
      edukacja: JSON.stringify(
        Array.from({ length: randInt(1, 3) }, () => ({
          uczelnia: `Uniwersytet ${faker.location.city()}`,
          wydzial: 'Wydział Prawa i Administracji',
          stopien: 'magister',
          rokOd: 2000 + randInt(0, 8),
          rokDo: 2009 + randInt(0, 8),
        })),
      ),
      oirpMiasto: hasOirp ? faker.location.city() : null,
      oirpWpis: hasOirp ? `WR-${faker.string.numeric(4)}` : null,
      oirpStatus: hasOirp,
      oraMiasto: hasOra ? faker.location.city() : null,
      oraWpis: hasOra ? `WAW/${faker.string.numeric(5)}` : null,
      oraStatus: hasOra,
      unikatowyOpisUslugi: tmpl.tagline,
      slowaKluczowe: JSON.stringify(faker.lorem.words(4).split(' ')),
      mainCategoryId: null as string | null, // ustawimy poniżej
      callaPolska: chance(0.3),
      onlineOnly: chance(0.2),
      typOferty: pick(Object.values(OfferType)),
      punktySaldo: 0, // policzymy z transakcji
      pakietSubskrypcji: pakiet,
      dataPakietuOd: null as Date | null, // ustawimy z zamówień
      dataPakietuDo: null as Date | null,
      autoRenewal: chance(0.4),
      wyswietleniaProfilu: randInt(40, 6000),
      zlozoneOferty: 0,
      wygraneOferty: 0,
      konwersja: 0,
      pozycjaRanking: null as number | null,
      zgodaRegulamin: true,
      zgodaPrzetwarzanie: true,
      zweryfikowana: chance(0.7),
      aktywna: true,
      accountManagerId: accountManagers.length ? pick(accountManagers).id : null,
      createdAt: u.createdAt,
      updatedAt: u.createdAt,
    })
    firmRows.push({
      id, userId: u.id, nazwa: displayName, nazwaFirmy: tmpl.nazwa, nip,
      emailKontakt: u.email, adres: faker.location.streetAddress(),
      kodPocztowy: faker.location.zipCode('##-###'), miasto: homeCity?.nazwa ?? 'Warszawa',
      voivodeshipId: voiv.id, createdAt: u.createdAt,
    })

    // Województwa działania (z domowym włącznie)
    const voivSet = new Set<string>([voiv.id])
    for (const v of faker.helpers.arrayElements(voivodeships, randInt(1, 4))) voivSet.add(v.id)
    for (const vId of voivSet) lawFirmVoiv.push({ id: uuid(), lawFirmId: id, voivodeshipId: vId, createdAt: u.createdAt })

    // Miasta działania
    const citySet = new Set<string>()
    if (homeCity) citySet.add(homeCity.id)
    for (const vId of voivSet) {
      const c = cityInVoiv(vId)
      if (c) citySet.add(c.id)
    }
    for (const cId of citySet) lawFirmCity.push({ id: uuid(), lawFirmId: id, cityId: cId, createdAt: u.createdAt })

    // Kategorie (specjalizacje) — pierwsza zostaje główną
    const firmCats = faker.helpers.arrayElements(categories, randInt(2, 8))
    firmCats.forEach((cat, order) => {
      lawFirmCategory.push({ id: uuid(), lawFirmId: id, categoryId: cat.id, kolejnosc: order, createdAt: u.createdAt })
    })
    lawFirms[lawFirms.length - 1].mainCategoryId = firmCats[0]?.id ?? null

    // Usługi
    for (const nazwaUslugi of faker.helpers.arrayElements(SERVICE_NAMES, randInt(2, 6))) {
      const od = randInt(100, 800)
      services.push({
        id: uuid(), lawFirmId: id, nazwaUslugi,
        opisUslugi: faker.lorem.sentence(),
        cenaOd: od, cenaDo: od + randInt(200, 2000),
        jednostka: pick(Object.values(ServiceUnit)),
        aktywna: true, createdAt: u.createdAt, updatedAt: u.createdAt,
      })
    }

    // Certyfikaty
    for (const nazwaCert of faker.helpers.arrayElements(CERT_NAMES, randInt(0, 3))) {
      const dataUzyskania = dateBetween(new Date('2012-01-01'), u.createdAt)
      certificates.push({
        id: uuid(), lawFirmId: id, nazwaCertyfikatu: nazwaCert,
        wydawca: pick(['Okręgowa Rada Adwokacka', 'Krajowa Izba Radców Prawnych', 'Ministerstwo Sprawiedliwości', 'Krajowa Izba Doradców Podatkowych']),
        dataUzyskania, dataWaznosci: chance(0.5) ? faker.date.future({ years: 3, refDate: now }) : null,
        numerCertyfikatu: faker.string.alphanumeric(8).toUpperCase(),
        skanCertyfikatu: faker.image.url(), aktywny: true,
        createdAt: u.createdAt, updatedAt: u.createdAt,
      })
    }

    // Dostępność konsultacji (część kancelarii)
    if (chance(0.5)) {
      for (const day of faker.helpers.arrayElements([1, 2, 3, 4, 5], randInt(2, 5))) {
        consultAvail.push({
          id: uuid(), lawFirmId: id, dayOfWeek: day,
          startTime: '09:00', endTime: '17:00',
          price15min: pick([50, 80, 100, 120]), price30min: pick([90, 150, 180, 220]),
          createdAt: u.createdAt, updatedAt: u.createdAt,
        })
      }
    }
  }

  // --------------------------------------------------------------------------
  // 4. SPRAWY (2000) — status wynika z ofert (etap cyklu życia)
  // --------------------------------------------------------------------------
  type Lifecycle = 'NOWA' | 'OFERTY' | 'W_TRAKCIE' | 'ZAKONCZONA' | 'ANULOWANA'
  const lifecycleOf = (): Lifecycle => {
    const r = Math.random()
    if (r < 0.12) return 'NOWA'
    if (r < 0.57) return 'OFERTY'
    if (r < 0.77) return 'W_TRAKCIE'
    if (r < 0.95) return 'ZAKONCZONA'
    return 'ANULOWANA'
  }

  type CaseRow = {
    id: string; clientId: string; clientUserId: string; categoryId: string
    nazwaSprawy: string; createdAt: Date; lifecycle: Lifecycle; offerCount: number
  }
  const cases: any[] = []
  const caseRows: CaseRow[] = []

  for (let i = 0; i < NUM_CASES; i++) {
    const client = pick(clientRows)
    const isBusiness = client.clientType === ClientType.BUSINESS

    // Dopasuj szablon i kategorię do typu klienta
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
    const trybPilny = chance(0.25)
    const budzetOd = chance(0.7) ? randInt(500, 3000) : null
    const budzetDo = budzetOd ? budzetOd + randInt(1000, 12000) : (chance(0.5) ? randInt(2000, 15000) : null)

    const caseType = isBusiness ? pick([CaseType.FIRMA, CaseType.ORGANIZACJA]) : CaseType.OSOBA_PRYWATNA
    const id = uuid()

    cases.push({
      id,
      clientId: client.id,
      typSprawy: caseType,
      categoryId: category.id,
      wybranadziedzinaPrawa: category.nazwa,
      wybranaSpecyfikacja: chance(0.5) ? faker.lorem.words(3) : null,
      specjalizacja: chance(0.4) ? faker.lorem.sentence() : null,
      nazwaSprawy: tmpl.nazwa,
      opisSprawy: `${tmpl.opis} ${faker.lorem.sentence()}`,
      zalaczniki: chance(0.3) ? JSON.stringify(Array.from({ length: randInt(1, 3) }, () => faker.system.commonFileName('pdf'))) : null,
      oczekiwanyTerminRealizacji: chance(0.6) ? faker.date.soon({ days: 90, refDate: createdAt }) : null,
      trybPilny,
      budzetOd,
      budzetDo,
      doNegocjacji: chance(0.6),
      imieNazwisko: `${client.imie} ${client.nazwisko}`,
      emailKontakt: client.email,
      telefonKontakt: client.telefon,
      preferowanyKontakt: pick(Object.values(PreferredContact)),
      voivodeshipId: voiv.id,
      cityId: city?.id ?? null,
      status: CaseStatus.NOWA, // skorygujemy po przypisaniu ofert
      isArchived: false,
      archivedAt: null,
      akceptujeKlauzule: true,
      createdAt,
      updatedAt: createdAt,
      zamknieto: null,
    })
    caseRows.push({ id, clientId: client.id, clientUserId: client.userId, categoryId: category.id, nazwaSprawy: tmpl.nazwa, createdAt, lifecycle, offerCount: 0 })
  }

  // --------------------------------------------------------------------------
  // 5. ROZKŁAD LICZBY OFERT — tak, by suma ≈ TARGET_OFFERS
  // --------------------------------------------------------------------------
  // Sprawy, które mogą mieć oferty (wszystko poza NOWA)
  const offerEligible = caseRows.filter((c) => c.lifecycle !== 'NOWA')
  const MAX_OFFERS_PER_CASE = 8
  // Minimum wymagane na sprawę: W_TRAKCIE/ZAKONCZONA/OFERTY → ≥1; ANULOWANA → część bez ofert
  for (const c of offerEligible) {
    c.offerCount = c.lifecycle === 'ANULOWANA' ? (chance(0.5) ? 0 : 1) : 1
  }
  // Rozdziel pozostałe oferty aż do dokładnie TARGET_OFFERS (z zachowaniem limitu na sprawę)
  let total = offerEligible.reduce((s, c) => s + c.offerCount, 0)
  const expandable = offerEligible.filter((c) => c.offerCount > 0)
  let guard = 0
  while (total < TARGET_OFFERS && expandable.length && guard < TARGET_OFFERS * 50) {
    const c = pick(expandable)
    if (c.offerCount < MAX_OFFERS_PER_CASE) { c.offerCount++; total++ }
    guard++
  }

  // --------------------------------------------------------------------------
  // 6. OFERTY + NEGOCJACJE + agregaty kancelarii + powiadomienia o ofertach
  // --------------------------------------------------------------------------
  const offers: any[] = []
  const negotiations: any[] = []
  const notifications: any[] = []
  const firmAgg = new Map<string, FirmAgg>()
  for (const f of firmRows) firmAgg.set(f.id, { zlozone: 0, wygrane: 0, highlightCost: 0, monthly: new Map(), byCategory: new Map() })
  // wyróżnienia per kancelaria (do transakcji punktowych) oraz oferty per sprawa (do wiadomości)
  const highlightsByFirm = new Map<string, { cost: number; createdAt: Date }[]>()
  const offersByCase = new Map<string, any[]>()

  // przyspieszenie wyszukiwania klienta sprawy
  const clientById = new Map(clientRows.map((c) => [c.id, c]))
  const firmById = new Map(firmRows.map((f) => [f.id, f]))

  // pary (client,firm) z zaakceptowaną ofertą — do konwersacji i opinii
  type WonPair = { caseId: string; clientId: string; clientUserId: string; firmId: string; firmUserId: string; categoryId: string; acceptedAt: Date; lifecycle: Lifecycle }
  const wonPairs: WonPair[] = []

  const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}`

  for (const c of caseRows) {
    if (c.offerCount === 0) {
      // status: NOWA, albo ANULOWANA bez ofert
      const idx = cases.findIndex((x) => x.id === c.id)
      if (c.lifecycle === 'ANULOWANA') {
        cases[idx].status = CaseStatus.ANULOWANA
        cases[idx].zamknieto = dateBetween(c.createdAt, now)
        cases[idx].updatedAt = cases[idx].zamknieto
      } else {
        cases[idx].status = CaseStatus.NOWA
      }
      continue
    }

    const selectedFirms = faker.helpers.arrayElements(firmRows, Math.min(c.offerCount, firmRows.length))
    const winnerIndex =
      c.lifecycle === 'W_TRAKCIE' || c.lifecycle === 'ZAKONCZONA' ? randInt(0, selectedFirms.length - 1) : -1

    let acceptedAt: Date | null = null

    selectedFirms.forEach((firm, fi) => {
      // oferta powstaje po opublikowaniu sprawy ORAZ po założeniu kancelarii
      const offerFrom = firm.createdAt > c.createdAt ? firm.createdAt : c.createdAt
      const offerCreatedAt = dateBetween(offerFrom, now)
      const netto = randInt(500, 8000)
      const vat = 23
      const brutto = round2(netto * 1.23)
      const wyroznienie = chance(0.15)
      const punktyWyroznienia = wyroznienie ? pick([20, 50]) : null
      const offerId = uuid()

      let status: OfferStatus
      let zaakceptowanaData: Date | null = null
      let odrzuconaData: Date | null = null

      if (fi === winnerIndex) {
        status = OfferStatus.ZAAKCEPTOWANA
        zaakceptowanaData = dateBetween(offerCreatedAt, now)
        acceptedAt = zaakceptowanaData
      } else if (winnerIndex >= 0) {
        // pozostałe oferty przy wygranej innej kancelarii
        status = chance(0.8) ? OfferStatus.ODRZUCONA : OfferStatus.WYGASLA
        if (status === OfferStatus.ODRZUCONA) odrzuconaData = dateBetween(offerCreatedAt, now)
      } else if (c.lifecycle === 'ANULOWANA') {
        status = chance(0.6) ? OfferStatus.ODRZUCONA : OfferStatus.WYGASLA
        if (status === OfferStatus.ODRZUCONA) odrzuconaData = dateBetween(offerCreatedAt, now)
      } else {
        // OFERTY_OTRZYMANE — aktywne / negocjacje / pojedyncze odrzucone
        const r = Math.random()
        status = r < 0.7 ? OfferStatus.ZLOZONA : r < 0.9 ? OfferStatus.NEGOCJACJE : OfferStatus.ODRZUCONA
        if (status === OfferStatus.ODRZUCONA) odrzuconaData = dateBetween(offerCreatedAt, now)
      }

      offers.push({
        id: offerId,
        caseId: c.id,
        lawFirmId: firm.id,
        kwotaNetto: netto,
        vat,
        kwotaBrutto: brutto,
        terminRealizacjiDni: randInt(3, 60),
        opisOferty: `${pick(OFFER_INTROS)} ${faker.lorem.paragraph()}`,
        zakresUslug: pick(OFFER_SCOPES),
        warunkiPlatnosci: pick(Object.values(PaymentTerms)),
        dodatkoweWarunki: chance(0.4) ? faker.lorem.sentence() : null,
        wyroznienie,
        punktyWyroznienia,
        status,
        createdAt: offerCreatedAt,
        updatedAt: zaakceptowanaData ?? odrzuconaData ?? offerCreatedAt,
        zaakceptowanaData,
        odrzuconaData,
      })

      // agregaty kancelarii
      const agg = firmAgg.get(firm.id)!
      agg.zlozone++
      if (wyroznienie) {
        agg.highlightCost += punktyWyroznienia!
        if (!highlightsByFirm.has(firm.id)) highlightsByFirm.set(firm.id, [])
        highlightsByFirm.get(firm.id)!.push({ cost: punktyWyroznienia!, createdAt: offerCreatedAt })
      }
      if (!offersByCase.has(c.id)) offersByCase.set(c.id, [])
      offersByCase.get(c.id)!.push(offers[offers.length - 1])
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

        wonPairs.push({
          caseId: c.id, clientId: c.clientId, clientUserId: c.clientUserId,
          firmId: firm.id, firmUserId: firm.userId, categoryId: c.categoryId,
          acceptedAt: zaakceptowanaData!, lifecycle: c.lifecycle,
        })

        // powiadomienie dla kancelarii o akceptacji
        notifications.push({
          id: uuid(), userId: firm.userId, typ: NotificationType.ZMIANA_STATUSU,
          tytul: 'Twoja oferta została zaakceptowana',
          tresc: `Klient zaakceptował Twoją ofertę do sprawy "${c.nazwaSprawy}".`,
          linkUrl: `/panel-eksperta/sprawy/${c.id}`,
          przeczytane: chance(0.6), createdAt: zaakceptowanaData!,
        })
      }

      // powiadomienie dla klienta o nowej ofercie
      notifications.push({
        id: uuid(), userId: c.clientUserId, typ: NotificationType.NOWA_OFERTA,
        tytul: 'Otrzymałeś nową ofertę',
        tresc: `Ekspert ${firm.nazwa} złożył ofertę do sprawy "${c.nazwaSprawy}".`,
        linkUrl: `/panel-klienta/sprawy/${c.id}`,
        przeczytane: chance(0.55), createdAt: offerCreatedAt,
      })

      // negocjacje dla ofert w statusie NEGOCJACJE
      if (status === OfferStatus.NEGOCJACJE) {
        for (let n = 0; n < randInt(1, 3); n++) {
          negotiations.push({
            id: uuid(), offerId, clientId: c.clientId,
            propozycjaKwoty: round2(brutto * faker.number.float({ min: 0.7, max: 0.95 })),
            uzasadnienie: pick(NEGOTIATION_REASONS),
            terminRealizacji: chance(0.5) ? faker.date.soon({ days: 60, refDate: offerCreatedAt }) : null,
            createdAt: dateBetween(offerCreatedAt, now),
          })
        }
      }
    })

    // ustaw status sprawy spójnie z ofertami
    const idx = cases.findIndex((x) => x.id === c.id)
    if (c.lifecycle === 'ANULOWANA') {
      cases[idx].status = CaseStatus.ANULOWANA
      cases[idx].zamknieto = dateBetween(c.createdAt, now)
    } else if (c.lifecycle === 'ZAKONCZONA') {
      cases[idx].status = CaseStatus.ZAKONCZONA
      cases[idx].zamknieto = acceptedAt ? dateBetween(acceptedAt, now) : dateBetween(c.createdAt, now)
    } else if (c.lifecycle === 'W_TRAKCIE') {
      cases[idx].status = CaseStatus.W_TRAKCIE
    } else {
      cases[idx].status = CaseStatus.OFERTY_OTRZYMANE
    }
    cases[idx].updatedAt = cases[idx].zamknieto ?? acceptedAt ?? c.createdAt
  }

  // --------------------------------------------------------------------------
  // 7. UZUPEŁNIENIE STATYSTYK KANCELARII (denormalizacja jak w aplikacji)
  // --------------------------------------------------------------------------
  const lawFirmStats: any[] = []
  const lawFirmCategoryStats: any[] = []
  for (const f of lawFirms) {
    const agg = firmAgg.get(f.id)!
    f.zlozoneOferty = agg.zlozone
    f.wygraneOferty = agg.wygrane
    // dokładnie ta sama formuła co w aplikacji (app/api/offers/[id]/accept)
    f.konwersja = agg.zlozone > 0 ? (agg.wygrane / agg.zlozone) * 100 : 0
    for (const [mk, v] of agg.monthly) {
      const [year, month] = mk.split('-').map(Number)
      lawFirmStats.push({
        id: uuid(), lawFirmId: f.id, year, month,
        profileViews: randInt(0, 400),
        offersSubmitted: v.submitted, offersAccepted: v.accepted, offersRejected: Math.max(0, v.submitted - v.accepted),
        casesViewed: v.submitted + randInt(0, 50),
        createdAt: now, updatedAt: now,
      })
    }
    for (const [catId, v] of agg.byCategory) {
      lawFirmCategoryStats.push({
        id: uuid(), lawFirmId: f.id, categoryId: catId,
        offersSubmitted: v.submitted, offersAccepted: v.accepted,
        createdAt: now, updatedAt: now,
      })
    }
  }
  // ranking wg wyświetleń profilu
  const ranked = [...lawFirms].sort((a, b) => b.wyswietleniaProfilu - a.wyswietleniaProfilu)
  ranked.forEach((f, i) => { f.pozycjaRanking = i + 1 })

  // --------------------------------------------------------------------------
  // 8. OPINIE — wyłącznie od klientów z zakończoną/realizowaną sprawą u danej kancelarii
  // --------------------------------------------------------------------------
  const reviews: any[] = []
  for (const wp of wonPairs) {
    const leaveReview = wp.lifecycle === 'ZAKONCZONA' ? chance(0.7) : chance(0.15)
    if (!leaveReview) continue
    const tmpl = pick(REALISTIC_REVIEWS)
    const firm = firmById.get(wp.firmId)!
    const createdAt = dateBetween(wp.acceptedAt, now)
    const hasReply = chance(0.4)
    reviews.push({
      id: uuid(),
      lawFirmId: wp.firmId,
      clientId: wp.clientId,
      ocenaOgolna: tmpl.ocena,
      profesjonalizm: tmpl.ocena,
      komunikacja: randInt(Math.max(1, tmpl.ocena - 1), 5),
      terminowosc: randInt(Math.max(1, tmpl.ocena - 1), 5),
      stosunekJakosci: randInt(Math.max(1, tmpl.ocena - 1), 5),
      tytulOpinii: tmpl.tytul,
      trescOpinii: tmpl.tresc,
      polecam: tmpl.ocena >= 4,
      anonimowa: chance(0.25),
      odpowiedz: hasReply ? 'Dziękujemy za opinię i zaufanie. Cieszymy się ze współpracy i pozostajemy do dyspozycji w razie kolejnych spraw.' : null,
      dataOdpowiedzi: hasReply ? dateBetween(createdAt, now) : null,
      zweryfikowana: true,
      aktywna: true,
      createdAt,
      updatedAt: createdAt,
    })
    // powiadomienie dla kancelarii o nowej opinii
    notifications.push({
      id: uuid(), userId: firm.userId, typ: NotificationType.NOWA_OPINIA,
      tytul: 'Nowa opinia o Twojej kancelarii',
      tresc: `Otrzymałeś nową opinię: "${tmpl.tytul}".`,
      linkUrl: `/panel-eksperta/opinie`,
      przeczytane: chance(0.5), createdAt,
    })
  }

  // --------------------------------------------------------------------------
  // 9. ULUBIONE KANCELARIE (unikalne pary klient–kancelaria)
  // --------------------------------------------------------------------------
  const favorites: any[] = []
  const favSet = new Set<string>()
  for (const client of clientRows) {
    for (const firm of faker.helpers.arrayElements(firmRows, randInt(0, 5))) {
      const key = `${client.id}:${firm.id}`
      if (favSet.has(key)) continue
      favSet.add(key)
      favorites.push({ id: uuid(), clientId: client.id, lawFirmId: firm.id, createdAt: dateBetween(client.createdAt, now) })
    }
  }

  // --------------------------------------------------------------------------
  // 10. ZAMÓWIENIA + FAKTURY + TRANSAKCJE PUNKTOWE (spójne salda)
  // --------------------------------------------------------------------------
  const orders: any[] = []
  const invoices: any[] = []
  const pointTransactions: any[] = []
  let orderSeq = 1
  let invoiceSeq = 1
  const planByType = new Map(subscriptionPlans.map((p: any) => [p.typ, p]))

  for (const f of lawFirms) {
    const agg = firmAgg.get(f.id)!
    type Tx = { amount: number; type: PointTransactionType; description: string; createdAt: Date }
    const txs: Tx[] = []

    // Pakiet powitalny — pokrywa koszt wyróżnień, gwarantuje brak ujemnego salda
    const welcomeBonus = agg.highlightCost + randInt(50, 400)
    txs.push({ amount: welcomeBonus, type: PointTransactionType.SUBSCRIPTION_BONUS, description: 'Pakiet powitalny — punkty na start', createdAt: f.createdAt })

    // Zamówienia: subskrypcje i pakiety punktów
    const numOrders = randInt(1, 5)
    let latestSubEnd: Date | null = null
    let latestSubPackage: SubscriptionPackage | null = null
    let latestSubStart: Date | null = null

    for (let o = 0; o < numOrders; o++) {
      const isSub = chance(0.5)
      const createdAt = dateBetween(f.createdAt, now)
      const paid = chance(0.85)
      const status = paid ? PaymentStatus.ZAPLACONE : pick([PaymentStatus.OCZEKUJE, PaymentStatus.ANULOWANE])
      const zaplaconoData = paid ? dateBetween(createdAt, now) : null
      const metoda = pick([PaymentMethod.PAYU, PaymentMethod.PRZELEWY24, PaymentMethod.TPAY, PaymentMethod.PRZELEW])
      const orderId = uuid()
      const orderNumber = `ZAM/${createdAt.getFullYear()}/${String(orderSeq++).padStart(5, '0')}`

      const daneFaktury = JSON.stringify({ nazwa: f.nazwaFirmy, nip: f.nip, adres: `${f.adres}, ${f.kodPocztowy} ${f.miasto}` })

      if (isSub && subscriptionPlans.length) {
        const plan: any = planByType.get(f.pakietSubskrypcji) ?? pick(subscriptionPlans)
        const period = pick([1, 6, 12])
        const kwota = period === 1 ? (plan.cena1Miesiac ?? plan.cena12Miesiecy / 12) : period === 6 ? (plan.cena6Miesiecy ?? plan.cena12Miesiecy / 2) : plan.cena12Miesiecy
        const startDate = createdAt
        const endDate = new Date(startDate); endDate.setMonth(endDate.getMonth() + period)
        orders.push({
          id: orderId, orderNumber, lawFirmId: f.id, orderType: OrderType.SUBSCRIPTION,
          pakietPunktow: null, liczbaPunktow: null,
          subscriptionPlanId: plan.id, subscriptionPeriod: period,
          packageStartDate: startDate, packageEndDate: endDate,
          kwota, punktyKoszt: null, metodaPlatnosci: metoda, statusPlatnosci: status,
          daneFaktury, externalOrderId: faker.string.alphanumeric(16), transactionId: paid ? faker.string.alphanumeric(20) : null,
          createdAt, updatedAt: zaplaconoData ?? createdAt, zaplaconoData,
        })
        if (paid) {
          if (plan.punktyGratis > 0) txs.push({ amount: plan.punktyGratis, type: PointTransactionType.SUBSCRIPTION_BONUS, description: `Punkty gratis za pakiet ${plan.nazwa}`, createdAt: zaplaconoData! })
          if (!latestSubStart || startDate > latestSubStart) { latestSubStart = startDate; latestSubEnd = endDate; latestSubPackage = plan.typ }
          // faktura
          invoices.push(buildInvoice(orderId, f, kwota, createdAt, zaplaconoData!, invoiceSeq++))
        }
      } else {
        const liczbaPunktow = pick([100, 250, 500, 1000])
        const kwota = liczbaPunktow * 0.9
        orders.push({
          id: orderId, orderNumber, lawFirmId: f.id, orderType: OrderType.POINTS,
          pakietPunktow: `${liczbaPunktow}_pkt`, liczbaPunktow,
          subscriptionPlanId: null, subscriptionPeriod: null, packageStartDate: null, packageEndDate: null,
          kwota, punktyKoszt: null, metodaPlatnosci: metoda, statusPlatnosci: status,
          daneFaktury, externalOrderId: faker.string.alphanumeric(16), transactionId: paid ? faker.string.alphanumeric(20) : null,
          createdAt, updatedAt: zaplaconoData ?? createdAt, zaplaconoData,
        })
        if (paid) {
          txs.push({ amount: liczbaPunktow, type: PointTransactionType.POINTS_PURCHASE, description: `Zakup pakietu ${liczbaPunktow} punktów`, createdAt: zaplaconoData! })
          invoices.push(buildInvoice(orderId, f, kwota, createdAt, zaplaconoData!, invoiceSeq++))
        }
      }
    }

    // Wydatki punktowe za wyróżnienia ofert
    for (const h of highlightsByFirm.get(f.id) ?? []) {
      txs.push({ amount: -h.cost, type: PointTransactionType.OFFER_HIGHLIGHT, description: 'Wyróżnienie oferty', createdAt: h.createdAt })
    }

    // Posortuj chronologicznie i policz saldo
    txs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    let balance = 0
    for (const t of txs) {
      balance += t.amount
      pointTransactions.push({
        id: uuid(), lawFirmId: f.id, amount: t.amount, balanceAfter: balance,
        type: t.type, description: t.description, createdAt: t.createdAt,
      })
    }
    f.punktySaldo = balance
    if (latestSubPackage) { f.pakietSubskrypcji = latestSubPackage; f.dataPakietuOd = latestSubStart; f.dataPakietuDo = latestSubEnd }
  }

  // --------------------------------------------------------------------------
  // 11. KONWERSACJE + WIADOMOŚCI CZATU (szyfrowane) dla par z akceptacją
  // --------------------------------------------------------------------------
  const conversations: any[] = []
  const chatMessages: any[] = []
  const convSet = new Set<string>()
  for (const wp of wonPairs) {
    const key = `${wp.clientUserId}:${wp.firmUserId}`
    if (convSet.has(key)) continue
    convSet.add(key)
    if (!chance(0.8)) continue // nie każda akceptacja kończy się czatem

    const convId = uuid()
    const startedAt = dateBetween(wp.acceptedAt, now)
    const msgCount = randInt(3, 10)
    let lastAt = startedAt
    let lastText = ''
    let lastSender = ''
    for (let m = 0; m < msgCount; m++) {
      const fromClient = m % 2 === 0
      const senderId = fromClient ? wp.clientUserId : wp.firmUserId
      const plain = CHAT_LINES[m % CHAT_LINES.length]
      const { encrypted, iv } = encryptMessage(plain)
      const createdAt = m === 0 ? startedAt : dateBetween(lastAt, now)
      lastAt = createdAt; lastText = plain; lastSender = senderId
      const isLast = m === msgCount - 1
      chatMessages.push({
        id: uuid(), conversationId: convId, senderId,
        content: encrypted, contentIv: iv, attachments: null,
        status: 'READ', deliveredAt: createdAt,
        isRead: !isLast || chance(0.5), readAt: !isLast ? dateBetween(createdAt, now) : (chance(0.5) ? dateBetween(createdAt, now) : null),
        createdAt, updatedAt: createdAt,
      })
    }
    conversations.push({
      id: convId, clientUserId: wp.clientUserId, lawFirmUserId: wp.firmUserId,
      lastMessageText: lastText, lastMessageAt: lastAt, lastMessageSenderId: lastSender,
      isArchivedByClient: false, isArchivedByLawFirm: false, isDeletedByClient: false, isDeletedByLawFirm: false,
      createdAt: startedAt, updatedAt: lastAt,
    })
  }

  // --------------------------------------------------------------------------
  // 12. WIADOMOŚCI (model Message) powiązane ze sprawami
  // --------------------------------------------------------------------------
  const messages: any[] = []
  for (const c of caseRows) {
    if (c.offerCount === 0 || !chance(0.3)) continue
    const caseOffers = offersByCase.get(c.id) ?? []
    if (!caseOffers.length) continue
    const off = pick(caseOffers)
    const firm = firmById.get(off.lawFirmId)!
    const count = randInt(1, 4)
    for (let m = 0; m < count; m++) {
      const fromClient = m % 2 === 0
      messages.push({
        id: uuid(),
        senderId: fromClient ? c.clientUserId : firm.userId,
        receiverId: fromClient ? firm.userId : c.clientUserId,
        caseId: c.id,
        temat: pick(NOTIF_SOUND_TOPICS),
        tresc: faker.lorem.paragraph(),
        zalaczniki: null,
        przeczytana: chance(0.6),
        createdAt: dateBetween(off.createdAt, now),
      })
    }
  }

  // --------------------------------------------------------------------------
  // 13. REZERWACJE KONSULTACJI
  // --------------------------------------------------------------------------
  const bookings: any[] = []
  const firmsWithAvail = new Set(consultAvail.map((a) => a.lawFirmId))
  for (const firmId of firmsWithAvail) {
    if (!chance(0.5)) continue
    for (let b = 0; b < randInt(1, 4); b++) {
      const client = pick(clientRows)
      const duration = pick([15, 30])
      const status = pick(Object.values(ConsultationStatus))
      const isPast = status === ConsultationStatus.COMPLETED || chance(0.5)
      const consultationDate = isPast ? dateBetween(earliest, now) : faker.date.soon({ days: 30, refDate: now })
      const created = dateBetween(earliest, consultationDate < now ? consultationDate : now)
      bookings.push({
        id: uuid(), lawFirmId: firmId, clientId: client.id,
        consultationDate, duration, price: duration === 15 ? pick([50, 80, 100]) : pick([90, 150, 180]),
        topic: pick(NOTIF_SOUND_TOPICS), clientContact: client.telefon,
        status,
        paymentStatus: status === ConsultationStatus.COMPLETED || status === ConsultationStatus.ACCEPTED ? PaymentStatus.ZAPLACONE : PaymentStatus.OCZEKUJE,
        googleMeetUrl: status === ConsultationStatus.ACCEPTED || status === ConsultationStatus.COMPLETED ? `https://meet.google.com/${faker.string.alphanumeric(3)}-${faker.string.alphanumeric(4)}-${faker.string.alphanumeric(3)}` : null,
        isArchived: false, createdAt: created, updatedAt: created,
      })
    }
  }

  // ==========================================================================
  // ZAPIS DO BAZY (kolejność zgodna z zależnościami FK)
  // ==========================================================================
  console.log('💾 Zapis do bazy danych (operacje masowe)...')
  await insertMany('Użytkownicy', prisma.user, users, 11)
  await insertMany('Ustawienia powiadomień', prisma.notificationSettings, notifSettings, 26)
  await insertMany('Status online', prisma.userOnlineStatus, onlineStatuses, 5)
  await insertMany('Klienci', prisma.client, clients, 20)
  await insertMany('Kancelarie/Eksperci', prisma.lawFirm, lawFirms, 60)
  await insertMany('Województwa kancelarii', prisma.lawFirmVoivodeship, lawFirmVoiv, 4)
  await insertMany('Miasta kancelarii', prisma.lawFirmCity, lawFirmCity, 4)
  await insertMany('Kategorie kancelarii', prisma.lawFirmCategory, lawFirmCategory, 5)
  await insertMany('Usługi', prisma.service, services, 9)
  await insertMany('Certyfikaty', prisma.certificate, certificates, 10)
  await insertMany('Dostępność konsultacji', prisma.consultationAvailability, consultAvail, 8)
  await insertMany('Sprawy', prisma.case, cases, 28)
  await insertMany('Oferty', prisma.offer, offers, 18)
  await insertMany('Negocjacje', prisma.negotiation, negotiations, 6)
  await insertMany('Opinie', prisma.review, reviews, 18)
  await insertMany('Ulubione kancelarie', prisma.favoriteLawFirm, favorites, 4)
  await insertMany('Zamówienia', prisma.order, orders, 20)
  await insertMany('Faktury', prisma.invoice, invoices, 22)
  await insertMany('Transakcje punktowe', prisma.pointTransaction, pointTransactions, 7)
  await insertMany('Statystyki miesięczne', prisma.lawFirmStats, lawFirmStats, 11)
  await insertMany('Statystyki wg kategorii', prisma.lawFirmCategoryStats, lawFirmCategoryStats, 7)
  await insertMany('Konwersacje', prisma.conversation, conversations, 14)
  await insertMany('Wiadomości czatu', prisma.chatMessage, chatMessages, 12)
  await insertMany('Wiadomości', prisma.message, messages, 8)
  await insertMany('Rezerwacje konsultacji', prisma.consultationBooking, bookings, 13)
  await insertMany('Powiadomienia', prisma.notification, notifications, 7)

  console.log('✅ Dane powiązane zaseedowane spójnie!')
  console.log(
    `   Podsumowanie: ${users.length} użytkowników, ${clients.length} klientów, ${lawFirms.length} kancelarii, ` +
      `${cases.length} spraw, ${offers.length} ofert, ${negotiations.length} negocjacji, ${reviews.length} opinii, ` +
      `${orders.length} zamówień, ${invoices.length} faktur, ${pointTransactions.length} transakcji pkt, ` +
      `${conversations.length} konwersacji, ${chatMessages.length} wiad. czatu, ${notifications.length} powiadomień.`,
  )
}

function buildInvoice(orderId: string, firm: any, kwota: number, issueDate: Date, paymentDate: Date, seq: number) {
  const net = round2(kwota / 1.23)
  const vatAmount = round2(kwota - net)
  const due = new Date(issueDate); due.setDate(due.getDate() + 14)
  return {
    id: uuid(),
    invoiceNumber: `FV/${issueDate.getFullYear()}/${String(seq).padStart(5, '0')}`,
    orderId,
    lawFirmId: firm.id,
    buyerName: firm.nazwaFirmy,
    buyerNIP: firm.nip,
    buyerAddress: firm.adres,
    buyerPostalCode: firm.kodPocztowy,
    buyerCity: firm.miasto,
    buyerCountry: 'Polska',
    netAmount: net,
    vatRate: 23.0,
    vatAmount,
    grossAmount: round2(kwota),
    status: InvoiceStatus.PAID,
    issueDate,
    saleDate: issueDate,
    paymentDate,
    dueDate: due,
    pdfUrl: null,
    createdAt: issueDate,
    updatedAt: paymentDate,
  }
}
