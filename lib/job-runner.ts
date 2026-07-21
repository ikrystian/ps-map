import { randomUUID } from "crypto"

import { JobRunStatus } from "@prisma/client"

import { prisma } from "./prisma"

/**
 * Identyfikator tej instancji procesu. Pozwala odróżnić, która instancja
 * (przy skalowaniu poziomym) trzyma lock danego zadania.
 */
const INSTANCE_ID = randomUUID()

/**
 * Po tym czasie lock uznajemy za "osierocony" (np. instancja padła w trakcie
 * zadania i nie zwolniła locka) i może zostać przejęty przez inną instancję.
 */
const LOCK_STALE_MS = 15 * 60 * 1000 // 15 minut

export interface RunJobOptions {
  /** Liczba dodatkowych prób po pierwszym niepowodzeniu (domyślnie 0). */
  retries?: number
  /** Bazowe opóźnienie między próbami w ms (backoff liniowy: delay * nr_próby). */
  retryDelayMs?: number
}

export type RunJobResult<T> =
  | { skipped: true }
  | { skipped: false; status: JobRunStatus; result?: T }

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Ponawia operację DB przy przejściowych błędach (timeout, busy lock).
async function withDbRetry<T>(fn: () => Promise<T>, attempts = 4, baseDelayMs = 200): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err: any) {
      const isTransient =
        err?.code === "P1008" || // Operations timed out
        err?.code === "P2024" || // Connection pool timed out
        /timeout|SQLITE_BUSY/i.test(err?.message ?? "")
      if (!isTransient || i === attempts - 1) throw err
      await sleep(baseDelayMs * 2 ** i)
    }
  }
  throw new Error("unreachable")
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.stack || error.message
  return String(error)
}

function safeJson(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  try {
    const json = JSON.stringify(value)
    // Ograniczenie rozmiaru, żeby nie zapisywać ogromnych payloadów do bazy.
    return json.length > 4000 ? `${json.slice(0, 4000)}…` : json
  } catch {
    return undefined
  }
}

/**
 * Próbuje atomowo przejąć lock zadania. Zwraca true, jeśli lock został zdobyty.
 *
 * Lock jest trzymany w bazie (model ScheduledJob), dzięki czemu działa również
 * między wieloma instancjami aplikacji (skalowanie poziome). Transakcja SQLite
 * jest serializowalna, więc tylko jedna instancja zdobędzie lock naraz.
 */
async function acquireLock(jobName: string): Promise<boolean> {
  const now = new Date()
  const staleThreshold = new Date(now.getTime() - LOCK_STALE_MS)

  try {
    return await prisma.$transaction(async (tx) => {
      const job = await tx.scheduledJob.findUnique({ where: { jobName } })

      if (!job) {
        await tx.scheduledJob.create({
          data: { jobName, lockedAt: now, lockedBy: INSTANCE_ID },
        })
        return true
      }

      const isFree = !job.lockedAt || job.lockedAt < staleThreshold
      if (!isFree) return false

      await tx.scheduledJob.update({
        where: { jobName },
        data: { lockedAt: now, lockedBy: INSTANCE_ID },
      })
      return true
    })
  } catch (error) {
    console.error(`[JOB:${jobName}] Failed to acquire lock:`, error)
    return false
  }
}

async function releaseLock(jobName: string, status: JobRunStatus): Promise<void> {
  try {
    await withDbRetry(() =>
      prisma.scheduledJob.update({
        where: { jobName },
        data: {
          lockedAt: null,
          lockedBy: null,
          lastRunAt: new Date(),
          lastStatus: status,
        },
      })
    )
  } catch (error) {
    console.error(`[JOB:${jobName}] Failed to release lock:`, error)
  }
}

/**
 * Uruchamia zadanie w tle z:
 *  - rozproszonym lockiem (bezpieczne przy wielu instancjach / skalowaniu),
 *  - zapisem każdego uruchomienia do bazy (monitoring i diagnostyka),
 *  - mechanizmem ponawiania (retry) z backoffem liniowym.
 *
 * Jeśli inna instancja (lub poprzednie wywołanie tego samego zadania) wciąż je
 * wykonuje, zwraca `{ skipped: true }` i nie robi nic — zastępuje to dawne
 * flagi `isXxxJobRunning` trzymane w pamięci.
 */
export async function runJob<T>(
  jobName: string,
  fn: () => Promise<T>,
  options: RunJobOptions = {}
): Promise<RunJobResult<T>> {
  const { retries = 0, retryDelayMs = 0 } = options

  const acquired = await acquireLock(jobName)
  if (!acquired) {
    return { skipped: true }
  }

  let attempt = 0
  let finalStatus: JobRunStatus = JobRunStatus.FAILED

  try {
    while (attempt <= retries) {
      attempt++

      const run = await prisma.scheduledJobRun.create({
        data: {
          jobName,
          status: JobRunStatus.RUNNING,
          attempt,
          instanceId: INSTANCE_ID,
        },
      })
      const startedAt = Date.now()

      try {
        const result = await fn()

        await withDbRetry(() =>
          prisma.scheduledJobRun.update({
            where: { id: run.id },
            data: {
              status: JobRunStatus.SUCCESS,
              finishedAt: new Date(),
              durationMs: Date.now() - startedAt,
              result: safeJson(result),
            },
          })
        )

        finalStatus = JobRunStatus.SUCCESS
        return { skipped: false, status: JobRunStatus.SUCCESS, result }
      } catch (error) {
        await withDbRetry(() =>
          prisma.scheduledJobRun.update({
            where: { id: run.id },
            data: {
              status: JobRunStatus.FAILED,
              finishedAt: new Date(),
              durationMs: Date.now() - startedAt,
              error: errorMessage(error),
            },
          })
        ).catch((updateErr) => {
          console.error(`[JOB:${jobName}] Failed to record failure status:`, updateErr)
        })

        const willRetry = attempt <= retries
        console.error(
          `[JOB:${jobName}] Attempt ${attempt} failed${willRetry ? ", retrying…" : ""}:`,
          error
        )

        if (willRetry && retryDelayMs > 0) {
          await sleep(retryDelayMs * attempt)
        }
      }
    }

    // Wszystkie próby się nie powiodły.
    return { skipped: false, status: JobRunStatus.FAILED }
  } finally {
    // Zwalnia lock i utrwala czas oraz status ostatniego uruchomienia.
    await releaseLock(jobName, finalStatus)
  }
}

/**
 * Czy zadanie powinno zostać uruchomione teraz na podstawie zapamiętanego
 * w bazie czasu ostatniego uruchomienia. Używane przy starcie serwera do
 * nadrobienia zadań pominiętych w czasie, gdy proces był wyłączony
 * (rozwiązuje problem "restart serwera = utrata stanu zadań").
 */
export async function isJobDue(jobName: string, intervalMs: number): Promise<boolean> {
  try {
    const job = await prisma.scheduledJob.findUnique({ where: { jobName } })
    if (!job?.lastRunAt) return true
    return Date.now() - job.lastRunAt.getTime() >= intervalMs
  } catch (error) {
    console.error(`[JOB:${jobName}] Failed to check schedule:`, error)
    return false
  }
}

/** Domyślny okres przechowywania historii uruchomień zadań (w dniach). */
export const JOB_RUN_RETENTION_DAYS = 30

/**
 * Usuwa stare wpisy historii uruchomień (`ScheduledJobRun`), aby tabela nie
 * rosła w nieskończoność. Zadania uruchamiane co minutę generują ~tysiące
 * wierszy dziennie — bez retencji baza puchnie.
 *
 * Nie usuwa wpisów ze statusem RUNNING (mogą reprezentować trwające zadanie).
 *
 * @returns liczba usuniętych wierszy
 */
export async function cleanupOldJobRuns(
  retentionDays: number = JOB_RUN_RETENTION_DAYS
): Promise<number> {
  const threshold = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)

  const { count } = await prisma.scheduledJobRun.deleteMany({
    where: {
      startedAt: { lt: threshold },
      status: { not: JobRunStatus.RUNNING },
    },
  })

  return count
}
