import { PrismaClient, CategoryType } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function seedCategories(prisma: PrismaClient) {
  console.log('Seeding categories...')

  const dataPath = join(__dirname, 'data', 'categories.json')
  const categories = JSON.parse(readFileSync(dataPath, 'utf-8'))

  for (const category of categories) {
    const slug = category.nazwa.toLowerCase().replace(/\s/g, '-')
    await prisma.category.upsert({
      where: { slug: slug },
      update: { ...category, typ: CategoryType[category.typ as keyof typeof CategoryType], slug: slug },
      create: { ...category, typ: CategoryType[category.typ as keyof typeof CategoryType], slug: slug },
    })
  }

  console.log('Categories seeded successfully!')
}
