import { PrismaClient } from "@prisma/client"

export const SAMPLE_TESTIMONIALS = [
  {
    name: "Karolina Wiśniewska",
    designation: "Klientka indywidualna, Warszawa",
    quote: "Rozwiązanie mojej sprawy frankowej przebiegło sprawnie i bezstresowo. Współpraca z poleconym adwokatem to była czysta przyjemność.",
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=500",
    active: true,
    order: 0
  },
  {
    name: "Marcin Wesołowski",
    designation: "Przedsiębiorca, Wrocław",
    quote: "Kancelaria wykazała się ogromnym profesjonalizmem przy audycie umów handlowych w naszej firmie. Gorąco polecam wszystkim szukającym pomocy.",
    src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=500",
    active: true,
    order: 1
  },
  {
    name: "Jan Nowacki",
    designation: "Klient biznesowy, Kraków",
    quote: "Szybki kontakt, rzetelne wyjaśnienie trudnych pojęć prawnych i pełne zaangażowanie. Dzięki tej platformie znalazłem idealnego eksperta.",
    src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=500",
    active: true,
    order: 2
  }
]

export async function seedHomepageTestimonials(prisma: PrismaClient) {
  console.log('Seeding homepage testimonials...')

  for (const t of SAMPLE_TESTIMONIALS) {
    await prisma.homepageTestimonial.create({
      data: t
    })
  }

  console.log(`✓ Created ${SAMPLE_TESTIMONIALS.length} homepage testimonials`)
}
