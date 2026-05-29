import { sendEmail } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { NotificationType } from "@prisma/client"

export interface SendNotificationOptions {
  userId: string
  typ: NotificationType
  tytul: string
  tresc: string
  linkUrl?: string

  // Opcjonalne dane do maila, jeśli e-mail ma być inny niż treść in-app
  emailSubject?: string
  emailHtml?: string
  emailText?: string

  // Wymuś wysłanie pomimo ustawień (np. powiadomienia kluczowe/systemowe)
  force?: boolean
}

/**
 * Główny serwis do wysyłania powiadomień.
 * Sprawdza ustawienia użytkownika w bazie (NotificationSettings)
 * i decyduje, czy wysłać in-app, e-mail, czy zignorować.
 */
export async function sendSystemNotification(options: SendNotificationOptions) {
  const { userId, typ, tytul, tresc, linkUrl, emailSubject, emailHtml, emailText, force } = options

  // Pobierz użytkownika i jego ustawienia powiadomień
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { notificationSettings: true },
  })

  if (!user) {
    console.error(`User ${userId} not found for notification`)
    return { success: false, error: "User not found" }
  }

  const settings = user.notificationSettings

  // Mapowanie typu powiadomienia na flagę e-mail
  let shouldSendEmail = force || false
  let shouldSendInApp = true // In-app wysyłamy prawie zawsze, chyba że dojdzie flaga to blokująca w ustawieniach

  if (settings && !force) {
    // Tryb urlopowy ogranicza powiadomienia e-mail (przepuszcza tylko SYSTEM i NOWA_WIADOMOSC)
    if (settings.urlop && typ !== "SYSTEM" && typ !== "NOWA_WIADOMOSC") {
      shouldSendEmail = false
    } else {
      switch (typ) {
        case "NOWA_OFERTA":
          shouldSendEmail = settings.emailNoweOferty
          break
        case "NOWA_WIADOMOSC":
          shouldSendEmail = settings.emailWiadomosci
          break
        case "ZMIANA_STATUSU":
        case "NOWA_KONSULTACJA":
        case "KONSULTACJA_ZAAKCEPTOWANA":
        case "KONSULTACJA_ODRZUCONA":
        case "KONSULTACJA_ZAPLACONA":
        case "KONSULTACJA_ANULOWANA":
          shouldSendEmail = settings.emailStatusy
          break
        case "NOWA_OPINIA":
          shouldSendEmail = settings.kluczowe // Załóżmy, że opinie wchodzą w kluczowe
          break
        case "MALY_STAN_PUNKTOW":
        case "KONIEC_SUBSKRYPCJI":
          shouldSendEmail = settings.ofertPromocje
          break
        case "SYSTEM":
          shouldSendEmail = settings.kluczowe // Systemowe to zawsze kluczowe
          break
        default:
          shouldSendEmail = settings.kluczowe
          break
      }
    }

    // Opcjonalne powiadomienia SMS (do rozbudowy w przyszłości):
    // const shouldSendSMS = (typ === "NOWA_WIADOMOSC" && settings.powiadomieniaSmNowa) || (settings.smsPilne)
  }

  // Jeśli brak settings (co nie powinno się zdarzyć z nowymi userami, ale dla pewności),
  // przyjmujemy domyślnie wysłanie kluczowych/systemowych
  if (!settings && !force) {
     shouldSendEmail = true
  }

  // 1. Zapis do powiadomień in-app
  let notificationRecord = null
  if (shouldSendInApp) {
    notificationRecord = await prisma.notification.create({
      data: {
        userId,
        typ,
        tytul,
        tresc,
        linkUrl: linkUrl || null,
      },
    })
  }

  // 2. Wysłanie E-mail
  let emailSent = false
  if (shouldSendEmail && user.email) {
    try {
      await sendEmail({
        to: user.email,
        subject: emailSubject || tytul,
        html: emailHtml || `<p>${tresc}</p>`,
        text: emailText || tresc,
      })
      emailSent = true
    } catch (error) {
      console.error(`Failed to send email notification to ${user.email}:`, error)
    }
  }

  return {
    success: true,
    notification: notificationRecord,
    emailSent,
    shouldSendEmail,
  }
}
