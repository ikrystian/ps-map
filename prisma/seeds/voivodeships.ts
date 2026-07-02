import { PrismaClient } from '@prisma/client'

export async function seedVoivodeships(prisma: PrismaClient) {
  console.log('Seeding voivodeships...')

  const voivodeships = [
    'Dolnośląskie',
    'Kujawsko-Pomorskie',
    'Lubelskie',
    'Lubuskie',
    'Łódzkie',
    'Małopolskie',
    'Mazowieckie',
    'Opolskie',
    'Podkarpackie',
    'Podlaskie',
    'Pomorskie',
    'Śląskie',
    'Świętokrzyskie',
    'Warmińsko-Mazurskie',
    'Wielkopolskie',
    'Zachodniopomorskie',
  ]

  await prisma.$transaction(
    voivodeships.map((name) =>
      prisma.voivodeship.upsert({
        where: { nazwa: name },
        update: {},
        create: { nazwa: name, slug: name.toLowerCase().replace(/\s/g, '-') },
      })
    )
  )

  console.log('Voivodeships seeded successfully!')
}
