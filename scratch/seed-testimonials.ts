import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const SAMPLE_TESTIMONIALS = [
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
    quote: "Ekspert wykazała się ogromnym profesjonalizmem przy audycie umów handlowych w naszej firmie. Gorąco polecam wszystkim szukającym pomocy.",
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

async function main() {
  console.log("Seeding homepage testimonials...")

  // Delete existing testimonials first so we don't duplicate
  await prisma.homepageTestimonial.deleteMany()

  for (const t of SAMPLE_TESTIMONIALS) {
    const testimonial = await prisma.homepageTestimonial.create({
      data: t
    })
    console.log(`Created testimonial for: ${testimonial.name}`)
  }

  console.log("Seeding homepage testimonials completed successfully!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
