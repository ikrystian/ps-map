import { sendConsultationReminders, generateUpcomingGoogleMeetLinks } from "./consultations"
import { cleanupOldJobRuns, isJobDue, runJob, RunJobOptions, RunJobResult } from "./job-runner"
import { deactivateExpiredPromotions, renewExpiredPromotions } from "./promotions"
import { pollPendingKsefInvoices } from "./ksef"
import { calculateRankings } from "./rankings"
import { processScheduledEmails } from "./scheduled-emails"
import { checkExpiredSubscriptions } from "./subscriptions"

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE

/**
 * Definicja pojedynczego zadania cyklicznego harmonogramu.
 */
export interface JobDefinition {
  name: string
  /** Czytelny opis prezentowany w panelu admina. */
  description: string
  intervalMs: number
  fn: () => Promise<unknown>
  options?: RunJobOptions
}

/**
 * Zwraca listę wszystkich zdefiniowanych zadań cyklicznych.
 *
 * Wydzielone do osobnej funkcji, aby:
 *  - `initScheduler` mógł je zarejestrować przy starcie,
 *  - panel admina mógł je wylistować oraz uruchomić ręcznie (`triggerJob`).
 *
 * Interwały w trybie deweloperskim są skracane dla szybszego testowania.
 */
export function getJobDefinitions(): JobDefinition[] {
  const isDev = process.env.NODE_ENV === "development"

  return [
    // 1. Sprawdzanie i odnawianie/deaktywowanie promocji
    //    - W dev: co 1 minutę (szybkie testy wygaśnięcia), w prod: co 1 godzinę
    {
      name: "promotions",
      description: "Deaktywacja i odnawianie wygasłych promocji",
      intervalMs: isDev ? MINUTE : HOUR,
      options: { retries: 2, retryDelayMs: 30 * 1000 },
      fn: async () => {
        const deactivated = await deactivateExpiredPromotions()
        const renewed = await renewExpiredPromotions()
        return {
          deactivated: deactivated.length,
          renewed: renewed.renewed.length,
          failed: renewed.failed.length,
        }
      },
    },

    // 2. Wysyłanie zaplanowanych e-maili z kolejki (co 1 minutę)
    {
      name: "scheduled-emails",
      description: "Wysyłka zaplanowanych e-maili z kolejki",
      intervalMs: MINUTE,
      options: { retries: 1, retryDelayMs: 15 * 1000 },
      fn: async () => {
        const results = await processScheduledEmails()
        return { sent: results.sent, failed: results.failed }
      },
    },

    // 3. Wysyłanie przypomnień o nadchodzących konsultacjach (co 15 minut)
    {
      name: "consultation-reminders",
      description: "Przypomnienia o nadchodzących konsultacjach",
      intervalMs: 15 * MINUTE,
      options: { retries: 2, retryDelayMs: 30 * 1000 },
      fn: async () => {
        const count = await sendConsultationReminders()
        return { remindersSent: count }
      },
    },

    // 4. Sprawdzanie wygasłych subskrypcji pakietów eksperta (co 1 godzinę)
    {
      name: "expired-subscriptions",
      description: "Czyszczenie wygasłych subskrypcji pakietów",
      intervalMs: HOUR,
      options: { retries: 2, retryDelayMs: 60 * 1000 },
      fn: async () => {
        const count = await checkExpiredSubscriptions()
        return { expiredCleared: count }
      },
    },

    // 5. Przeliczanie pozycji w rankingu (co 12 godzin)
    {
      name: "rankings",
      description: "Przeliczanie pozycji kancelarii w rankingu",
      intervalMs: 12 * HOUR,
      options: { retries: 1, retryDelayMs: 60 * 1000 },
      fn: async () => {
        const count = await calculateRankings()
        return { lawFirmsUpdated: count }
      },
    },

    // 6. Generowanie linków Google Meet na ~5 min przed konsultacją (co 1 minutę)
    {
      name: "google-meet-links",
      description: "Generowanie linków Google Meet przed konsultacją",
      intervalMs: MINUTE,
      options: { retries: 1, retryDelayMs: 10 * 1000 },
      fn: async () => {
        const count = await generateUpcomingGoogleMeetLinks()
        return { meetLinksGenerated: count }
      },
    },

    // 7. Sprawdzanie statusu i pobieranie UPO dla faktur wysłanych do KSeF
    //    (status "SENT" → ACCEPTED/REJECTED). W prod co 5 minut, w dev co minutę.
    {
      name: "ksef-upo-poll",
      description: "Sprawdzanie statusu i pobieranie UPO faktur wysłanych do KSeF",
      intervalMs: isDev ? MINUTE : 5 * MINUTE,
      options: { retries: 1, retryDelayMs: 30 * 1000 },
      fn: async () => {
        const result = await pollPendingKsefInvoices()
        return result
      },
    },

    // 8. Czyszczenie starej historii uruchomień zadań (co 24 godziny)
    //    Zapobiega nieograniczonemu wzrostowi tabeli ScheduledJobRun.
    {
      name: "cleanup-job-runs",
      description: "Usuwanie starej historii uruchomień zadań (retencja)",
      intervalMs: 24 * HOUR,
      options: { retries: 1, retryDelayMs: 60 * 1000 },
      fn: async () => {
        const deleted = await cleanupOldJobRuns()
        return { deleted }
      },
    },
  ]
}

/**
 * Rejestruje zadanie:
 *  - przy starcie nadrabia uruchomienie pominięte podczas wyłączenia serwera
 *    (stan czasu ostatniego runu jest utrwalony w bazie),
 *  - następnie uruchamia je cyklicznie z lockiem, monitoringiem i retry
 *    (logika w `runJob`).
 */
async function registerJob({ name, intervalMs, fn, options }: JobDefinition) {
  if (await isJobDue(name, intervalMs)) {
    void runJob(name, fn, options)
  }

  setInterval(() => {
    void runJob(name, fn, options)
  }, intervalMs)
}

/**
 * Ręcznie uruchamia pojedyncze zadanie po nazwie (np. z panelu admina).
 *
 * Korzysta z tej samej ścieżki `runJob` co harmonogram, więc respektuje
 * rozproszony lock — jeśli zadanie akurat trwa, zwróci `{ skipped: true }`.
 *
 * @returns `null`, jeśli zadanie o podanej nazwie nie istnieje.
 */
export async function triggerJob(name: string): Promise<RunJobResult<unknown> | null> {
  const def = getJobDefinitions().find((job) => job.name === name)
  if (!def) return null
  return runJob(def.name, def.fn, def.options)
}

/**
 * Inicjalizuje okresowe zadania w tle wykonywane po stronie serwera aplikacji.
 *
 * W odróżnieniu od poprzedniej wersji (czyste `setInterval` + flagi w pamięci):
 *  - stan ostatniego uruchomienia jest utrwalony w bazie (przetrwa restart),
 *  - każde uruchomienie jest logowane do bazy (monitoring niepowodzeń),
 *  - zadania mają mechanizm ponawiania (retry),
 *  - rozproszony lock zapobiega podwójnemu wykonaniu przy wielu instancjach.
 */
export async function initScheduler() {
  console.log("[SCHEDULER] Initializing persistent background job scheduler...")

  const jobs = getJobDefinitions()

  for (const job of jobs) {
    await registerJob(job)
  }

  console.log(`[SCHEDULER] Background scheduler initialized with ${jobs.length} jobs.`)
}
