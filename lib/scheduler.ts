import { sendConsultationReminders, generateUpcomingGoogleMeetLinks } from "./consultations"
import { deactivateExpiredPromotions, renewExpiredPromotions } from "./promotions"
import { calculateRankings } from "./rankings"
import { processScheduledEmails } from "./scheduled-emails"
import { checkExpiredSubscriptions } from "./subscriptions"

// Zabezpieczenia (flagi locków) przed nałożeniem się wywołań w tle
let isPromotionsJobRunning = false
let isSubscriptionsJobRunning = false
let isRemindersJobRunning = false
let isEmailsJobRunning = false
let isRankingsJobRunning = false
let isMeetLinksJobRunning = false

/**
 * Inicjalizuje okresowe zadania w tle wykonywane po stronie serwera aplikacji
 */
export function initScheduler() {
  console.log("[SCHEDULER] Initializing background local cron job scheduler...")

  const isDev = process.env.NODE_ENV === "development"

  // 1. Sprawdzanie i odnawianie/deaktywowanie promocji
  // - W dev: co 1 minutę w celu szybkiego przetestowania wygaśnięcia
  // - W prod: co 1 godzinę
  const promoInterval = isDev ? 60 * 1000 : 60 * 60 * 1000
  setInterval(async () => {
    if (isPromotionsJobRunning) return
    isPromotionsJobRunning = true
    try {
      console.log("[SCHEDULER] Running promotions check...")
      const deactivated = await deactivateExpiredPromotions()
      const renewedResults = await renewExpiredPromotions()
      
      if (deactivated.length > 0 || renewedResults.renewed.length > 0 || renewedResults.failed.length > 0) {
        console.log(`[SCHEDULER] Promotions check complete. Deactivated: ${deactivated.length}, Renewed: ${renewedResults.renewed.length}, Failed: ${renewedResults.failed.length}`)
      }
    } catch (error) {
      console.error("[SCHEDULER] Error in promotions background job:", error)
    } finally {
      isPromotionsJobRunning = false
    }
  }, promoInterval)

  // 2. Wysyłanie zaplanowanych e-maili z kolejki (co 1 minutę)
  setInterval(async () => {
    if (isEmailsJobRunning) return
    isEmailsJobRunning = true
    try {
      const results = await processScheduledEmails()
      if (results.sent > 0 || results.failed > 0) {
        console.log(`[SCHEDULER] Processed scheduled emails. Sent: ${results.sent}, Failed: ${results.failed}`)
      }
    } catch (error) {
      console.error("[SCHEDULER] Error in emails background job:", error)
    } finally {
      isEmailsJobRunning = false
    }
  }, 60 * 1000)

  // 3. Wysyłanie przypomnień o nadchodzących konsultacjach (co 15 minut)
  setInterval(async () => {
    if (isRemindersJobRunning) return
    isRemindersJobRunning = true
    try {
      const count = await sendConsultationReminders()
      if (count > 0) {
        console.log(`[SCHEDULER] Sent ${count} consultation reminders`)
      }
    } catch (error) {
      console.error("[SCHEDULER] Error in reminders background job:", error)
    } finally {
      isRemindersJobRunning = false
    }
  }, 15 * 60 * 1000)

  // 4. Sprawdzanie wygasłych subskrypcji pakietów eksperta (co 1 godzinę)
  setInterval(async () => {
    if (isSubscriptionsJobRunning) return
    isSubscriptionsJobRunning = true
    try {
      console.log("[SCHEDULER] Checking expired subscriptions...")
      const count = await checkExpiredSubscriptions()
      if (count > 0) {
        console.log(`[SCHEDULER] Subscription check complete. Expired subscription packages cleared: ${count}`)
      }
    } catch (error) {
      console.error("[SCHEDULER] Error in subscriptions background job:", error)
    } finally {
      isSubscriptionsJobRunning = false
    }
  }, 60 * 60 * 1000)

  // 5. Przeliczanie popozycji w rankingu (co 12 godzin)
  setInterval(async () => {
    if (isRankingsJobRunning) return
    isRankingsJobRunning = true
    try {
      console.log("[SCHEDULER] Calculating ranking scores...")
      const count = await calculateRankings()
      console.log(`[SCHEDULER] Rankings update complete for ${count} law firms`)
    } catch (error) {
      console.error("[SCHEDULER] Error in rankings background job:", error)
    } finally {
      isRankingsJobRunning = false
    }
  }, 12 * 60 * 60 * 1000)

  // 6. Generowanie linków Google Meet na 5 minut przed konsultacją (co 1 minutę)
  setInterval(async () => {
    if (isMeetLinksJobRunning) return
    isMeetLinksJobRunning = true
    try {
      const count = await generateUpcomingGoogleMeetLinks()
      if (count > 0) {
        console.log(`[SCHEDULER] Generated ${count} upcoming Google Meet links`)
      }
    } catch (error) {
      console.error("[SCHEDULER] Error in Google Meet links generation job:", error)
    } finally {
      isMeetLinksJobRunning = false
    }
  }, 60 * 1000)

  console.log("[SCHEDULER] Background scheduler initialized and running.")
}
