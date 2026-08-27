import { prisma } from "@/lib/prisma"

export interface PublicHelpQuestion {
  id: string
  pytanie: string
  odpowiedz: string
  slug: string
}

export interface PublicHelpCategory {
  id: string
  nazwa: string
  slug: string
  opis: string | null
  questions: PublicHelpQuestion[]
}

/**
 * Pobiera aktywne kategorie i pytania centrum pomocy dla publicznej strony /pomoc.
 * W przeciwieństwie do /api/help/categories (używanego w panelach po zalogowaniu),
 * nie filtruje po `odbiorca` — anonimowy odwiedzający może być zarówno przyszłym
 * klientem, jak i ekspertem.
 */
export async function getPublicHelpCategories(): Promise<PublicHelpCategory[]> {
  const categories = await prisma.helpCategory.findMany({
    where: { aktywna: true },
    select: {
      id: true,
      nazwa: true,
      slug: true,
      opis: true,
      questions: {
        where: { aktywna: true },
        select: {
          id: true,
          pytanie: true,
          odpowiedz: true,
          slug: true,
        },
        orderBy: { kolejnosc: "asc" },
      },
    },
    orderBy: { kolejnosc: "asc" },
  })

  return categories.filter((category) => category.questions.length > 0)
}
