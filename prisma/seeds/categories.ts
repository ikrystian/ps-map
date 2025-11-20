import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function seedCategories(prisma: PrismaClient) {
  console.log('Seeding categories...')

  const dataPath = join(__dirname, 'data', 'categories.json')
  const categories = JSON.parse(readFileSync(dataPath, 'utf-8'))

  for (const category of categories) {
    const slug = category.nazwa.toLowerCase()
      .replace(/ł/g, 'l')
      .replace(/ń/g, 'n')
      .replace(/ą/g, 'a')
      .replace(/ę/g, 'e')
      .replace(/ś/g, 's')
      .replace(/ć/g, 'c')
      .replace(/ż/g, 'z')
      .replace(/ź/g, 'z')
      .replace(/ó/g, 'o')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Create parent category
    const parent = await prisma.category.upsert({
      where: { slug: slug },
      update: {
        nazwa: category.nazwa,
        typ: category.typ as any,
        kolejnosc: category.kolejnosc,
        aktywna: true
      },
      create: {
        nazwa: category.nazwa,
        slug: slug,
        typ: category.typ as any,
        kolejnosc: category.kolejnosc,
        aktywna: true
      },
    })

    // Create children categories
    if (category.children && category.children.length > 0) {
      for (const childName of category.children) {
        const childSlug = childName.toLowerCase()
          .replace(/ł/g, 'l')
          .replace(/ń/g, 'n')
          .replace(/ą/g, 'a')
          .replace(/ę/g, 'e')
          .replace(/ś/g, 's')
          .replace(/ć/g, 'c')
          .replace(/ż/g, 'z')
          .replace(/ź/g, 'z')
          .replace(/ó/g, 'o')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')

        await prisma.category.upsert({
          where: { slug: childSlug },
          update: {
            nazwa: childName,
            typ: category.typ as any,
            parentId: parent.id,
            aktywna: true
          },
          create: {
            nazwa: childName,
            slug: childSlug,
            typ: category.typ as any,
            parentId: parent.id,
            aktywna: true
          },
        })
      }
    }
  }

  console.log('Categories seeded successfully!')
}
