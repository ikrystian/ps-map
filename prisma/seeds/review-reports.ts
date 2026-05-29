import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'

const REPORTS_TO_CREATE = 20

const REPORT_REASONS = [
  {
    reason: 'Spam / Reklama',
    descriptions: [
      'Opinia zawiera odnośniki do zewnętrznych serwisów konkurencyjnych.',
      'Treść to ewidentna reklama innej firmy świadczącej usługi prawne.',
      'Kopiowana treść reklamowa wklejana pod wieloma kancelariami.',
    ],
  },
  {
    reason: 'Wulgaryzmy / Obraźliwa treść',
    descriptions: [
      'Opinia zawiera słowa powszechnie uznawane za wulgarne oraz bezpośrednio obraża pełnomocnika prowadzącego sprawę.',
      'Agresywny ton wypowiedzi, naruszenie dóbr osobistych prawnika.',
      'Użycie obraźliwego języka w stosunku do pracowników sekretariatu.',
    ],
  },
  {
    reason: 'Nieprawdziwe informacje',
    descriptions: [
      'Kancelaria twierdzi, że osoba o takim imieniu i nazwisku nigdy nie była ich klientem ani nie prowadzono dla niej żadnej sprawy.',
      'Opisane fakty są całkowicie zmyślone, sprawa o podanej sygnaturze nie istniała w tej kancelarii.',
      'Użytkownik kłamie w kwestii kosztów - umówiona kwota była zupełnie inna i zatwierdzona umową.',
    ],
  },
  {
    reason: 'Konflikt interesów / Konkurencja',
    descriptions: [
      'Podejrzenie, że opinia została wystawiona przez bezpośrednią konkurencję w celu obniżenia ratingu.',
      'Wystawca opinii to były pracownik, z którym kancelaria rozstała się w konflikcie.',
      'Opinia napisana z konta powiązanego z inną lokalną kancelarią adwokacką.',
    ],
  },
  {
    reason: 'Dane osobowe',
    descriptions: [
      'Opinia ujawnia pełne dane osobowe osób trzecich zaangażowanych w proces sądowy.',
      'W treści znajdują się wrażliwe informacje dotyczące tożsamości stron postępowania rozwodowego.',
      'Podano prywatny numer telefonu adwokata bez jego zgody.',
    ],
  },
]

export async function seedReviewReports(prisma: PrismaClient) {
  console.log(`Seeding ${REPORTS_TO_CREATE} review reports...`)

  const allReviews = await prisma.review.findMany()
  const allUsers = await prisma.user.findMany()

  if (allReviews.length === 0 || allUsers.length === 0) {
    console.log('No reviews or users found, skipping review reports seeding.')
    return
  }

  for (let i = 0; i < REPORTS_TO_CREATE; i++) {
    try {
      const review = faker.helpers.arrayElement(allReviews)
      const user = faker.helpers.arrayElement(allUsers)
      const reportReason = faker.helpers.arrayElement(REPORT_REASONS)
      const description = faker.helpers.arrayElement(reportReason.descriptions)

      // Sprawdź, czy takie zgłoszenie już istnieje (unikamy duplikatów tej samej opinii od tego samego użytkownika)
      const existingReport = await prisma.reviewReport.findFirst({
        where: {
          reviewId: review.id,
          userId: user.id,
        },
      })

      if (!existingReport) {
        await prisma.reviewReport.create({
          data: {
            reviewId: review.id,
            userId: user.id,
            reason: reportReason.reason,
            description: `${description} (Zgłoszone automatycznie przez system weryfikacji opinii).`,
          },
        })
        console.log(`✓ Reported Review: "${review.tytulOpinii}" by User: ${user.email} (Reason: ${reportReason.reason})`)
      }
    } catch (error) {
      console.error('Error seeding review report:', error)
    }
  }

  console.log('Review reports seeded successfully!')
}
