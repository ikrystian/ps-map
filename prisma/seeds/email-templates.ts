import { PrismaClient } from '@prisma/client'
import { authTemplates } from './email-templates/auth-templates'
import { billingTemplates } from './email-templates/billing-templates'
import { caseTemplates } from './email-templates/case-templates'
import { consultationTemplates } from './email-templates/consultation-templates'
import { notificationTemplates } from './email-templates/notification-templates'

export async function seedEmailTemplates(prisma: PrismaClient) {
  console.log('Seeding email templates...')

  const allTemplates = [
    ...authTemplates,
    ...billingTemplates,
    ...caseTemplates,
    ...consultationTemplates,
    ...notificationTemplates,
  ]

  await prisma.$transaction(
    allTemplates.map((template) =>
      prisma.emailTemplate.upsert({
        where: {
          typ: template.typ,
        },
        update: {
          nazwa: template.nazwa,
          temat: template.temat,
          tresc: template.tresc,
          trescHtml: template.trescHtml,
          zmienne: JSON.stringify(template.zmienne),
          opisZmiennych: JSON.stringify(template.opisZmiennych),
          triggery: JSON.stringify(template.triggery),
          aktywny: true,
        },
        create: {
          typ: template.typ,
          nazwa: template.nazwa,
          temat: template.temat,
          tresc: template.tresc,
          trescHtml: template.trescHtml,
          zmienne: JSON.stringify(template.zmienne),
          opisZmiennych: JSON.stringify(template.opisZmiennych),
          triggery: JSON.stringify(template.triggery),
          aktywny: true,
        },
      })
    )
  )

  console.log('Email templates seeded successfully!')
}
