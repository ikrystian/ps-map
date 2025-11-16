import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function seedBlogCategories(prisma: PrismaClient) {
  console.log('Seeding blog categories...')

  const dataPath = join(__dirname, 'data', 'blog-categories.json')
  const blogCategories = JSON.parse(readFileSync(dataPath, 'utf-8'))

  for (const category of blogCategories) {
    await prisma.blogCategory.upsert({
      where: { nazwa: category.nazwa },
      update: { ...category, slug: category.nazwa.toLowerCase().replace(/\s/g, '-') },
      create: { ...category, slug: category.nazwa.toLowerCase().replace(/\s/g, '-') },
    })
  }

  console.log('Blog categories seeded successfully!')
}
