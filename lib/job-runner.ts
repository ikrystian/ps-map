import { randomUUID } from "crypto"

import { JobRunStatus, LogLevel } from "@prisma/client"

import { sendSystemNotification } from "./notifications"
import { prisma } from "./prisma"
import { emitNewNotification } from "./socket"

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

/**
 * Pamięć podręczna czasu wysłania ostatniego powiadomienia o błędzie dla danego zadania.
 * Zapobiega zalewaniu administratorów powiadomieniami przy częstych, powtarzających się błędach.
 */
const lastFailureNotificationTime = new Map<string, number>()

/** Minimalny odstęp między kolejnymi powiadomieniami o powtarzającym się błędzie tego samego zadania (15 minut). */
export const NOTIFICATION_COOLDOWN_MS = 15 * 60 * 1000

export interface RunJobOptions {
  /** Liczba dodatkowych prób po pierwszym niepowodzeniu (domyślnie 0). */
  retries?: number
  /** Bazowe opóźnienie między próbami w ms (backoff liniowy: delay * nr_próby). */
  retryDelayMs?: number
  /** Wymusza wysłanie powiadomienia do admina nawet w trakcie trwania cooldownu (np. przy ręcznym uruchomieniu). */
  forceNotify?: boolean
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
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string } | null | undefined
      const isTransient =
        errorObj?.code === "P1008" || // Operations timed out
        errorObj?.code === "P2024" || // Connection pool timed out
        /timeout|SQLITE_BUSY/i.test(errorObj?.message ?? "")
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

function onJobSuccess(jobName: string) {
  // Jeśli zadanie zakończyło się sukcesem, czyścimy czas ostatniego powiadomienia o błędzie.
  // Dzięki temu kolejny ewentualny błąd wyśle powiadomienie natychmiast bez czekania na cooldown.
  lastFailureNotificationTime.delete(jobName)
}

export interface HandleJobFailureParams {
  jobName: string
  error: unknown
  attempts: number
  durationMs: number
  forceNotify?: boolean
}

/**
 * Zapisuje błąd wykonania zadania harmonogramu w SystemLog (/admin/logs)
 * oraz powiadamia zalogowanych administratorów w panelu admina.
 */
export async function handleJobFailure({
  jobName,
  error,
  attempts,
  durationMs,
  forceNotify = false,
}: HandleJobFailureParams): Promise<void> {
  const errorDetails = errorMessage(error)
  const shortError =
    error instanceof Error ? error.message : typeof error === "string" ? error : "Nieznany błąd zadania"

  // 1. Zapis błędu do SystemLog (będzie widoczny w /admin/logs z poziomem ERROR)
  try {
    await prisma.systemLog.create({
      data: {
        level: LogLevel.ERROR,
        action: "SCHEDULER_JOB_ERROR",
        message: `Błąd zadania harmonogramu '${jobName}': ${shortError}`,
        metadata: JSON.stringify({
          jobName,
          attempts,
          durationMs,
          error: errorDetails,
          instanceId: INSTANCE_ID,
        }),
      },
    })
  } catch (logError) {
    console.error(`[JOB:${jobName}] Nie udało się zapisać błędu do SystemLog:`, logError)
  }

  // 2. Wysłanie powiadomienia do administratorów
  try {
    const now = Date.now()
    const lastNotified = lastFailureNotificationTime.get(jobName) || 0

    // Ochrona przed spamem: jeśli zadanie cykliczne powtarza się często i ciągle zawodzi,
    // ograniczamy częstość powiadomień do jednego na NOTIFICATION_COOLDOWN_MS (chyba że wymuszono ręcznie)
    if (!forceNotify && now - lastNotified < NOTIFICATION_COOLDOWN_MS) {
      console.log(
        `[JOB:${jobName}] Powiadomienie do admina pominięte (cooldown, ostatnie wysłane ${Math.round(
          (now - lastNotified) / 1000
        )}s temu)`
      )
      return
    }

    lastFailureNotificationTime.set(jobName, now)

    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
        status: "ACTIVE",
      },
      select: { id: true, email: true },
    })

    if (admins.length === 0) {
      console.warn(`[JOB:${jobName}] Brak aktywnych administratorów do powiadomienia o błędzie`)
      return
    }

    const title = `Błąd harmonogramu: ${jobName}`
    const content = `Zadanie "${jobName}" zakończyło się błędem (${attempts} ${
      attempts === 1 ? "próba" : "próby"
    }): ${shortError}`

    for (const admin of admins) {
      try {
        const { notification } = await sendSystemNotification({
          userId: admin.id,
          typ: "SYSTEM",
          tytul: title,
          tresc: content,
          linkUrl: "/admin/scheduler",
          force: true,
        })

        if (notification) {
          await emitNewNotification(admin.id, notification)
        }
      } catch (adminNotifErr) {
        console.error(
          `[JOB:${jobName}] Nie udało się wysłać powiadomienia do admina ${admin.id}:`,
          adminNotifErr
        )
      }
    }
  } catch (notifError) {
    console.error(`[JOB:${jobName}] Błąd podczas wysyłania powiadomień do adminów:`, notifError)
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
  let lastError: unknown = null
  const totalStartedAt = Date.now()

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
        onJobSuccess(jobName)
        return { skipped: false, status: JobRunStatus.SUCCESS, result }
      } catch (error) {
        lastError = error
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

    // Wszystkie próby się nie powiodły — rejestrujemy błąd w logach systemowych i powiadamiamy admina.
    await handleJobFailure({
      jobName,
      error: lastError,
      attempts: attempt,
      durationMs: Date.now() - totalStartedAt,
      forceNotify: options.forceNotify,
    })

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
