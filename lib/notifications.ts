import { sendEmail, sendEmailWithTemplate, wrapInBrandLayoutIfNeeded } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { EmailType, NotificationType } from "@prisma/client"

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

  // Szablon z bazy danych (admin/emails) - nadrzędny nad emailHtml
  emailTemplateType?: EmailType
  emailVariables?: Record<string, string>

  // Wymuś wysłanie pomimo ustawień (np. powiadomienia kluczowe/systemowe)
  force?: boolean
}

/**
 * Główny serwis do wysyłania powiadomień.
 * Sprawdza ustawienia użytkownika w bazie (NotificationSettings)
 * i decyduje, czy wysłać in-app, e-mail, czy zignorować.
 */
export async function sendSystemNotification(options: SendNotificationOptions) {
  const { userId, typ, tytul, tresc, linkUrl, emailSubject, emailHtml, emailText, emailTemplateType, emailVariables, force } = options

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
  let shouldSendSMS = false
  const shouldSendInApp = true // In-app wysyłamy prawie zawsze, chyba że dojdzie flaga to blokująca w ustawieniach

  if (settings && !force) {
    // Tryb urlopowy blokuje powiadomienia e-mail/SMS – przepuszczamy wyłącznie
    // krytyczne komunikaty systemowe (SYSTEM). Pozostałe trafiają tylko do in-app.
    if (settings.urlop && typ !== "SYSTEM") {
      shouldSendEmail = false
    } else {
      switch (typ) {
        case "NOWA_OFERTA":
          // Nowe zlecenia/oferty to obsługa klientów – kontrolowane przez obowiązkową zgodę "Kontakt z klientami"
          shouldSendEmail = settings.kontaktKlienci
          break
        case "NOWA_WIADOMOSC":
          // E-mail z przypomnieniem o nowej wiadomości – ustawienie "Przypomnienie o nowych wiadomościach"
          shouldSendEmail = settings.przypomnienieWiadomosci
          break
        case "ZMIANA_STATUSU":
        case "NOWA_KONSULTACJA":
        case "KONSULTACJA_ZAAKCEPTOWANA":
        case "KONSULTACJA_ODRZUCONA":
        case "KONSULTACJA_ZAPLACONA":
        case "KONSULTACJA_ANULOWANA":
          // Statusy spraw/konsultacji – obsługa klientów (obowiązkowe)
          shouldSendEmail = settings.kontaktKlienci
          break
        case "NOWA_OPINIA":
          shouldSendEmail = settings.kluczowe // Opinie wchodzą w kluczowe
          break
        case "MALY_STAN_PUNKTOW":
        case "KONIEC_SUBSKRYPCJI":
          // Punkty/subskrypcja – komunikacja sprzedażowa ("Ciekawe oferty i promocje")
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

    // Powiadomienia SMS o nowej wiadomości – ustawienie "Powiadomienia o nowych wiadomościach (SMS)".
    // Tryb urlopowy blokuje również SMS. Faktyczna wysyłka wymaga integracji z bramką SMS.
    shouldSendSMS = !settings.urlop && typ === "NOWA_WIADOMOSC" && settings.powiadomieniaSmNowa
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
      if (emailTemplateType) {
        emailSent = await sendEmailWithTemplate({
          to: user.email,
          templateType: emailTemplateType,
          variables: emailVariables || {},
          fallbackProvider: emailHtml ? () => ({
            subject: emailSubject || tytul,
            html: emailHtml,
            text: emailText || tresc,
          }) : undefined,
        })
      } else {
        const subject = emailSubject || tytul
        await sendEmail({
          to: user.email,
          subject,
          html: wrapInBrandLayoutIfNeeded(emailHtml || `<p>${tresc}</p>`, subject),
          text: emailText || tresc,
        })
        emailSent = true
      }
    } catch (error) {
      console.error(`Failed to send email notification to ${user.email}:`, error)
    }
  }

  return {
    success: true,
    notification: notificationRecord,
    emailSent,
    shouldSendEmail,
    shouldSendSMS,
  }
}
