import { PrismaClient } from '@prisma/client'

export async function seedBlogCategories(prisma: PrismaClient) {
  console.log('Seeding blog categories...')

  const blogCategories = [
    {
      nazwa: 'Porady Prawne',
      opis: 'Artykuły i porady dotyczące różnych dziedzin prawa.',
      aktywna: true,
    },
    {
      nazwa: 'Prawo w Biznesie',
      opis: 'Wskazówki prawne dla przedsiębiorców i firm.',
      aktywna: true,
    },
    {
      nazwa: 'Aktualności Prawne',
      opis: 'Najnowsze zmiany w przepisach i orzecznictwie.',
      aktywna: true,
    },
    {
      nazwa: 'Prawo Rodzinne i Spadkowe',
      opis: 'Artykuły dotyczące prawa rodzinnego, rozwodów, alimentów i spadków.',
      aktywna: true,
    },
  ]

  for (const category of blogCategories) {
    await prisma.blogCategory.upsert({
      where: { nazwa: category.nazwa },
      update: { ...category, slug: category.nazwa.toLowerCase().replace(/\s/g, '-') },
      create: { ...category, slug: category.nazwa.toLowerCase().replace(/\s/g, '-') },
    })
  }

  console.log('Blog categories seeded successfully!')
}
