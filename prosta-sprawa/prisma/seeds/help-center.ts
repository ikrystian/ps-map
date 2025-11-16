import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function seedHelpCenter(prisma: PrismaClient) {
  console.log('Seeding help center categories and questions...')

  const dataPath = join(__dirname, 'data', 'help-center.json')
  const data = JSON.parse(readFileSync(dataPath, 'utf-8'))

  for (const categoryData of data.categories) {
    const { questions, ...categoryFields } = categoryData

    const category = await prisma.helpCategory.upsert({
      where: { slug: categoryFields.slug },
      update: categoryFields,
      create: categoryFields,
    })
    console.log(`✓ Help Category: ${category.nazwa}`)

    if (questions && questions.length > 0) {
      for (const questionData of questions) {
        const question = await prisma.helpQuestion.upsert({
          where: { slug: questionData.slug },
          update: { ...questionData, categoryId: category.id },
          create: { ...questionData, categoryId: category.id },
        })
        console.log(`✓ Help Question: ${question.pytanie}`)
      }
    }
  }

  console.log('Help center data seeded successfully!')
}
