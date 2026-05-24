import { PrismaClient, UserRole, OfferStatus, CaseType, ClientType } from '@prisma/client'
import { createRandomOffer, createRandomUser } from './generators'
import { faker } from '@faker-js/faker'

const CASES_TO_CREATE = 120
const OFFERS_PER_CASE_MIN = 1
const OFFERS_PER_CASE_MAX = 5

const BUSINESS_CASES = [
  {
    nazwa: 'Przygotowanie umowy inwestycyjnej i NDA',
    opis: 'Poszukujemy doświadczonego radcy prawnego do opracowania kompleksowej umowy inwestycyjnej (Investment Agreement) oraz umowy o zachowaniu poufności (NDA) dla naszej spółki technologicznej pozyskującej finansowanie rundy Seed od funduszu VC. Zależy nam na zabezpieczeniu praw autorskich (IP transfer) oraz precyzyjnych zapisach dot. kar umownych i praw pierwszeństwa.',
  },
  {
    nazwa: 'Obsługa wdrożenia RODO w sklepie e-commerce',
    opis: 'Zlecimy audyt prawny oraz pełne wdrożenie procedur RODO dla nowego, międzynarodowego sklepu internetowego. W zakres zlecenia wchodzi przygotowanie polityki prywatności, regulaminu sklepu, umów powierzenia przetwarzania danych oraz klauzul informacyjnych i zgód marketingowych.',
  },
  {
    nazwa: 'Spór z kontrahentem o niewykonanie umowy dostawy',
    opis: 'Reprezentacja spółki z o.o. w sporze sądowym z podwykonawcą, który nie wywiązał się z umowy dostawy komponentów elektronicznych, co doprowadziło do opóźnień produkcyjnych i strat finansowych. Wymagane wezwanie do zapłaty kary umownej oraz sporządzenie pozwu o odszkodowanie.',
  },
  {
    nazwa: 'Przekształcenie jednoosobowej działalności w spółkę z o.o.',
    opis: 'Planujemy przekształcenie prężnie działającej jednoosobowej działalności gospodarczej (branża budowlana, roczne obroty ok. 5 mln zł) w spółkę z ograniczoną odpowiedzialnością. Szukamy kancelarii do kompleksowej obsługi tego procesu - od planu przekształcenia, przez sporządzenie aktu założycielskiego, po wpis do KRS.',
  },
  {
    nazwa: 'Spór z urzędem skarbowym o zwrot podatku VAT',
    opis: 'Potrzebujemy wsparcia w sporze z urzędem skarbowym, który wstrzymał zwrot podatku VAT z transakcji wewnątrzwspólnotowych (WDT). Kancelaria przeprowadziła kontrolę celno-skarbową, po której wydała negatywną decyzję. Chcemy złożyć odwołanie do Izby Administracji Skarbowej, a w razie potrzeby skargę do WSA.',
  },
  {
    nazwa: 'Zabezpieczenie praw autorskich do oprogramowania (SaaS)',
    opis: 'Szukamy specjalisty od własności intelektualnej do sporządzenia wzorców umów licencyjnych B2B na korzystanie z naszej platformy SaaS oraz umów przeniesienia autorskich praw majątkowych z programistami (zarówno na UoP, jak i B2B).',
  },
  {
    nazwa: 'Analiza prawna warunków przetargu publicznego',
    opis: 'Zlecimy analizę Specyfikacji Warunków Zamówienia (SWZ) w przetargu nieograniczonym na dostawę systemów IT dla instytucji publicznej. Zależy nam na identyfikacji ryzykownych zapisów w projekcie umowy oraz przygotowaniu ewentualnych pytań do zamawiającego lub odwołania do KIO.',
  },
  {
    nazwa: 'Ochrona znaku towarowego i marki',
    opis: 'Planujemy rejestrację znaku towarowego w Urzędzie Patentowym RP oraz EUIPO. Szukamy rzecznika patentowego lub radcy prawnego z doświadczeniem w IP do przeprowadzenia badania zdolności rejestrowej oraz złożenia wniosków.',
  },
  {
    nazwa: 'Windykacja należności od dłużnika krajowego',
    opis: 'Zlecimy windykację przeterminowanych faktur (łączna kwota 85 000 PLN) od nierzetelnego klienta. Sprawa wymaga etapu przedsądowego (ostateczne wezwania do zapłaty) oraz ewentualnego przygotowania pozwu w postępowaniu upominawczym.',
  },
]

const PRIVATE_CASES = [
  {
    nazwa: 'Sprawa o podział majątku po rozwodzie',
    opis: 'Szukam adwokata do reprezentowania mnie w sprawie o podział majątku wspólnego. W skład majątku wchodzi nieruchomość (dom jednorodzinny obciążony kredytem hipotecznym), samochód oraz oszczędności. Zależy mi na polubownym, ale sprawiedliwym podziale lub spłacie ze strony byłego małżonka.',
  },
  {
    nazwa: 'Stwierdzenie nabycia spadku i dział spadku',
    opis: 'Potrzebuję pomocy prawnej w przeprowadzeniu sprawy spadkowej po zmarłym ojcu. Spadek obejmuje mieszkanie oraz udziały w działce rekreacyjnej. Spadkobierców jest trzech, nie ma między nami pełnej zgody co do sposobu podziału nieruchomości. Konieczne jest założenie sprawy w sądzie.',
  },
  {
    nazwa: 'Odszkodowanie za wypadek komunikacyjny',
    opis: 'Zlecę sprawę o uzyskanie zadośćuczynienia i odszkodowania od ubezpieczyciela po poważnym wypadku drogowym, w którym byłem pasażerem. Doznałem złamania nogi i urazu kręgosłupa, przeszedłem kosztowną operację i rehabilitację. Ubezpieczyciel wypłacił znikomą kwotę bezsporną, szukam pełnego pokrycia kosztów.',
  },
  {
    nazwa: 'Odwołanie od decyzji ZUS w sprawie renty',
    opis: 'ZUS odmówił mi przedłużenia prawa do renty z tytułu niezdolności do pracy, mimo braku poprawy stanu zdrowia i licznych opinii lekarskich. Szukam prawnika do sporządzenia profesjonalnego odwołania od decyzji ZUS do Sądu Pracy i Ubezpieczeń Społecznych.',
  },
  {
    nazwa: 'Pomoc w walce z nieuczciwym deweloperem',
    opis: 'Kupiłem mieszkanie w stanie deweloperskim, w którym podczas odbioru technicznego ujawniono szereg poważnych wad (wilgoć w piwnicy, krzywe ściany, nieszczelne okna). Deweloper unika usunięcia usterek w ramach rękojmi. Szukam pomocy w sformułowaniu wezwania do usunięcia wad oraz ewentualnego pozwu.',
  },
  {
    nazwa: 'Reklamacja wadliwego samochodu używanego',
    opis: 'Zakupiłem od komisu samochód używany, w którym po tygodniu ujawiła się poważna usterka silnika ukryta przez sprzedawcę (pęknięty blok silnika). Sprzedawca odmawia zwrotu gotówki lub pokrycia kosztów naprawy, twierdząc, że to wada eksploatacyjna. Potrzebuję wsparcia w dochodzeniu praw z tytułu rękojmi.',
  },
  {
    nazwa: 'Rozwód bez orzekania o winie z alimentami',
    opis: 'Szukam pełnomocnika do poprowadzenia sprawy rozwodowej. Z mężem jesteśmy zgodni co do rozwodu bez orzekania o winie, jednak musimy uregulować kwestię opieki nad małoletnim dzieckiem oraz wysokość alimentów. Chciałabym przygotować profesjonalny pozew rozwodowy wraz z wnioskiem zabezpieczającym.',
  },
  {
    nazwa: 'Naruszenie praw lokatora przez właściciela mieszkania',
    opis: 'Właściciel mieszkania, które wynajmuję, bezprawnie wszedł do lokalu pod moją nieobecność i grozi mi natychmiastowym wyrzuceniem ze względu na opóźnienie z czynszem o 5 dni. Szukam porady prawnej i interwencji adwokackiej w celu ochrony moich praw lokatorskich.',
  },
  {
    nazwa: 'Sąsiedzki spór o granicę działki',
    opis: 'Sąsiad wybudował ogrodzenie wkraczające o pół metra w głąb mojej działki ewidencyjnej i odmawia jego przesunięcia, powołując się na zasiedzenie pasa gruntu. Szukam geodety i adwokata do przeprowadzenia sprawy o rozgraniczenie nieruchomości oraz ochronę własności.',
  },
]

export async function seedCases(prisma: PrismaClient) {
  console.log(`Seeding ${CASES_TO_CREATE} test cases...`)

  const allClients = await prisma.client.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
  const allLawFirms = await prisma.lawFirm.findMany({
    select: {
      id: true,
      nazwa: true,
    },
  })
  const allVoivodeships = await prisma.voivodeship.findMany({
    select: {
      id: true,
      nazwa: true,
    },
  })
  const allCategories = await prisma.category.findMany({
    select: {
      id: true,
      nazwa: true,
      typ: true,
    },
  })

  if (allLawFirms.length === 0 || allCategories.length === 0 || allVoivodeships.length === 0) {
    console.log('Not enough base data (law firms, categories, or voivodeships) to seed cases. Skipping.')
    return
  }

  for (let i = 0; i < CASES_TO_CREATE; i++) {
    try {
      let randomClient

      if (allClients.length > 0) {
        randomClient = faker.helpers.arrayElement(allClients)
      } else {
        // Create a new client if needed
        const randomUserData = createRandomUser(prisma, UserRole.CLIENT)
        const user = await prisma.user.create({
          data: { ...randomUserData, password: 'Password123' },
          select: {
            id: true,
            name: true,
            email: true,
          },
        })
        const client = await prisma.client.create({
          data: {
            userId: user.id,
            clientType: ClientType.INDIVIDUAL,
            imie: user.name ? user.name.split(' ')[0] : faker.person.firstName(),
            nazwisko: user.name ? user.name.split(' ').slice(1).join(' ') : faker.person.lastName(),
            telefon: faker.phone.number(),
          },
        })
        randomClient = { ...client, user }
        allClients.push(randomClient)
      }

      // Filter categories depending on client type
      const isBusiness = randomClient.clientType === ClientType.BUSINESS
      const filteredCategories = allCategories.filter((cat) =>
        isBusiness ? cat.typ === 'SPRAWY_FIRMOWE' : cat.typ === 'SPRAWY_PRYWATNE'
      )
      
      const randomCategory = faker.helpers.arrayElement(
        filteredCategories.length > 0 ? filteredCategories : allCategories
      )
      const randomVoivodeship = faker.helpers.arrayElement(allVoivodeships)

      // Pick template and detail fields
      const caseTemplates = isBusiness ? BUSINESS_CASES : PRIVATE_CASES
      const template = faker.helpers.arrayElement(caseTemplates)

      const alignedCaseType = isBusiness
        ? faker.helpers.arrayElement([CaseType.FIRMA, CaseType.ORGANIZACJA])
        : CaseType.OSOBA_PRYWATNA

      const budzetOd = faker.helpers.maybe(() => faker.number.int({ min: 500, max: 2000 })) || null
      const budzetDo = faker.helpers.maybe(() => faker.number.int({ min: 2500, max: 15000 })) || null

      const caseRecord = await prisma.case.create({
        data: {
          typSprawy: alignedCaseType,
          nazwaSprawy: template.nazwa,
          opisSprawy: `${template.opis} Sprawa wymaga pilnej analizy dokumentacji i rzetelnej oceny szans procesowych.`,
          oczekiwanyTerminRealizacji: faker.date.future(),
          trybPilny: faker.datatype.boolean(),
          budzetOd,
          budzetDo,
          doNegocjacji: faker.datatype.boolean(),
          imieNazwisko: `${randomClient.imie} ${randomClient.nazwisko}`,
          emailKontakt: randomClient.user.email,
          telefonKontakt: randomClient.telefon || faker.phone.number(),
          preferowanyKontakt: faker.helpers.arrayElement(['EMAIL', 'TELEFON', 'OBA'] as const),
          status: 'NOWA',
          akceptujeKlauzule: true,
          clientId: randomClient.id,
          voivodeshipId: randomVoivodeship.id,
          categoryId: randomCategory.id,
        },
      })

      console.log(`✓ Case: "${template.nazwa}" (${alignedCaseType}) for ${randomClient.imie} ${randomClient.nazwisko}`)

      // Create offers for the case
      const offersToCreate = faker.number.int({ min: OFFERS_PER_CASE_MIN, max: OFFERS_PER_CASE_MAX })
      const selectedLawFirms = faker.helpers.arrayElements(allLawFirms, offersToCreate)

      for (const lawFirm of selectedLawFirms) {
        const offerData = createRandomOffer(prisma)
        await prisma.offer.create({
          data: {
            ...offerData,
            caseId: caseRecord.id,
            lawFirmId: lawFirm.id,
            zaakceptowanaData: offerData.status === OfferStatus.ZAAKCEPTOWANA ? new Date() : null,
          },
        })
        console.log(`  ✓ Offer: ${offerData.kwotaBrutto} PLN from ${lawFirm.nazwa}`)
      }
      console.log('---')
    } catch (error) {
      console.error('Error seeding case:', error)
    }
  }

  console.log('Cases seeded successfully!')
}
