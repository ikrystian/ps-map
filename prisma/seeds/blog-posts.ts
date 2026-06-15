import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { createRandomBlogPost } from './generators';
import { generateSlug } from '../../lib/utils';

const POSTS_TO_CREATE = 50

interface LawFirmType {
  id: string;
  nazwa: string;
}

interface BlogCategoryType {
  id: string;
  nazwa: string;
  slug: string;
}

export async function seedBlogPosts(prisma: PrismaClient) {
  console.log(`Seeding ${POSTS_TO_CREATE} blog posts...`)

  const lawFirms: LawFirmType[] = await prisma.lawFirm.findMany({
    select: {
      id: true,
      nazwa: true,
    },
  })
  if (lawFirms.length === 0) {
    console.log('No law firms found, skipping blog post seeding.')
    return
  }

  const categories: BlogCategoryType[] = await prisma.blogCategory.findMany({
    select: {
      id: true,
      nazwa: true,
      slug: true,
    },
  })
  if (categories.length === 0) {
    // Create some default categories if none exist

    const categoryNames = ['Prawo cywilne', 'Prawo karne', 'Prawo rodzinne', 'Prawo pracy', 'Prawo handlowe']
    for (const name of categoryNames) {
      const newCategory = await prisma.blogCategory.create({
        data: {
          nazwa: name,
          slug: generateSlug(name),
        },
        select: {
          id: true,
          nazwa: true,
          slug: true,
        },
      })
      categories.push(newCategory)
    }
  }

  for (let i = 0; i < POSTS_TO_CREATE; i++) {
    try {
      const randomLawFirm = faker.helpers.arrayElement(lawFirms)
      const randomCategory = faker.helpers.arrayElement(categories)
      const postData = createRandomBlogPost()

      await prisma.blogPost.create({
        data: {
          ...postData,
          lawFirmId: randomLawFirm.id,
          categoryId: randomCategory.id,
          tagi: JSON.stringify(postData.tagi),
          dataPublikacji: postData.opublikowany ? new Date() : null,
        },
      })

      console.log(`✓ Blog Post: "${postData.tytul}" for ${randomLawFirm.nazwa}`)
    } catch (error) {
      console.error(`Error seeding blog post:`, error)
    }
  }

  console.log('Blog posts seeded successfully!')
}
