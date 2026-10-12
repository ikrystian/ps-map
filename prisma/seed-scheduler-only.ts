/**
 * Seeduje TYLKO scheduler — rejestruje w tabeli ScheduledJob wiersz dla każdego
 * zadania cyklicznego zdefiniowanego w kodzie (getJobDefinitions() z
 * lib/scheduler.ts, te same, które widać w /admin/scheduler).
 *
 * Działa przez upsert po nazwie zadania z pustym `update`: istniejące wiersze
 * (lastRunAt, lastStatus, locki) NIE są ruszane, a historia uruchomień
 * (ScheduledJobRun) nie jest ani tworzona, ani usuwana. Nowe zadania dostają
 * lastRunAt = null, więc scheduler uzna je za zaległe i uruchomi przy starcie
 * serwera — dokładnie tak samo jak wtedy, gdy wiersza w ogóle nie ma.
 *
 * Osierocone wpisy (zadania usunięte z kodu) są tylko raportowane, nie kasowane.
 *
 * Uruchomienie: bun run db:seed:scheduler
 */
import { prisma } from '../lib/prisma'
import { getJobDefinitions } from '../lib/scheduler'

async function main() {
  const definitions = getJobDefinitions()
  const knownNames = new Set(definitions.map((job) => job.name))

  const existing = new Set(
    (await prisma.scheduledJob.findMany({ select: { jobName: true } })).map((job) => job.jobName)
  )

  for (const { name } of definitions) {
    await prisma.scheduledJob.upsert({
      where: { jobName: name },
      create: { jobName: name },
      update: {},
    })
  }

  const created = definitions.filter((job) => !existing.has(job.name)).length
  console.log(
    `✅ Scheduler zseedowany: ${definitions.length} zadań (${created} nowych, ${definitions.length - created} już istniało).`
  )

  const orphans = [...existing].filter((name) => !knownNames.has(name))
  if (orphans.length > 0) {
    console.warn(`⚠️  Wpisy w bazie bez definicji w kodzie (pominięte): ${orphans.join(', ')}`)
  }
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
