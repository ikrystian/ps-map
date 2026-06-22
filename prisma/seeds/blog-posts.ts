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

// Dopasowuje kategorię po nazwie (bez uwzględniania wielkości liter) lub slugu,
// z bezpiecznym fallbackiem na losową kategorię, gdy nie ma trafienia.
function resolveCategoryId(categories: BlogCategoryType[], kategoria: string): string {
  const match = categories.find(
    (c) =>
      c.nazwa.toLowerCase() === kategoria?.toLowerCase() ||
      c.slug === generateSlug(kategoria || '')
  )
  return (match ?? faker.helpers.arrayElement(categories)).id
}

// Generuje sensowne dane SEO, gdy w danych wejściowych ich brakuje.
// Meta opis przycinamy do ~160 znaków, zgodnie z dobrymi praktykami SEO.
function buildSeo(post: { tytul: string; tresc: string; metaTitle?: string; metaDescription?: string }) {
  const plainText = (post.tresc || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const fallbackDescription = plainText.length > 160 ? `${plainText.slice(0, 157).trimEnd()}...` : plainText
  return {
    metaTitle: post.metaTitle?.trim() || post.tytul,
    metaDescription: post.metaDescription?.trim() || fallbackDescription,
  }
}

// Normalizuje tagi do tablicy stringów (z danych może przyjść tablica, string lub nic).
function normalizeTags(tagi: unknown): string[] {
  if (Array.isArray(tagi)) return tagi.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
  if (typeof tagi === 'string' && tagi.trim().length > 0) {
    return tagi.split(',').map((t) => t.trim()).filter(Boolean)
  }
  return []
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
        if (realisticPosts.length > 0) {
          const jsonPost = faker.helpers.arrayElement(realisticPosts);
          postData = {
            tytul: jsonPost.tytul,
            slug: `${jsonPost.slug}-${faker.string.alphanumeric(6).toLowerCase()}`,
            tresc: jsonPost.tresc,
            tagi: jsonPost.tagi,
            obrazekWyrozniajacy: jsonPost.obrazekWyrozniajacy,
            metaTitle: jsonPost.metaTitle,
            metaDescription: jsonPost.metaDescription,
            opublikowany: jsonPost.opublikowany,
          };
        } else {
          postData = createRandomBlogPost();
        }
      }

      const seo = buildSeo(postData)
      const tagi = normalizeTags(postData.tagi)

      await prisma.blogPost.create({
        data: {
          tytul: postData.tytul,
          slug: postData.slug,
          tresc: postData.tresc,
          obrazekWyrozniajacy: postData.obrazekWyrozniajacy,
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
          opublikowany: postData.opublikowany,
          lawFirmId: randomLawFirm.id,
          categoryId: categoryId,
          tagi: tagi.length > 0 ? JSON.stringify(tagi) : null,
          dataPublikacji: postData.opublikowany ? new Date() : null,
        },
      })

      console.log(`✓ Blog Post: "${postData.tytul}" for ${randomLawFirm.nazwa}`)
    } catch (error) {
      console.error(`Error seeding blog post:`, error)
    }
  }

  await seedSponsoredBlogPosts(prisma, lawFirms, categories)

  console.log('Blog posts seeded successfully!')
}

// Seeduje wpisy sponsorowane — odzwierciedla sposób tworzenia ich w /admin/blog/nowy:
// wpis nie ma autora (lawFirmId = null, to wpis administratora portalu), jest oznaczony
// flagą isSponsored i wskazuje na promowanego eksperta przez sponsoredLawFirmId.
async function seedSponsoredBlogPosts(
  prisma: PrismaClient,
  lawFirms: LawFirmType[],
  categories: BlogCategoryType[]
) {
  let sponsoredPosts: any[] = []
  try {
    const dataPath = join(__dirname, 'data', 'blog-posts-sponsored.json')
    sponsoredPosts = JSON.parse(readFileSync(dataPath, 'utf-8'))
    console.log(`Loaded ${sponsoredPosts.length} sponsored posts from JSON.`)
  } catch (error) {
    console.warn('Could not load blog-posts-sponsored.json, skipping sponsored posts.', error)
    return
  }

  for (const jsonPost of sponsoredPosts) {
    try {
      // Wybierz promowanego eksperta (sponsora) spośród istniejących kancelarii.
      const sponsor = faker.helpers.arrayElement(lawFirms)
      const categoryId = resolveCategoryId(categories, jsonPost.kategoria)
      const seo = buildSeo(jsonPost)
      const tagi = normalizeTags(jsonPost.tagi)

      await prisma.blogPost.create({
        data: {
          tytul: jsonPost.tytul,
          slug: jsonPost.slug,
          tresc: jsonPost.tresc,
          obrazekWyrozniajacy: jsonPost.obrazekWyrozniajacy,
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
          opublikowany: jsonPost.opublikowany ?? true,
          // Wpis sponsorowany to wpis administratora — bez przypisanego autora.
          lawFirmId: null,
          categoryId,
          tagi: tagi.length > 0 ? JSON.stringify(tagi) : null,
          dataPublikacji: (jsonPost.opublikowany ?? true) ? new Date() : null,
          isSponsored: true,
          sponsoredLawFirmId: sponsor.id,
        },
      })

      console.log(`✓ Sponsored Post: "${jsonPost.tytul}" → sponsor: ${sponsor.nazwa}`)
    } catch (error) {
      console.error(`Error seeding sponsored blog post:`, error)
    }
  }

  console.log(`Sponsored blog posts seeded successfully! (${sponsoredPosts.length})`)
}

