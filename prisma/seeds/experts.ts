import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// ---------------------------------------------------------------------------
// Dane źródłowe
// ---------------------------------------------------------------------------

const IMIONA_M = [
  'Adam','Bartosz','Cezary','Damian','Emil','Filip','Grzegorz','Henryk','Igor','Jakub',
  'Kamil','Leszek','Marek','Norbert','Oskar','Piotr','Rafał','Sławomir','Tomasz','Wojciech',
  'Artur','Bogdan','Dariusz','Edward','Franciszek','Grzegorz','Hubert','Ireneusz','Jarosław','Krzysztof',
  'Łukasz','Michał','Nikodem','Olaf','Paweł','Radosław','Sebastian','Tadeusz','Waldemar','Zbigniew',
]

const IMIONA_K = [
  'Agnieszka','Barbara','Celina','Dorota','Elżbieta','Felicja','Grażyna','Hanna','Irena','Joanna',
  'Katarzyna','Laura','Magdalena','Natalia','Olga','Patrycja','Roma','Sylwia','Teresa','Urszula',
  'Anna','Beata','Danuta','Ewelina','Gabriela','Helena','Izabela','Julia','Kamila','Lidia',
  'Marta','Nicola','Oktawia','Paulina','Renata','Sabina','Tamara','Wanda','Zofia','Aleksandra',
]

const NAZWISKA = [
  'Kowalski','Nowak','Wiśniewski','Wójcik','Kowalczyk','Kamiński','Lewandowski','Zieliński','Szymański','Woźniak',
  'Dąbrowski','Kozłowski','Jankowski','Mazur','Kwiatkowski','Krawczyk','Piotrowski','Grabowski','Nowakowski','Pawłowski',
  'Michalski','Nowicki','Adamczyk','Dudek','Zając','Wieczorek','Jabłoński','Królik','Majewski','Olszewski',
  'Jaworski','Wróbel','Malinowski','Pawlak','Witkowski','Walczak','Stępień','Górski','Rutkowski','Michalak',
  'Sikora','Ostrowski','Baran','Duda','Szewczyk','Tomaszewski','Pietrzak','Marciniak','Wróblewski','Zalewski',
  'Jakubowski','Jasiński','Zawadzki','Sadowski','Bąk','Chmielewski','Włodarczyk','Borkowski','Czarnecki','Sawicki',
  'Sokołowski','Urbański','Kubiak','Maciejewski','Szczepański','Kucharski','Wilk','Kalinowski','Lis','Mazurek',
]

// Miasta z województwami (reprezentatywna lista)
const MIASTA: { miasto: string; kodPocztowy: string; voivNazwa: string }[] = [
  { miasto: 'Warszawa',      kodPocztowy: '00-001', voivNazwa: 'Mazowieckie' },
  { miasto: 'Kraków',        kodPocztowy: '30-001', voivNazwa: 'Małopolskie' },
  { miasto: 'Łódź',          kodPocztowy: '90-001', voivNazwa: 'Łódzkie' },
  { miasto: 'Wrocław',       kodPocztowy: '50-001', voivNazwa: 'Dolnośląskie' },
  { miasto: 'Poznań',        kodPocztowy: '61-001', voivNazwa: 'Wielkopolskie' },
  { miasto: 'Gdańsk',        kodPocztowy: '80-001', voivNazwa: 'Pomorskie' },
  { miasto: 'Szczecin',      kodPocztowy: '70-001', voivNazwa: 'Zachodniopomorskie' },
  { miasto: 'Bydgoszcz',     kodPocztowy: '85-001', voivNazwa: 'Kujawsko-Pomorskie' },
  { miasto: 'Lublin',        kodPocztowy: '20-001', voivNazwa: 'Lubelskie' },
  { miasto: 'Białystok',     kodPocztowy: '15-001', voivNazwa: 'Podlaskie' },
  { miasto: 'Katowice',      kodPocztowy: '40-001', voivNazwa: 'Śląskie' },
  { miasto: 'Gdynia',        kodPocztowy: '81-001', voivNazwa: 'Pomorskie' },
  { miasto: 'Rzeszów',       kodPocztowy: '35-001', voivNazwa: 'Podkarpackie' },
  { miasto: 'Kielce',        kodPocztowy: '25-001', voivNazwa: 'Świętokrzyskie' },
  { miasto: 'Olsztyn',       kodPocztowy: '10-001', voivNazwa: 'Warmińsko-Mazurskie' },
  { miasto: 'Toruń',         kodPocztowy: '87-100', voivNazwa: 'Kujawsko-Pomorskie' },
  { miasto: 'Zielona Góra',  kodPocztowy: '65-001', voivNazwa: 'Lubuskie' },
  { miasto: 'Opole',         kodPocztowy: '45-001', voivNazwa: 'Opolskie' },
  { miasto: 'Gorzów Wlkp.',  kodPocztowy: '66-400', voivNazwa: 'Lubuskie' },
  { miasto: 'Częstochowa',   kodPocztowy: '42-200', voivNazwa: 'Śląskie' },
  { miasto: 'Radom',         kodPocztowy: '26-600', voivNazwa: 'Mazowieckie' },
  { miasto: 'Sosnowiec',     kodPocztowy: '41-200', voivNazwa: 'Śląskie' },
  { miasto: 'Kalisz',        kodPocztowy: '62-800', voivNazwa: 'Wielkopolskie' },
  { miasto: 'Płock',         kodPocztowy: '09-400', voivNazwa: 'Mazowieckie' },
  { miasto: 'Elbląg',        kodPocztowy: '82-300', voivNazwa: 'Warmińsko-Mazurskie' },
]

const ULICE = [
  'ul. Marszałkowska','ul. Długa','ul. Krótka','ul. Kwiatowa','ul. Słoneczna',
  'ul. Lipowa','ul. Główna','ul. Parkowa','ul. Polna','ul. Leśna',
  'al. Jerozolimskie','ul. Mickiewicza','ul. Sienkiewicza','ul. Kościuszki','ul. Piłsudskiego',
  'pl. Zamkowy','ul. Nowa','ul. Stara','ul. Zielona','ul. Różana',
]

const OPISY_PRAWNIK: string[] = [
  'Specjalizuję się w prawie cywilnym i rodzinnym. Pomagam klientom w sprawach rozwodowych, podziałach majątku oraz alimentach. Moje wieloletnie doświadczenie gwarantuje skuteczną reprezentację przed sądem.',
  'Adwokat z 15-letnim stażem. Specjalizacja: prawo karne, obrona oskarżonych oraz sprawy o odszkodowania. Prowadzę klientów przez każdy etap postępowania sądowego.',
  'Radca prawny specjalizujący się w prawie gospodarczym i prawie spółek. Obsługuję przedsiębiorców w zakresie zawierania umów, rejestracji spółek i sporów handlowych.',
  'Doradca podatkowy z certyfikatem Ministerstwa Finansów. Pomagam firmom i osobom fizycznym w optymalizacji podatkowej, rozliczeniach VAT oraz reprezentacji przed organami skarbowymi.',
  'Mediator sądowy i pozasądowy. Pomagam stronom konfliktów w osiągnięciu porozumienia bez kosztownych procesów sądowych. Specjalizuję się w sprawach rodzinnych i biznesowych.',
  'Prawnik z doświadczeniem w prawie nieruchomości. Analiza ksiąg wieczystych, umowy deweloperskie, zniesienie współwłasności i obsługa transakcji kupna-sprzedaży.',
  'Specjalista prawa pracy po stronie pracodawców i pracowników. Przygotowuję umowy, regulaminy pracy, prowadzę spory przed sądami pracy.',
  'Adwokat karnista. Obrona na każdym etapie postępowania karnego – od zatrzymania przez policję po kasację. Specjalizacja: przestępstwa gospodarcze i prawo karne skarbowe.',
  'Rzecznik patentowy. Rejestracja znaków towarowych, patentów i wzorów użytkowych. Ochrona własności intelektualnej dla firm z sektora IT i przemysłowego.',
  'Radca prawny ds. prawa administracyjnego. Odwołania od decyzji administracyjnych, skargi do WSA i NSA, sprawy związane z pozwoleniami budowlanymi i planowaniem przestrzennym.',
]

const OPISY_EKSPERT: string[] = [
  'Biegły rewident z uprawnieniami KIBR. Przeprowadzam badania sprawozdań finansowych, audyty wewnętrzne oraz sporządzam opinie biegłego dla sądów i instytucji.',
  'Rzeczoznawca majątkowy z licencją państwową. Wykonuję operaty szacunkowe nieruchomości dla banków, sądów, urzędów i osób prywatnych. Ponad 10 lat praktyki zawodowej.',
  'Doradca finansowy z certyfikatem CFA. Pomagam klientom indywidualnym i firmom w planowaniu finansowym, inwestycjach i wyborze optymalnych produktów bankowych.',
  'Specjalista BHP z uprawnieniami inspektora PIP. Przeprowadzam szkolenia, audyty zakładów pracy, opracowuję dokumentację BHP oraz oceny ryzyka zawodowego.',
  'Informatyk śledczy z certyfikatem OSCP. Odzyskiwanie danych, analiza cyfrowych śladów, opinie biegłego w sprawach cyberprzestępczości i naruszeń bezpieczeństwa.',
  'Tłumacz przysięgły języka angielskiego i niemieckiego. Tłumaczenia dokumentów urzędowych, sądowych, umów i certyfikatów. Szybki czas realizacji.',
  'Psycholog sądowy i biegły sądowy. Opinie psychologiczne dla sądów, diagnoza osobowości, ocena wiarygodności zeznań, mediacje rodzinne.',
  'Geodeta uprawniony. Pomiary geodezyjne, wznowienie znaków granicznych, mapy do celów projektowych, podziały nieruchomości i rozgraniczenia.',
  'Inspektor nadzoru budowlanego z uprawnieniami budowlanymi. Nadzór inwestorski, odbiory techniczne, ekspertyzy budowlane i opinie o stanie technicznym obiektów.',
  'Doradca restrukturyzacyjny z licencją Ministra Sprawiedliwości. Prowadzę postępowania restrukturyzacyjne i upadłościowe, doradzam zarządom firm w kryzysie finansowym.',
]

// Generuje slug dla nazwy firmy
function toSlug(text: string, suffix: string): string {
  const map: Record<string, string> = { ą:'a',ć:'c',ę:'e',ł:'l',ń:'n',ó:'o',ś:'s',ź:'z',ż:'z',Ą:'a',Ć:'c',Ę:'e',Ł:'l',Ń:'n',Ó:'o',Ś:'s',Ź:'z',Ż:'z' }
  return text
    .split('').map(c => map[c] || c).join('')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') + '-' + suffix
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

// Prosty deterministyczny PRNG (mulberry32)
function makePrng(seed: number) {
  let s = seed
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0
    let t = Math.imul(s ^ s >>> 15, 1 | s)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// ---------------------------------------------------------------------------
// Główna funkcja seedująca ekspertów
// ---------------------------------------------------------------------------

export async function seedExperts(prisma: PrismaClient) {
  console.log('Seeding 300 experts…')

  // Pobierz dane słownikowe z bazy
  const voivodeships = await prisma.voivodeship.findMany({ select: { id: true, nazwa: true } })
  const expertiseCategories = await prisma.expertiseCategory.findMany({ select: { id: true, nazwa: true, parentId: true } })
  const categories = await prisma.category.findMany({ where: { parentId: null, aktywna: true }, select: { id: true, nazwa: true } })

  if (!voivodeships.length) throw new Error('Brak województw – uruchom seedVoivodeships najpierw')
  if (!expertiseCategories.length) throw new Error('Brak expertise categories – uruchom seedExpertiseCategories najpierw')
  if (!categories.length) throw new Error('Brak kategorii – uruchom seedCategories najpierw')

  // Tylko leaf-nodes (specjalizacje końcowe)
  const leafExpertise = expertiseCategories.filter(ec =>
    !expertiseCategories.some(other => other.parentId === ec.id)
  )

  // Mapa województw (nazwa -> id) – case-insensitive
  const voivMap = new Map(voivodeships.map(v => [v.nazwa.toLowerCase(), v.id]))

  const hashedPassword = await bcrypt.hash('Expert123!', 10)
  const TOTAL = 300

  let created = 0
  let skipped = 0

  for (let i = 1; i <= TOTAL; i++) {
    const rng = makePrng(i * 31337)

    const isFemale = rng() < 0.45
    const imie = isFemale ? pick(IMIONA_K, rng) : pick(IMIONA_M, rng)
    const nazwisko = pick(NAZWISKA, rng)
    const nazwiskoF = isFemale
      ? (nazwisko.endsWith('ski') ? nazwisko.replace(/ski$/, 'ska') : nazwisko.endsWith('cki') ? nazwisko.replace(/cki$/, 'cka') : nazwisko)
      : nazwisko

    const isLawyer = rng() < 0.55 // 55% prawników, 45% ekspertów innych dziedzin
    const opis = isLawyer ? pick(OPISY_PRAWNIK, rng) : pick(OPISY_EKSPERT, rng)

    const lokacja = pick(MIASTA, rng)
    const ulica = pick(ULICE, rng)
    const nrDomu = Math.floor(rng() * 120) + 1

    // Dopasuj voivodeshipId
    const voivId = voivMap.get(lokacja.voivNazwa.toLowerCase()) ?? voivodeships[0].id

    // Typ działalności
    const typOptions = ['OSOBA_FIZYCZNA', 'SPOLKA_CYWILNA', 'SPOLKA_PARTNERSKA', 'SPOLKA_ZOO', 'INNY'] as const
    const typ = pick(typOptions, rng)

    // Expertize category (leaf)
    const expCat = pick(leafExpertise, rng)

    // Kategoria główna
    const mainCat = pick(categories, rng)

    // Slug email (unikalny przez numer i)
    const emailLocal = `${imie.toLowerCase()}.${nazwiskoF.toLowerCase().replace(/\s/g, '.')}.${i}`
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9.]/g, '.')
      .replace(/\.+/g, '.')
      .replace(/^\.|\.$/g, '')
    const email = `${emailLocal}@bpcoders.pl`

    // Nazwa firmy
    const nazwaVariants = [
      `Kancelaria ${nazwiskoF} i Wspólnicy`,
      `${imie} ${nazwiskoF} – Ekspert`,
      `${imie} ${nazwiskoF}`,
      `Kancelaria Radcy Prawnego ${imie} ${nazwiskoF}`,
      `Biuro Eksperta ${nazwiskoF}`,
      `${imie} ${nazwiskoF} Doradztwo`,
    ]
    const nazwa = pick(nazwaVariants, rng)

    // NIP (unikalny 10-cyfrowy)
    const nipBase = String(1000000000 + i).padStart(10, '0')
    const slug = toSlug(nazwa, nipBase.slice(-4))

    // Godziny otwarcia (format JSON)
    const godzinyOtwarcia = JSON.stringify({
      poniedzialek: '9:00-17:00',
      wtorek:       '9:00-17:00',
      sroda:        '9:00-17:00',
      czwartek:     '9:00-17:00',
      piatek:       '9:00-16:00',
      sobota:       rng() < 0.3 ? '10:00-13:00' : '',
      niedziela:    '',
    })

    // Edukacja
    const uczelnie = ['Uniwersytet Warszawski','UJ Kraków','UAM Poznań','UWr Wrocław','UG Gdańsk','UŁ Łódź','UMCS Lublin','UMK Toruń']
    const wydzialy = ['Wydział Prawa i Administracji','Wydział Ekonomii','Wydział Zarządzania','Wydział Nauk Społecznych']
    const rokOd = 1990 + Math.floor(rng() * 25)
    const edukacja = JSON.stringify([{
      uczelnia: pick(uczelnie, rng),
      wydzial:  pick(wydzialy, rng),
      rokOd,
      rokDo: rokOd + 5,
    }])

    // Słowa kluczowe
    const slowaKluczowe = JSON.stringify([expCat.nazwa, mainCat.nazwa, 'ekspert', 'pomoc prawna'].slice(0, 3))

    // Opis usługi
    const unikatowyOpisUslugi = `Specjalizuję się w obszarze: ${expCat.nazwa}. ${mainCat.nazwa} to moja główna dziedzina działalności.`

    // Typ oferty
    const typOferty = pick(['WSZYSTKIE', 'JEDNORAZOWA_USLUGA', 'STALA_WSPOLPRACA', 'KONSULTACJA'] as const, rng)

    // Pakiet subskrypcji
    const pakiety = ['PODSTAWOWY', 'STANDARD', 'PREMIUM', null, null] as const
    const pakietSubskrypcji = pick(pakiety, rng)

    // Rejestr OIRP/ORA (tylko prawnicy)
    const oirpStatus = isLawyer && rng() < 0.4
    const oraStatus  = isLawyer && !oirpStatus && rng() < 0.3
    const sady = ['Sąd Okręgowy w Warszawie','Sąd Okręgowy w Krakowie','Sąd Okręgowy we Wrocławiu','Sąd Okręgowy w Poznaniu','Sąd Okręgowy w Gdańsku']
    const bieglySadowy = isLawyer && rng() < 0.15
    const bieglySadowyNazwaSadu = bieglySadowy ? pick(sady, rng) : null

    // Statystyki
    const wyswietlenia = Math.floor(rng() * 5000)
    const zlozoneOferty = Math.floor(rng() * 200)
    const wygraneOferty = Math.floor(rng() * zlozoneOferty)

    // Zweryfikowana
    const zweryfikowana = rng() < 0.6

    // Sprawdź czy email już istnieje (idempotentność)
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      skipped++
      continue
    }

    try {
      await prisma.$transaction(async (tx) => {
        // Utwórz użytkownika
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            name: `${imie} ${nazwiskoF}`,
            role: 'LAW_FIRM',
            emailVerified: new Date(),
            status: 'ACTIVE',
            imie,
            nazwisko: nazwiskoF,
            numerTelefonu: `+48 ${Math.floor(500000000 + rng() * 499999999)}`.replace(/(\d{3})(\d{3})(\d{3})/, '+48 $1 $2 $3'),
            adres: `${ulica} ${nrDomu}`,
            kodPocztowy: lokacja.kodPocztowy,
            miasto: lokacja.miasto,
            voivodeshipId: voivId,
          },
        })

        // Utwórz profil LawFirm
        const lawFirm = await tx.lawFirm.create({
          data: {
            userId: user.id,
            slug,
            typ,
            typInny: typ === 'INNY' ? expCat.nazwa : null,
            expertiseCategoryId: expCat.id,
            nazwa,
            nip: nipBase,
            opis,
            unikatowyOpisUslugi,
            slowaKluczowe,
            edukacja,
            typOferty,
            statusGodzinyOtwarcia: true,
            godzinyOtwarcia,
            oirpStatus,
            oirpMiasto: oirpStatus ? lokacja.miasto : null,
            oirpWpis:   oirpStatus ? `KR/${100 + i}/2010` : null,
            oraStatus,
            oraMiasto:  oraStatus  ? lokacja.miasto : null,
            oraWpis:    oraStatus  ? `WA/${200 + i}/2012` : null,
            bieglySadowy,
            bieglySadowyNazwaSadu,
            calaPolska: rng() < 0.25,
            onlineOnly: rng() < 0.1,
            pakietSubskrypcji: pakietSubskrypcji as any,
            dataPakietuOd: pakietSubskrypcji ? new Date('2024-01-01') : null,
            dataPakietuDo: pakietSubskrypcji ? new Date('2025-12-31') : null,
            zgodaRegulamin: true,
            zgodaPrzetwarzanie: true,
            zweryfikowana,
            aktywna: true,
            wyswietleniaProfilu: wyswietlenia,
            zlozoneOferty,
            wygraneOferty,
            mainCategoryId: mainCat.id,
          },
        })

        // Relacja: województwo działania
        await tx.lawFirmVoivodeship.create({
          data: { lawFirmId: lawFirm.id, voivodeshipId: voivId },
        })

        // Relacja: główna kategoria
        await tx.lawFirmCategory.create({
          data: { lawFirmId: lawFirm.id, categoryId: mainCat.id, kolejnosc: 0, percentage: Math.floor(rng() * 60) + 40 },
        })
      })

      created++
      if (created % 50 === 0) {
        console.log(`  ✓ ${created} ekspertów dodano…`)
      }
    } catch (err: any) {
      console.warn(`  ⚠ Pominięto eksperta #${i} (${email}): ${err?.message ?? err}`)
      skipped++
    }
  }

  console.log(`✅ seedExperts zakończony: ${created} utworzonych, ${skipped} pominiętych (duplikaty/błędy)`)
}
