import { sendConsultationReminders, generateUpcomingGoogleMeetLinks } from "./consultations"
import { isJobDue, runJob, RunJobOptions } from "./job-runner"
import { deactivateExpiredPromotions, renewExpiredPromotions } from "./promotions"
import { calculateRankings } from "./rankings"
import { processScheduledEmails } from "./scheduled-emails"
import { checkExpiredSubscriptions } from "./subscriptions"

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE

/**
 * Definicja pojedynczego zadania cyklicznego harmonogramu.
 */
interface JobDefinition {
  name: string
  intervalMs: number
  fn: () => Promise<unknown>
  options?: RunJobOptions
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

  const isDev = process.env.NODE_ENV === "development"

  const jobs: JobDefinition[] = [
    // 1. Sprawdzanie i odnawianie/deaktywowanie promocji
    //    - W dev: co 1 minutę (szybkie testy wygaśnięcia), w prod: co 1 godzinę
    {
      name: "promotions",
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
      intervalMs: MINUTE,
      options: { retries: 1, retryDelayMs: 10 * 1000 },
      fn: async () => {
        const count = await generateUpcomingGoogleMeetLinks()
        return { meetLinksGenerated: count }
      },
    },
  ]

  for (const job of jobs) {
    await registerJob(job)
  }

  console.log(`[SCHEDULER] Background scheduler initialized with ${jobs.length} jobs.`)
}
