import { PrismaClient } from "@prisma/client";
import { generateSlug } from "../../lib/utils";

interface BlogCategoryInput {
  nazwa: string;
  children: string[];
}

// SPRAWY PRYWATNE
const privateBlogCategories: BlogCategoryInput[] = [
  {
    nazwa: "Prawo karne",
    children: ["Wykroczenia", "Przestępstwa"],
  },
  {
    nazwa: "Zobowiązania finansowe",
    children: ["Długi, windykacja, egzekucje", "Pożyczki i kredyty"],
  },
  {
    nazwa: "Majątek osobisty",
    children: ["Zarządzanie majątkiem", "Dziedziczenie, spadki, testamenty"],
  },
  {
    nazwa: "Rodzina",
    children: ["Adopcje i opieka nad dziećmi", "Alimenty i rozwody", "Podział majątku, kontakty z dziećmi"],
  },
  {
    nazwa: "Mediacje",
    children: ["Mediacje rodzinne", "Mediacje gospodarcze"],
  },
  {
    nazwa: "Nieruchomości",
    children: ["Kupno/sprzedaż", "Wynajem"],
  },
  {
    nazwa: "Ubezpieczenia",
    children: ["Ubezpieczenia majątkowe", "Ubezpieczenia na życie"],
  },
  {
    nazwa: "Zdrowie i wypadki",
    children: ["Odszkodowania", "Rehabilitacja"],
  },
  {
    nazwa: "Zatrudnienie",
    children: ["Spory pracownicze", "Prawa pracownika"],
  },
  {
    nazwa: "Podatki osobiste",
    children: ["Rozliczenia PIT", "Ulgi podatkowe"],
  },
  {
    nazwa: "Prawo OZE",
    children: ["Regulacje i licencjonowanie", "Umowy i transakcje", "Kwestie środowiskowe, zezwolenia"],
  },
  {
    nazwa: "Prawo konsumenckie",
    children: ["Reklamacje i zwroty", "Problemy z zakupami online", "Umowy z dostawcami usług"],
  },
  {
    nazwa: "Prawo cyfrowe i internetowe",
    children: ["Ochrona danych osobowych w sieci", "Problemy z umowami cyfrowymi (np. subskrypcje)"],
  },
  {
    nazwa: "Prawo medyczne",
    children: ["Błędy medyczne", "Prawa pacjenta"],
  },
  {
    nazwa: "Prawo administracyjne",
    children: ["Sprawy związane z decyzjami administracyjnymi", "Odwołania od decyzji urzędów"],
  },
  {
    nazwa: "Prawa lokatora i najemcy",
    children: ["Umowy", "Problemy z wynajmem mieszkania", "Konflikty z wynajmującym"],
  }
];

// SPRAWY FIRMOWE
const businessBlogCategories: BlogCategoryInput[] = [
  {
    nazwa: "Działalność gospodarcza",
    children: ["Zakładanie firmy", "Obsługa działalności"],
  },
  {
    nazwa: "Spółki",
    children: ["Zakładanie spółek", "Obsługa i zarządzanie"],
  },
  {
    nazwa: "Prawo pracy",
    children: ["Zatrudnienie i umowy", "ZUS i składki"],
  },
  {
    nazwa: "Podatki",
    children: ["Obowiązki podatkowe dla firm", "Ulgi i zwolnienia podatkowe"],
  },
  {
    nazwa: "Przestępstwa skarbowe",
    children: ["Wykroczenia skarbowe", "Kontrole i spory z fiskusem"],
  },
  {
    nazwa: "Sprawy sądowe",
    children: ["Windykacja i egzekucja", "Pozwy sądowe"],
  },
  {
    nazwa: "Przetargi",
    children: ["Postępowania przetargowe", "Skargi i odwołania", "Umowy w ramach procedur przetargowych"],
  },
  {
    nazwa: "Dotacje i finansowanie zewnętrzne",
    children: ["Dotacje unijne", "Wsparcie rządowe", "Proces aplikacyjny i rozliczenie"],
  },
  {
    nazwa: "Dane osobowe",
    children: ["RODO", "Ochrona danych osobowych"],
  },
  {
    nazwa: "Prawa autorskie",
    children: ["Ochrona i licencjonowanie", "Naruszenia praw autorskich", "Umowy dotyczące praw autorskich"],
  },
  {
    nazwa: "Zdrowie i bezpieczeństwo w pracy",
    children: ["Ochrona pracowników", "Przepisy BHP"],
  },
  {
    nazwa: "Finanse i inwestycje",
    children: ["Zarządzanie kapitałem", "Pozyskiwanie finansowania", "Analiza ryzyka inwestycyjnego"],
  },
  {
    nazwa: "Nieruchomości komercyjne",
    children: ["Wynajem i zakup", "Zarządzanie nieruchomościami", "Inwestycje w nieruchomości", "Obrót nieruchomościami (zbycie, dzierżawa, najem)"],
  },
  {
    nazwa: "Marketing i reklama",
    children: ["Promocja w internecie", "Zarządzanie marką"],
  },
  {
    nazwa: "Technologie i innowacje",
    children: ["Ochrona własności intelektualnej", "Cyfrowa transformacja", "Bezpieczeństwo IT"],
  },
  {
    nazwa: "Zarządzanie zasobami ludzkimi",
    children: ["Szkolenia i rozwój", "Ocena pracownika i rekrutacja"],
  },
  {
    nazwa: "Zarządzanie kryzysowe",
    children: ["Planowanie awaryjne", "Komunikacja w czasie kryzysu"],
  },
  {
    nazwa: "Odnawialne Źródła Energii (OZE)",
    children: ["Umowy instalacyjne", "Wsparcie prawne w uzyskiwaniu dotacji", "Prawne aspekty użytkowania"],
  },
  {
    nazwa: "Ochrona środowiska",
    children: ["Gospodarowanie odpadami", "Regulacje środowiskowe"],
  },
  {
    nazwa: "Inne kwestie firmowe",
    children: ["Regulacje branżowe", "Kwestie międzynarodowe"],
  },
  {
    nazwa: "Prawo upadłościowe",
    children: ["Upadłości", "Likwidacja (sprzedaż majątku)"],
  }
];

export async function seedBlogCategories(prisma: PrismaClient) {
  console.log("Seeding blog categories...");

  const categories = [...privateBlogCategories, ...businessBlogCategories];

  await prisma.$transaction(async (tx) => {
    for (const category of categories) {
      const slug = generateSlug(category.nazwa);

      const parent = await tx.blogCategory.upsert({
        where: { slug },
        update: {
          nazwa: category.nazwa,
          parentId: null,
          aktywna: true,
        },
        create: {
          nazwa: category.nazwa,
          slug,
          aktywna: true,
        },
      });

      for (const childName of category.children) {
        const childSlug = generateSlug(childName);

        await tx.blogCategory.upsert({
          where: { slug: childSlug },
          update: {
            nazwa: childName,
            parentId: parent.id,
            aktywna: true,
          },
          create: {
            nazwa: childName,
            slug: childSlug,
            parentId: parent.id,
            aktywna: true,
          },
        });
      }
    }
  });

  console.log(`✓ Blog categories: ${categories.length} kategorii głównych z podkategoriami`);
}
