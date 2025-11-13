import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Seed admina
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bpcoders.pl' },
    update: { password: hashedPassword, role: 'ADMIN' },
    create: {
      email: 'admin@bpcoders.pl',
      name: 'Administrator',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })
  console.log(`✓ Admin: ${adminUser.email}`)

  // Seed województw
  const wojewodztwa = [
    { nazwa: 'Dolnośląskie', slug: 'dolnoslaskie' },
    { nazwa: 'Kujawsko-Pomorskie', slug: 'kujawsko-pomorskie' },
    { nazwa: 'Lubelskie', slug: 'lubelskie' },
    { nazwa: 'Lubuskie', slug: 'lubuskie' },
    { nazwa: 'Łódzkie', slug: 'lodzkie' },
    { nazwa: 'Małopolskie', slug: 'malopolskie' },
    { nazwa: 'Mazowieckie', slug: 'mazowieckie' },
    { nazwa: 'Opolskie', slug: 'opolskie' },
    { nazwa: 'Podkarpackie', slug: 'podkarpackie' },
    { nazwa: 'Podlaskie', slug: 'podlaskie' },
    { nazwa: 'Pomorskie', slug: 'pomorskie' },
    { nazwa: 'Śląskie', slug: 'slaskie' },
    { nazwa: 'Świętokrzyskie', slug: 'swietokrzyskie' },
    { nazwa: 'Warmińsko-Mazurskie', slug: 'warminsko-mazurskie' },
    { nazwa: 'Wielkopolskie', slug: 'wielkopolskie' },
    { nazwa: 'Zachodniopomorskie', slug: 'zachodniopomorskie' },
  ]

  for (const woj of wojewodztwa) {
    await prisma.voivodeship.upsert({
      where: { slug: woj.slug },
      update: {},
      create: woj,
    })
  }
  console.log('✓ Województwa')

  // Seed kategorii
  const kategorie = [
    { nazwa: 'Prawo cywilne', slug: 'prawo-cywilne', opis: 'Sprawy związane z prawem cywilnym, kontraktami, roszczeniami' },
    { nazwa: 'Prawo karne', slug: 'prawo-karne', opis: 'Obrona w sprawach karnych, postępowania karne' },
    { nazwa: 'Prawo rodzinne', slug: 'prawo-rodzinne', opis: 'Rozwody, alimenty, sprawy opiekuńcze' },
    { nazwa: 'Prawo pracy', slug: 'prawo-pracy', opis: 'Sprawy pracownicze, mobbing, wypowiedzenia' },
  ]

  for (const kat of kategorie) {
    await prisma.category.upsert({
      where: { slug: kat.slug },
      update: {},
      create: kat,
    })
  }
  console.log('✓ Kategorie')

  // Pobierz kategorie i województwa
  const prawoCywilne = await prisma.category.findUnique({ where: { slug: 'prawo-cywilne' } })
  const prawoKarne = await prisma.category.findUnique({ where: { slug: 'prawo-karne' } })
  const prawoRodzinne = await prisma.category.findUnique({ where: { slug: 'prawo-rodzinne' } })
  const prawoPracy = await prisma.category.findUnique({ where: { slug: 'prawo-pracy' } })

  const mazowieckie = await prisma.voivodeship.findUnique({ where: { slug: 'mazowieckie' } })
  const malopolskie = await prisma.voivodeship.findUnique({ where: { slug: 'malopolskie' } })
  const dolnoslaskie = await prisma.voivodeship.findUnique({ where: { slug: 'dolnoslaskie' } })
  const wielkopolskie = await prisma.voivodeship.findUnique({ where: { slug: 'wielkopolskie' } })
  const pomorskie = await prisma.voivodeship.findUnique({ where: { slug: 'pomorskie' } })
  const slaskie = await prisma.voivodeship.findUnique({ where: { slug: 'slaskie' } })
  const lodzkie = await prisma.voivodeship.findUnique({ where: { slug: 'lodzkie' } })

  // Dane kancelarii - 5 na kategorię
  const lawFirmsData = [
    // PRAWO CYWILNE (5)
    { email: 'kontakt@kancelaria-kowalski.pl', name: 'Kancelaria Kowalski', miasto: 'Poznań', voivodeship: wielkopolskie, category: prawoCywilne, nip: '1234567890' },
    { email: 'biuro@lexcivil.pl', name: 'Lex Civil', miasto: 'Warszawa', voivodeship: mazowieckie, category: prawoCywilne, nip: '2345678901' },
    { email: 'kontakt@prawo-dla-ciebie.pl', name: 'Prawo dla Ciebie', miasto: 'Kraków', voivodeship: malopolskie, category: prawoCywilne, nip: '3456789012' },
    { email: 'biuro@kancelaria-wisniewski.pl', name: 'Kancelaria Wiśniewski', miasto: 'Wrocław', voivodeship: dolnoslaskie, category: prawoCywilne, nip: '4567890123' },
    { email: 'kontakt@civil-law.pl', name: 'Civil Law Partners', miasto: 'Gdańsk', voivodeship: pomorskie, category: prawoCywilne, nip: '5678901234' },
    // PRAWO KARNE (5)
    { email: 'obrona@kancelaria-karna.pl', name: 'Kancelaria Karna', miasto: 'Warszawa', voivodeship: mazowieckie, category: prawoKarne, nip: '6789012345' },
    { email: 'kontakt@adwokat-kaminski.pl', name: 'Adwokat Kamiński', miasto: 'Katowice', voivodeship: slaskie, category: prawoKarne, nip: '7890123456' },
    { email: 'biuro@lex-defense.pl', name: 'Lex Defense', miasto: 'Poznań', voivodeship: wielkopolskie, category: prawoKarne, nip: '8901234567' },
    { email: 'kontakt@kancelaria-lewandowski.pl', name: 'Kancelaria Lewandowski', miasto: 'Łódź', voivodeship: lodzkie, category: prawoKarne, nip: '9012345678' },
    { email: 'biuro@criminal-law.pl', name: 'Criminal Law Experts', miasto: 'Kraków', voivodeship: malopolskie, category: prawoKarne, nip: '0123456789' },
    // PRAWO RODZINNE (5)
    { email: 'kontakt@rodzina-prawo.pl', name: 'Rodzina i Prawo', miasto: 'Warszawa', voivodeship: mazowieckie, category: prawoRodzinne, nip: '1230987654' },
    { email: 'biuro@kancelaria-rodzinna.pl', name: 'Kancelaria Rodzinna', miasto: 'Gdańsk', voivodeship: pomorskie, category: prawoRodzinne, nip: '2341098765' },
    { email: 'kontakt@rozwody-alimenty.pl', name: 'Rozwody i Alimenty', miasto: 'Wrocław', voivodeship: dolnoslaskie, category: prawoRodzinne, nip: '3452109876' },
    { email: 'biuro@family-law.pl', name: 'Family Law Partners', miasto: 'Poznań', voivodeship: wielkopolskie, category: prawoRodzinne, nip: '4563210987' },
    { email: 'kontakt@kancelaria-zielinska.pl', name: 'Kancelaria Zielińska', miasto: 'Kraków', voivodeship: malopolskie, category: prawoRodzinne, nip: '5674321098' },
    // PRAWO PRACY (5)
    { email: 'kontakt@prawo-pracy-expert.pl', name: 'Prawo Pracy Expert', miasto: 'Warszawa', voivodeship: mazowieckie, category: prawoPracy, nip: '6785432109' },
    { email: 'biuro@kancelaria-pracownicza.pl', name: 'Kancelaria Pracownicza', miasto: 'Katowice', voivodeship: slaskie, category: prawoPracy, nip: '7896543210' },
    { email: 'kontakt@labor-law.pl', name: 'Labor Law Specialists', miasto: 'Poznań', voivodeship: wielkopolskie, category: prawoPracy, nip: '8907654321' },
    { email: 'biuro@kancelaria-szymanski.pl', name: 'Kancelaria Szymański', miasto: 'Wrocław', voivodeship: dolnoslaskie, category: prawoPracy, nip: '9018765432' },
    { email: 'kontakt@employment-law.pl', name: 'Employment Law Group', miasto: 'Gdańsk', voivodeship: pomorskie, category: prawoPracy, nip: '0129876543' },
  ]

  const createdLawFirms = []
  for (const firmData of lawFirmsData) {
    const userPassword = await bcrypt.hash('Haslo123!', 10)
    const user = await prisma.user.upsert({
      where: { email: firmData.email },
      update: {},
      create: {
        email: firmData.email,
        name: firmData.name,
        password: userPassword,
        role: 'LAW_FIRM',
        emailVerified: new Date(),
      },
    })

    const lawFirm = await prisma.lawFirm.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        typ: 'OSOBA_FIZYCZNA',
        nazwa: firmData.name,
        nazwaFirmy: firmData.name,
        nip: firmData.nip,
        imieKontakt: 'Jan',
        nazwiskoKontakt: 'Kowalski',
        stanowisko: 'Partner zarządzający',
        numerTelefonu: '+48 123 456 789',
        numerTelefonu2: '+48 500 123 456',
        emailKontakt: firmData.email,
        adres: 'ul. Prawnicza 15',
        kodPocztowy: '00-001',
        miasto: firmData.miasto,
        voivodeshipId: firmData.voivodeship?.id || '',
        opis: `Profesjonalna kancelaria prawna w ${firmData.miasto}. Specjalizujemy się w ${firmData.category?.nazwa.toLowerCase()}. Oferujemy kompleksową obsługę prawną z wieloletnim doświadczeniem. Nasz zespół składa się z wykwalifikowanych prawników, którzy z pasją i zaangażowaniem podchodzą do każdej sprawy.`,
        logo: '/uploads/law-firms/logo-placeholder.png',
        zdjecieGlowne: '/uploads/law-firms/office-placeholder.jpg',
        galeriaZdjec: JSON.stringify([
          '/uploads/law-firms/gallery-1.jpg',
          '/uploads/law-firms/gallery-2.jpg',
          '/uploads/law-firms/gallery-3.jpg',
        ]),
        statusGodzinyOtwarcia: true,
        godzinyOtwarcia: JSON.stringify({
          poniedzialek: '9:00-17:00',
          wtorek: '9:00-17:00',
          sroda: '9:00-17:00',
          czwartek: '9:00-17:00',
          piatek: '9:00-15:00',
          sobota: 'Zamknięte',
          niedziela: 'Zamknięte',
        }),
        linkLinkedIn: `https://linkedin.com/company/${firmData.name.toLowerCase().replace(/\s+/g, '-')}`,
        linkFacebook: `https://facebook.com/${firmData.name.toLowerCase().replace(/\s+/g, '.')}`,
        stronaWww: `https://${firmData.name.toLowerCase().replace(/\s+/g, '-')}.pl`,
        edukacja: JSON.stringify([
          {
            uczelnia: 'Uniwersytet Warszawski',
            wydzial: 'Wydział Prawa i Administracji',
            rokOd: 2000,
            rokDo: 2005,
          },
        ]),
        oirpMiasto: firmData.miasto,
        oirpWpis: `${firmData.miasto.substring(0, 2).toUpperCase()}/1234/2010`,
        oirpStatus: true,
        unikatowyOpisUslugi: `Kompleksowa obsługa prawna z indywidualnym podejściem do każdego klienta. Specjalizujemy się w ${firmData.category?.nazwa.toLowerCase()} i oferujemy profesjonalne doradztwo na najwyższym poziomie.`,
        slowaKluczowe: JSON.stringify([
          firmData.category?.nazwa.toLowerCase() || 'prawo',
          'doradztwo prawne',
          'kancelaria',
          firmData.miasto.toLowerCase(),
          'profesjonalna obsługa',
        ]),
        callaPolska: false,
        onlineOnly: false,
        typOferty: 'WSZYSTKIE',
        pakietSubskrypcji: 'PREMIUM',
        punktySaldo: 500,
        zgodaRegulamin: true,
        zgodaPrzetwarzanie: true,
        zweryfikowana: true,
        aktywna: true,
      },
    })

    if (firmData.category) {
      await prisma.lawFirmCategory.upsert({
        where: {
          lawFirmId_categoryId: {
            lawFirmId: lawFirm.id,
            categoryId: firmData.category.id,
          },
        },
        update: {},
        create: {
          lawFirmId: lawFirm.id,
          categoryId: firmData.category.id,
        },
      })
    }

    if (firmData.voivodeship) {
      await prisma.lawFirmVoivodeship.upsert({
        where: {
          lawFirmId_voivodeshipId: {
            lawFirmId: lawFirm.id,
            voivodeshipId: firmData.voivodeship.id,
          },
        },
        update: {},
        create: {
          lawFirmId: lawFirm.id,
          voivodeshipId: firmData.voivodeship.id,
        },
      })
    }

    createdLawFirms.push(lawFirm)
  }
  console.log(`✓ Kancelarie: ${createdLawFirms.length}`)

  // Dane klientów - 20 klientów
  const clientsData = [
    { email: 'jan.kowalski@example.com', name: 'Jan Kowalski', imie: 'Jan', nazwisko: 'Kowalski', miasto: 'Warszawa', voivodeship: mazowieckie },
    { email: 'anna.nowak@example.com', name: 'Anna Nowak', imie: 'Anna', nazwisko: 'Nowak', miasto: 'Kraków', voivodeship: malopolskie },
    { email: 'piotr.wisniewski@example.com', name: 'Piotr Wiśniewski', imie: 'Piotr', nazwisko: 'Wiśniewski', miasto: 'Wrocław', voivodeship: dolnoslaskie },
    { email: 'maria.wojcik@example.com', name: 'Maria Wójcik', imie: 'Maria', nazwisko: 'Wójcik', miasto: 'Poznań', voivodeship: wielkopolskie },
    { email: 'tomasz.kaminski@example.com', name: 'Tomasz Kamiński', imie: 'Tomasz', nazwisko: 'Kamiński', miasto: 'Gdańsk', voivodeship: pomorskie },
    { email: 'katarzyna.lewandowska@example.com', name: 'Katarzyna Lewandowska', imie: 'Katarzyna', nazwisko: 'Lewandowska', miasto: 'Łódź', voivodeship: lodzkie },
    { email: 'marcin.zielinski@example.com', name: 'Marcin Zieliński', imie: 'Marcin', nazwisko: 'Zieliński', miasto: 'Katowice', voivodeship: slaskie },
    { email: 'agnieszka.szymanska@example.com', name: 'Agnieszka Szymańska', imie: 'Agnieszka', nazwisko: 'Szymańska', miasto: 'Warszawa', voivodeship: mazowieckie },
    { email: 'krzysztof.wozniak@example.com', name: 'Krzysztof Woźniak', imie: 'Krzysztof', nazwisko: 'Woźniak', miasto: 'Kraków', voivodeship: malopolskie },
    { email: 'magdalena.dabrowa@example.com', name: 'Magdalena Dąbrowa', imie: 'Magdalena', nazwisko: 'Dąbrowa', miasto: 'Wrocław', voivodeship: dolnoslaskie },
    { email: 'robert.kozlowski@example.com', name: 'Robert Kozłowski', imie: 'Robert', nazwisko: 'Kozłowski', miasto: 'Poznań', voivodeship: wielkopolskie },
    { email: 'joanna.jankowska@example.com', name: 'Joanna Jankowska', imie: 'Joanna', nazwisko: 'Jankowska', miasto: 'Gdańsk', voivodeship: pomorskie },
    { email: 'pawel.mazur@example.com', name: 'Paweł Mazur', imie: 'Paweł', nazwisko: 'Mazur', miasto: 'Łódź', voivodeship: lodzkie },
    { email: 'beata.krawczyk@example.com', name: 'Beata Krawczyk', imie: 'Beata', nazwisko: 'Krawczyk', miasto: 'Katowice', voivodeship: slaskie },
    { email: 'adam.piotrowski@example.com', name: 'Adam Piotrowski', imie: 'Adam', nazwisko: 'Piotrowski', miasto: 'Warszawa', voivodeship: mazowieckie },
    { email: 'ewa.grabowska@example.com', name: 'Ewa Grabowska', imie: 'Ewa', nazwisko: 'Grabowska', miasto: 'Kraków', voivodeship: malopolskie },
    { email: 'lukasz.pawlak@example.com', name: 'Łukasz Pawlak', imie: 'Łukasz', nazwisko: 'Pawlak', miasto: 'Wrocław', voivodeship: dolnoslaskie },
    { email: 'monika.michalska@example.com', name: 'Monika Michalska', imie: 'Monika', nazwisko: 'Michalska', miasto: 'Poznań', voivodeship: wielkopolskie },
    { email: 'grzegorz.nowicki@example.com', name: 'Grzegorz Nowicki', imie: 'Grzegorz', nazwisko: 'Nowicki', miasto: 'Gdańsk', voivodeship: pomorskie },
    { email: 'dorota.adamczyk@example.com', name: 'Dorota Adamczyk', imie: 'Dorota', nazwisko: 'Adamczyk', miasto: 'Łódź', voivodeship: lodzkie },
  ]

  const createdClients = []
  for (const clientData of clientsData) {
    const userPassword = await bcrypt.hash('Klient123!', 10)
    const user = await prisma.user.upsert({
      where: { email: clientData.email },
      update: {},
      create: {
        email: clientData.email,
        name: clientData.name,
        password: userPassword,
        role: 'CLIENT',
        emailVerified: new Date(),
      },
    })

    const client = await prisma.client.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        imie: clientData.imie,
        nazwisko: clientData.nazwisko,
        telefon: '+48 500 000 000',
        miasto: clientData.miasto,
        voivodeshipId: clientData.voivodeship?.id,
        zgodaRegulamin: true,
      },
    })

    createdClients.push(client)
  }
  console.log(`✓ Klienci: ${createdClients.length}`)

  // Sprawy - każdy klient ma 3 sprawy (60 spraw)
  const caseTemplates = [
    { nazwa: 'Sprawa rozwodowa', opis: 'Potrzebuję pomocy w sprawie rozwodu z podziałem majątku.', category: prawoRodzinne, budzet: [3000, 8000] },
    { nazwa: 'Dochodzenie odszkodowania', opis: 'Sprawa o odszkodowanie po wypadku komunikacyjnym.', category: prawoCywilne, budzet: [2000, 5000] },
    { nazwa: 'Sprawa o mobbing', opis: 'Mobbing w miejscu pracy, potrzebuję reprezentacji.', category: prawoPracy, budzet: [2500, 6000] },
    { nazwa: 'Obrona w sprawie karnej', opis: 'Potrzebuję obrony w postępowaniu karnym.', category: prawoKarne, budzet: [4000, 10000] },
    { nazwa: 'Spór o alimenty', opis: 'Sprawa o ustalenie wysokości alimentów na dzieci.', category: prawoRodzinne, budzet: [1500, 4000] },
    { nazwa: 'Windykacja należności', opis: 'Dochodzenie należności od kontrahenta.', category: prawoCywilne, budzet: [1500, 4000] },
    { nazwa: 'Niezgodne wypowiedzenie', opis: 'Sprawa o przywrócenie do pracy po niezgodnym wypowiedzeniu.', category: prawoPracy, budzet: [2000, 5000] },
    { nazwa: 'Sprawa o zniesławienie', opis: 'Obrona w sprawie o zniesławienie.', category: prawoKarne, budzet: [3000, 7000] },
  ]

  let caseCount = 0
  for (const client of createdClients) {
    for (let i = 0; i < 3; i++) {
      const template = caseTemplates[caseCount % caseTemplates.length]
      await prisma.case.create({
        data: {
          clientId: client.id,
          typSprawy: 'OSOBA_PRYWATNA',
          categoryId: template.category?.id || '',
          nazwaSprawy: template.nazwa,
          opisSprawy: template.opis,
          oczekiwanyTerminRealizacji: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          budzetOd: template.budzet[0],
          budzetDo: template.budzet[1],
          imieNazwisko: `${client.imie} ${client.nazwisko}`,
          emailKontakt: client.userId,
          telefonKontakt: client.telefon || '+48 500 000 000',
          preferowanyKontakt: 'OBA',
          voivodeshipId: client.voivodeshipId || '',
          status: i === 0 ? 'OFERTY_OTRZYMANE' : 'NOWA',
          akceptujeKlauzule: true,
        },
      })
      caseCount++
    }
  }
  console.log(`✓ Sprawy: ${caseCount}`)

  // Opinie - każda kancelaria dostaje 2-3 opinie
  const reviewTexts = [
    { tytul: 'Profesjonalna obsługa', tresc: 'Bardzo profesjonalna kancelaria. Polecam!', ocena: 5 },
    { tytul: 'Skuteczna pomoc', tresc: 'Dzięki tej kancelarii wygrałem sprawę. Jestem bardzo zadowolony.', ocena: 5 },
    { tytul: 'Dobra komunikacja', tresc: 'Świetny kontakt, wszystko jasno wytłumaczone.', ocena: 4 },
    { tytul: 'Polecam', tresc: 'Solidna kancelaria, terminowa i rzetelna.', ocena: 5 },
    { tytul: 'Bardzo dobra obsługa', tresc: 'Profesjonalizm na najwyższym poziomie.', ocena: 5 },
  ]

  let reviewCount = 0
  for (let i = 0; i < createdLawFirms.length; i++) {
    const lawFirm = createdLawFirms[i]
    const reviewsToCreate = 2 + (i % 2) // 2 lub 3 opinie

    for (let j = 0; j < reviewsToCreate; j++) {
      const clientIndex = (i * 3 + j) % createdClients.length
      const client = createdClients[clientIndex]
      const review = reviewTexts[reviewCount % reviewTexts.length]

      await prisma.review.create({
        data: {
          lawFirmId: lawFirm.id,
          clientId: client.id,
          ocenaOgolna: review.ocena,
          profesjonalizm: review.ocena,
          komunikacja: review.ocena,
          terminowosc: review.ocena,
          stosunekJakosci: review.ocena,
          tytulOpinii: review.tytul,
          trescOpinii: review.tresc,
          polecam: true,
          anonimowa: false,
          zweryfikowana: true,
          aktywna: true,
        },
      })
      reviewCount++
    }
  }
  console.log(`✓ Opinie: ${reviewCount}`)

  // Kategorie bloga - minimum 5
  const blogCategories = [
    {
      nazwa: 'Prawo i Technologia',
      slug: 'prawo-i-technologia',
      opis: 'Najnowsze trendy na styku prawa i nowych technologii, RODO, AI, e-commerce.',
    },
    {
      nazwa: 'Porady Prawne dla Biznesu',
      slug: 'porady-prawne-dla-biznesu',
      opis: 'Praktyczne porady dla przedsiębiorców, zakładanie firmy, umowy, podatki.',
    },
    {
      nazwa: 'Prawo w Życiu Codziennym',
      slug: 'prawo-w-zyciu-codziennym',
      opis: 'Sprawy, z którymi każdy z nas może się spotkać: spadki, darowizny, reklamacje.',
    },
    {
      nazwa: 'Nieruchomości i Prawo Budowlane',
      slug: 'nieruchomosci-i-prawo-budowlane',
      opis: 'Kupno, sprzedaż, najem nieruchomości, proces budowlany, umowy deweloperskie.',
    },
    {
      nazwa: 'Prawo Pracy',
      slug: 'prawo-pracy-blog',
      opis: 'Prawa i obowiązki w stosunku pracy, mobbing, zwolnienia, umowy o pracę.',
    },
    {
      nazwa: 'Prawo Rodzinne i Spadkowe',
      slug: 'prawo-rodzinne-i-spadkowe',
      opis: 'Rozwody, alimenty, spadki, testamenty i sprawy opiekuńcze.',
    },
  ]

  const createdBlogCategories = []
  for (const cat of blogCategories) {
    const blogCategory = await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    createdBlogCategories.push(blogCategory)
  }
  console.log(`✓ Kategorie bloga: ${createdBlogCategories.length}`)

  // Wpisy blogowe - minimum 15
  const blogPosts = [
    {
      tytul: 'RODO w praktyce - jak chronić dane osobowe w firmie',
      slug: 'rodo-w-praktyce-jak-chronic-dane-osobowe',
      skrot: 'Poznaj najważniejsze zasady ochrony danych osobowych zgodnie z RODO. Praktyczny przewodnik dla przedsiębiorców.',
      tresc: '<h2>Wprowadzenie do RODO</h2><p>RODO, czyli Rozporządzenie o Ochronie Danych Osobowych, to kluczowy akt prawny regulujący przetwarzanie danych osobowych w Unii Europejskiej. Każda firma, która przetwarza dane osobowe, musi przestrzegać jego przepisów.</p><h2>Podstawowe zasady</h2><p>Dane osobowe muszą być przetwarzane zgodnie z prawem, rzetelnie i w sposób przejrzysty. Należy zbierać je tylko w konkretnych celach i nie przetwarzać dalej w sposób niezgodny z tymi celami.</p>',
      categoryId: createdBlogCategories[0].id,
      lawFirmId: createdLawFirms[0].id,
    },
    {
      tytul: 'Jak założyć spółkę z o.o. - krok po kroku',
      slug: 'jak-zalozyc-spolke-z-oo-krok-po-kroku',
      skrot: 'Kompletny przewodnik po zakładaniu spółki z ograniczoną odpowiedzialnością. Wszystkie formalności i koszty.',
      tresc: '<h2>Przygotowanie dokumentów</h2><p>Pierwszym krokiem jest przygotowanie umowy spółki oraz statutu. Można to zrobić samodzielnie lub skorzystać z pomocy prawnika.</p><h2>Kapitał zakładowy</h2><p>Minimalny kapitał zakładowy to 5000 zł. Można go wnieść w formie pieniężnej lub aportu.</p>',
      categoryId: createdBlogCategories[1].id,
      lawFirmId: createdLawFirms[1].id,
    },
    {
      tytul: 'Umowa o pracę vs umowa zlecenie - co wybrać?',
      slug: 'umowa-o-prace-vs-umowa-zlecenie',
      skrot: 'Porównanie najpopularniejszych form zatrudnienia. Zalety i wady każdego rozwiązania.',
      tresc: '<h2>Umowa o pracę</h2><p>Zapewnia największą stabilność i ochronę pracownika. Pracodawca odprowadza wszystkie składki.</p><h2>Umowa zlecenie</h2><p>Większa elastyczność, ale mniejsza ochrona. Brak prawa do urlopu i zwolnień lekarskich.</p>',
      categoryId: createdBlogCategories[4].id,
      lawFirmId: createdLawFirms[15].id,
    },
    {
      tytul: 'Rozwód bez orzekania o winie - kiedy jest możliwy?',
      slug: 'rozwod-bez-orzekania-o-winie',
      skrot: 'Dowiedz się, kiedy możliwy jest rozwód bez orzekania o winie i jakie są jego konsekwencje.',
      tresc: '<h2>Przesłanki rozwodu</h2><p>Rozwód bez orzekania o winie jest możliwy, gdy małżonkowie zgodnie wyrażają taką wolę lub gdy oboje są winni rozkładu pożycia.</p><h2>Konsekwencje</h2><p>Brak orzeczenia o winie wpływa na kwestie alimentacyjne i podział majątku.</p>',
      categoryId: createdBlogCategories[5].id,
      lawFirmId: createdLawFirms[10].id,
    },
    {
      tytul: 'Jak dochodzić odszkodowania po wypadku komunikacyjnym',
      slug: 'jak-dochodzic-odszkodowania-po-wypadku',
      skrot: 'Praktyczny poradnik dla poszkodowanych w wypadkach drogowych. Krok po kroku przez proces dochodzenia odszkodowania.',
      tresc: '<h2>Dokumentacja</h2><p>Zbierz wszystkie dokumenty: protokół policyjny, dokumentację medyczną, rachunki za leczenie.</p><h2>Zgłoszenie szkody</h2><p>Zgłoś szkodę do ubezpieczyciela sprawcy w ciągu 3 dni od wypadku.</p>',
      categoryId: createdBlogCategories[2].id,
      lawFirmId: createdLawFirms[2].id,
    },
    {
      tytul: 'Sztuczna inteligencja a prawo autorskie',
      slug: 'sztuczna-inteligencja-a-prawo-autorskie',
      skrot: 'Czy AI może być autorem? Analiza prawnych aspektów twórczości generowanej przez sztuczną inteligencję.',
      tresc: '<h2>Status prawny AI</h2><p>Obecnie AI nie może być uznana za autora w rozumieniu prawa autorskiego. Autorem może być tylko człowiek.</p><h2>Kto jest właścicielem?</h2><p>Prawa do dzieł stworzonych przez AI mogą należeć do twórcy algorytmu lub użytkownika systemu.</p>',
      categoryId: createdBlogCategories[0].id,
      lawFirmId: createdLawFirms[3].id,
    },
    {
      tytul: 'Mobbing w pracy - jak się bronić?',
      slug: 'mobbing-w-pracy-jak-sie-bronic',
      skrot: 'Kompleksowy przewodnik dla ofiar mobbingu. Dowiedz się, jak udokumentować mobbing i dochodzić swoich praw.',
      tresc: '<h2>Czym jest mobbing?</h2><p>Mobbing to uporczywe i długotrwałe nękanie lub zastraszanie pracownika.</p><h2>Jak się bronić?</h2><p>Dokumentuj wszystkie incydenty, zbieraj świadków, zgłoś sprawę pracodawcy na piśmie.</p>',
      categoryId: createdBlogCategories[4].id,
      lawFirmId: createdLawFirms[16].id,
    },
    {
      tytul: 'Kupno mieszkania - na co zwrócić uwagę?',
      slug: 'kupno-mieszkania-na-co-zwrocic-uwage',
      skrot: 'Najważniejsze kwestie prawne przy zakupie nieruchomości. Uniknij pułapek i zabezpiecz swoje interesy.',
      tresc: '<h2>Sprawdzenie stanu prawnego</h2><p>Przed zakupem sprawdź księgę wieczystą i upewnij się, że nieruchomość jest wolna od obciążeń.</p><h2>Umowa przedwstępna</h2><p>Zabezpiecz się umową przedwstępną z zadatkiem lub zaliczką.</p>',
      categoryId: createdBlogCategories[3].id,
      lawFirmId: createdLawFirms[4].id,
    },
    {
      tytul: 'Obrona w postępowaniu karnym - twoje prawa',
      slug: 'obrona-w-postepowaniu-karnym-twoje-prawa',
      skrot: 'Poznaj swoje prawa jako oskarżony w postępowaniu karnym. Co ci przysługuje i jak z tego skorzystać?',
      tresc: '<h2>Prawo do obrony</h2><p>Każdy oskarżony ma prawo do obrony, w tym prawo do adwokata lub radcy prawnego.</p><h2>Prawo do milczenia</h2><p>Nie musisz odpowiadać na pytania, jeśli mogłoby to cię obciążyć.</p>',
      categoryId: createdBlogCategories[2].id,
      lawFirmId: createdLawFirms[5].id,
    },
    {
      tytul: 'Testament - jak go sporządzić prawidłowo?',
      slug: 'testament-jak-go-sporzadzic-prawidlowo',
      skrot: 'Wszystko o testamentach: formy, wymogi, najczęstsze błędy. Zadbaj o przyszłość swoich bliskich.',
      tresc: '<h2>Formy testamentu</h2><p>Testament może być holograficzny (własnoręczny), allograficzny (notarialny) lub ustny.</p><h2>Wymogi formalne</h2><p>Testament holograficzny musi być napisany w całości własnoręcznie, datowany i podpisany.</p>',
      categoryId: createdBlogCategories[5].id,
      lawFirmId: createdLawFirms[11].id,
    },
    {
      tytul: 'E-commerce a prawo konsumenckie',
      slug: 'e-commerce-a-prawo-konsumenckie',
      skrot: 'Obowiązki sprzedawcy internetowego wobec konsumentów. Co musisz wiedzieć prowadząc sklep online?',
      tresc: '<h2>Prawo odstąpienia</h2><p>Konsument ma prawo odstąpić od umowy zawartej na odległość w ciągu 14 dni bez podania przyczyny.</p><h2>Obowiązek informacyjny</h2><p>Sprzedawca musi jasno informować o cenie, kosztach dostawy i warunkach zwrotu.</p>',
      categoryId: createdBlogCategories[0].id,
      lawFirmId: createdLawFirms[1].id,
    },
    {
      tytul: 'Alimenty na dzieci - jak je ustalić?',
      slug: 'alimenty-na-dzieci-jak-je-ustalic',
      skrot: 'Przewodnik po alimentach na dzieci. Wysokość, zasady ustalania i egzekucja.',
      tresc: '<h2>Zasady ustalania</h2><p>Wysokość alimentów zależy od usprawiedliwionych potrzeb dziecka i możliwości zarobkowych rodziców.</p><h2>Egzekucja</h2><p>Alimenty można egzekwować przez komornika lub fundusz alimentacyjny.</p>',
      categoryId: createdBlogCategories[5].id,
      lawFirmId: createdLawFirms[12].id,
    },
    {
      tytul: 'Umowy handlowe - najczęstsze błędy',
      slug: 'umowy-handlowe-najczestsze-bledy',
      skrot: 'Poznaj najczęstsze błędy w umowach handlowych i dowiedz się, jak ich unikać.',
      tresc: '<h2>Brak precyzji</h2><p>Umowy często są zbyt ogólne i nie precyzują wszystkich istotnych kwestii.</p><h2>Kary umowne</h2><p>Nieprawidłowo sformułowane klauzule o karach umownych mogą być niewykonalne.</p>',
      categoryId: createdBlogCategories[1].id,
      lawFirmId: createdLawFirms[2].id,
    },
    {
      tytul: 'Wypowiedzenie umowy o pracę - co musisz wiedzieć?',
      slug: 'wypowiedzenie-umowy-o-prace',
      skrot: 'Wszystko o wypowiedzeniu umowy o pracę: okresy wypowiedzenia, forma, ochrona przed zwolnieniem.',
      tresc: '<h2>Okresy wypowiedzenia</h2><p>Okres wypowiedzenia zależy od stażu pracy i wynosi od 2 tygodni do 3 miesięcy.</p><h2>Forma wypowiedzenia</h2><p>Wypowiedzenie musi być złożone na piśmie i zawierać uzasadnienie.</p>',
      categoryId: createdBlogCategories[4].id,
      lawFirmId: createdLawFirms[17].id,
    },
    {
      tytul: 'Prawo budowlane - pozwolenie na budowę',
      slug: 'prawo-budowlane-pozwolenie-na-budowe',
      skrot: 'Kiedy potrzebne jest pozwolenie na budowę? Procedura krok po kroku.',
      tresc: '<h2>Kiedy potrzebne?</h2><p>Pozwolenie na budowę jest wymagane przy większości inwestycji budowlanych, z wyjątkiem domów do 70 m².</p><h2>Procedura</h2><p>Wniosek składa się do starostwa powiatowego wraz z projektem budowlanym.</p>',
      categoryId: createdBlogCategories[3].id,
      lawFirmId: createdLawFirms[3].id,
    },
  ]

  let blogPostCount = 0
  for (const post of blogPosts) {
    await prisma.blogPost.create({
      data: {
        tytul: post.tytul,
        slug: post.slug,
        tresc: post.tresc,
        categoryId: post.categoryId,
        lawFirmId: post.lawFirmId,
        obrazekWyrozniajacy: '/images/blog-placeholder.jpg',
        opublikowany: true,
        dataPublikacji: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Losowa data z ostatnich 30 dni
      },
    })
    blogPostCount++
  }
  console.log(`✓ Wpisy blogowe: ${blogPostCount}`)

  console.log('✅ Seeding zakończony pomyślnie!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Błąd podczas seedowania:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
