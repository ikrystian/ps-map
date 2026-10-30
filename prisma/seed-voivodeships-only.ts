/**
 * Zapisuje TYLKO województwa (idempotentnie).
 * Potrzebne przed importem miast (import_postal_codes.py), który wiąże miasta z województwami.
 *
 * Uruchomienie: bun run db:seed:voivodeships
 */
import { prisma } from '../lib/prisma'
import { seedVoivodeships } from './seeds/voivodeships'

async function main() {
  await seedVoivodeships(prisma)
  console.log('✅ Województwa zseedowane.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Błąd:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
