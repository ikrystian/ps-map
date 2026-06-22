import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';
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
  console.log(`Seeding blog posts...`)

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

  // Load posts from JSON
  let realisticPosts: any[] = [];
  try {
    const dataPath = join(__dirname, 'data', 'blog-posts.json');
    realisticPosts = JSON.parse(readFileSync(dataPath, 'utf-8'));
    console.log(`Loaded ${realisticPosts.length} realistic posts from JSON.`);
  } catch (error) {
    console.warn('Could not load blog-posts.json, will generate all randomly.', error);
  }

  const totalToSeed = Math.max(POSTS_TO_CREATE, realisticPosts.length);

  for (let i = 0; i < totalToSeed; i++) {
    try {
      const randomLawFirm = faker.helpers.arrayElement(lawFirms)
      
      let postData: any;
      let categoryId: string;

      if (i < realisticPosts.length) {
        const jsonPost = realisticPosts[i];
        
        // Find category by name (case-insensitive) or slug
        let category = categories.find(c => 
          c.nazwa.toLowerCase() === jsonPost.kategoria.toLowerCase() ||
          c.slug === generateSlug(jsonPost.kategoria)
        );

        // Fallback to random category if not found
        if (!category) {
          category = faker.helpers.arrayElement(categories);
        }

        categoryId = category.id;
        postData = {
          tytul: jsonPost.tytul,
          slug: jsonPost.slug,
          tresc: jsonPost.tresc,
          tagi: jsonPost.tagi,
          obrazekWyrozniajacy: jsonPost.obrazekWyrozniajacy,
          metaTitle: jsonPost.metaTitle,
          metaDescription: jsonPost.metaDescription,
          opublikowany: jsonPost.opublikowany,
        };
      } else {
        const randomCategory = faker.helpers.arrayElement(categories)
        categoryId = randomCategory.id;
        postData = createRandomBlogPost();
      }

      await prisma.blogPost.create({
        data: {
          tytul: postData.tytul,
          slug: postData.slug,
          tresc: postData.tresc,
          obrazekWyrozniajacy: postData.obrazekWyrozniajacy,
          metaTitle: postData.metaTitle,
          metaDescription: postData.metaDescription,
          opublikowany: postData.opublikowany,
          lawFirmId: randomLawFirm.id,
          categoryId: categoryId,
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

