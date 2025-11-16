import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

interface BlogPostData {
  lawFirmEmail: string
  tytul: string
  slug: string
  tresc: string
  categoryName: string
  tagi: string[]
  obrazekWyrozniajacy?: string
  metaTitle?: string
  metaDescription?: string
  opublikowany: boolean
}

interface BlogPostsData {
  blogPosts: BlogPostData[]
}

export async function seedBlogPosts(prisma: PrismaClient) {
  console.log('Seeding blog posts from JSON file...')

  const jsonPath = path.join(process.cwd(), 'prisma', 'seeds', 'data', 'blog-posts.json')

  if (!fs.existsSync(jsonPath)) {
    console.error(`File not found: ${jsonPath}`)
    return
  }

  const jsonData = fs.readFileSync(jsonPath, 'utf-8')
  const blogPostsData: BlogPostsData = JSON.parse(jsonData)

  for (const postData of blogPostsData.blogPosts) {
    try {
      // Znajdź kancelarię
      const lawFirm = await prisma.lawFirm.findFirst({
        where: {
          user: {
            email: postData.lawFirmEmail,
          },
        },
      })

      if (!lawFirm) {
        console.error(`Law firm with email "${postData.lawFirmEmail}" not found. Skipping...`)
        continue
      }

      // Znajdź kategorię bloga
      let category = await prisma.blogCategory.findFirst({
        where: {
          nazwa: postData.categoryName,
        },
      })

      if (!category) {
        // Stwórz kategorię jeśli nie istnieje
        const slug = postData.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        category = await prisma.blogCategory.create({
          data: {
            nazwa: postData.categoryName,
            slug: slug,
          },
        })
      }

      // Stwórz post bloga
      const blogPost = await prisma.blogPost.create({
        data: {
          lawFirmId: lawFirm.id,
          tytul: postData.tytul,
          slug: postData.slug,
          tresc: postData.tresc,
          categoryId: category.id,
          tagi: JSON.stringify(postData.tagi),
          obrazekWyrozniajacy: postData.obrazekWyrozniajacy,
          metaTitle: postData.metaTitle,
          metaDescription: postData.metaDescription,
          opublikowany: postData.opublikowany,
          dataPublikacji: postData.opublikowany ? new Date() : null,
        },
      })

      console.log(`✓ Blog Post: "${postData.tytul}" for ${lawFirm.nazwa}`)
    } catch (error) {
      console.error(`Error seeding blog post:`, error)
    }
  }

  console.log('Blog posts seeded successfully!')
}
