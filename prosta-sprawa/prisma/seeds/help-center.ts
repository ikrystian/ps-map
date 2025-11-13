import { PrismaClient } from '@prisma/client'

export async function seedHelpCenter(prisma: PrismaClient) {
  console.log('Seeding help center categories and questions...')

  // Kategorie centrum pomocy
  const category1 = await prisma.helpCategory.upsert({
    where: { slug: 'pytania-ogolne' }, // Zmieniono na slug
    update: {},
    create: {
      nazwa: 'Pytania Ogólne',
      slug: 'pytania-ogolne',
      opis: 'Najczęściej zadawane pytania dotyczące funkcjonowania serwisu.',
      ikona: 'QuestionMarkCircle',
      kolejnosc: 1,
      aktywna: true,
    },
  })
  console.log(`✓ Help Category: ${category1.nazwa}`)

  const category2 = await prisma.helpCategory.upsert({
    where: { slug: 'konto-i-platnosci' }, // Zmieniono na slug
    update: {},
    create: {
      nazwa: 'Konto i Płatności',
      slug: 'konto-i-platnosci',
      opis: 'Informacje dotyczące zarządzania kontem i płatności.',
      ikona: 'CreditCard',
      kolejnosc: 2,
      aktywna: true,
    },
  })
  console.log(`✓ Help Category: ${category2.nazwa}`)

  // Pytania do kategorii "Pytania Ogólne"
  const question1 = await prisma.helpQuestion.upsert({
    where: { slug: 'jak-dziala-serwis' },
    update: {},
    create: {
      categoryId: category1.id,
      pytanie: 'Jak działa serwis Prosta Sprawa?',
      odpowiedz: 'Serwis Prosta Sprawa łączy klientów poszukujących pomocy prawnej z kancelariami prawnymi. Klienci mogą dodawać sprawy, a kancelarie składać oferty. Serwis umożliwia również wyszukiwanie prawników i przeglądanie ich profili.',
      slug: 'jak-dziala-serwis',
      kolejnosc: 1,
      aktywna: true,
    },
  })
  console.log(`✓ Help Question: ${question1.pytanie}`)

  const question2 = await prisma.helpQuestion.upsert({
    where: { slug: 'czy-korzystanie-jest-platne' },
    update: {},
    create: {
      categoryId: category1.id,
      pytanie: 'Czy korzystanie z serwisu jest płatne dla klientów?',
      odpowiedz: 'Dla klientów dodawanie spraw i przeglądanie ofert jest całkowicie bezpłatne. Opłaty pobierane są jedynie od kancelarii prawnych za dostęp do systemu i składanie ofert.',
      slug: 'czy-korzystanie-jest-platne',
      kolejnosc: 2,
      aktywna: true,
    },
  })
  console.log(`✓ Help Question: ${question2.pytanie}`)

  const question3 = await prisma.helpQuestion.upsert({
    where: { slug: 'jak-znalezc-prawnika' },
    update: {},
    create: {
      categoryId: category1.id,
      pytanie: 'Jak mogę znaleźć odpowiedniego prawnika?',
      odpowiedz: 'Możesz skorzystać z wyszukiwarki prawników, filtrując wyniki według specjalizacji, lokalizacji lub innych kryteriów. Możesz również dodać swoją sprawę, a kancelarie same złożą Ci oferty.',
      slug: 'jak-znalezc-prawnika',
      kolejnosc: 3,
      aktywna: true,
    },
  })
  console.log(`✓ Help Question: ${question3.pytanie}`)

  // Pytania do kategorii "Konto i Płatności"
  const question4 = await prisma.helpQuestion.upsert({
    where: { slug: 'jak-zalozyc-konto' },
    update: {},
    create: {
      categoryId: category2.id,
      pytanie: 'Jak założyć konto w serwisie?',
      odpowiedz: 'Aby założyć konto, kliknij przycisk "Zarejestruj się" i postępuj zgodnie z instrukcjami. Możesz zarejestrować się jako klient lub jako kancelaria prawna.',
      slug: 'jak-zalozyc-konto',
      kolejnosc: 1,
      aktywna: true,
    },
  })
  console.log(`✓ Help Question: ${question4.pytanie}`)

  const question5 = await prisma.helpQuestion.upsert({
    where: { slug: 'jak-oplacic-pakiet' },
    update: {},
    create: {
      categoryId: category2.id,
      pytanie: 'Jak mogę opłacić pakiet dla kancelarii?',
      odpowiedz: 'Pakiety dla kancelarii można opłacić za pomocą dostępnych metod płatności, takich jak przelew bankowy, PayU lub Przelewy24. Szczegóły znajdziesz w panelu kancelarii w sekcji "Pakiety".',
      slug: 'jak-oplacic-pakiet',
      kolejnosc: 2,
      aktywna: true,
    },
  })
  console.log(`✓ Help Question: ${question5.pytanie}`)

  console.log('Help center data seeded successfully!')
}
