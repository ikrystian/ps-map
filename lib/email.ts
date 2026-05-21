/**
 * Email utility functions
 *
 * Konfiguracja zmiennych środowiskowych:
 * EMAIL_SERVER_HOST=smtp.gmail.com
 * EMAIL_SERVER_PORT=587
 * EMAIL_SERVER_USER=your-email@gmail.com
 * EMAIL_SERVER_PASSWORD=your-app-password
 * EMAIL_FROM=noreply@prostaspawa.pl
 */

import { sendSMTPEmail } from './smtp'

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Wysyła email
 *
 * W środowisku development bez konfiguracji SMTP - loguje do konsoli
 * W produkcji lub z konfiguracją SMTP - wysyła prawdziwy email
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
  try {
    // Sprawdź konfigurację SMTP
    const smtpConfigured = !!(
      process.env.EMAIL_SERVER_HOST &&
      process.env.EMAIL_SERVER_USER &&
      process.env.EMAIL_SERVER_PASSWORD &&
      process.env.EMAIL_FROM
    )

    // W środowisku development bez konfiguracji SMTP - tylko loguj do konsoli
    if (process.env.NODE_ENV === 'development' && !smtpConfigured) {
      console.log('='.repeat(80))
      console.log('📧 EMAIL (Development Mode - No SMTP configured)')
      console.log('='.repeat(80))
      console.log(`To: ${to}`)
      console.log(`Subject: ${subject}`)
      console.log(`Text: ${text || html.replace(/<[^>]*>/g, '')}`)
      console.log('='.repeat(80))
      return true
    }

    // Jeśli SMTP jest skonfigurowany - wyślij prawdziwy email
    if (!smtpConfigured) {
      console.error('SMTP not configured. Set EMAIL_SERVER_HOST, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD, EMAIL_FROM')
      return false
    }

    const port = parseInt(process.env.EMAIL_SERVER_PORT || '587')
    const result = await sendSMTPEmail(
      {
        host: process.env.EMAIL_SERVER_HOST!,
        port,
        secure: port === 465,
        auth: {
          user: process.env.EMAIL_SERVER_USER!,
          pass: process.env.EMAIL_SERVER_PASSWORD!,
        },
      },
      {
        from: process.env.EMAIL_FROM!,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      }
    )

    if (result) {
      console.log(`✅ Email sent successfully to: ${to}`)
    } else {
      console.error(`❌ Failed to send email to: ${to}`)
    }

    return result
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

/**
 * Generuje HTML dla emaila resetowania hasła
 */
export function generatePasswordResetEmail(resetUrl: string, userName?: string): { subject: string; html: string; text: string } {
  const subject = 'Resetowanie hasła - ProstaSprawa'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            text-align: center;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ProstaSprawa</div>
          </div>

          <div class="content">
            <h2>Resetowanie hasła</h2>

            ${userName ? `<p>Witaj ${userName},</p>` : '<p>Witaj,</p>'}

            <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w serwisie ProstaSprawa.</p>

            <p>Aby ustawić nowe hasło, kliknij poniższy przycisk:</p>

            <div class="button-container">
              <a href="${resetUrl}" class="button">Zresetuj hasło</a>
            </div>

            <p>Lub skopiuj i wklej poniższy link do przeglądarki:</p>
            <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>

            <div class="warning">
              <strong>⚠️ Ważne:</strong> Link do resetowania hasła jest ważny przez 1 godzinę.
            </div>

            <p>Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość. Twoje hasło pozostanie bez zmian.</p>
          </div>

          <div class="footer">
            <p>Wiadomość została wysłana automatycznie, prosimy na nią nie odpowiadać.</p>
            <p>&copy; ${new Date().getFullYear()} ProstaSprawa. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Resetowanie hasła - ProstaSprawa

${userName ? `Witaj ${userName},` : 'Witaj,'}

Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w serwisie ProstaSprawa.

Aby ustawić nowe hasło, otwórz poniższy link w przeglądarce:
${resetUrl}

WAŻNE: Link do resetowania hasła jest ważny przez 1 godzinę.

Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość. Twoje hasło pozostanie bez zmian.

---
Wiadomość została wysłana automatycznie, prosimy na nią nie odpowiadać.
© ${new Date().getFullYear()} ProstaSprawa. Wszelkie prawa zastrzeżone.
  `.trim()

  return { subject, html, text }
}

/**
 * Generuje HTML dla emaila aktywacji promocji
 */
export function generatePromotionActivatedEmail(
  lawFirmName: string,
  promotionType: string,
  promotionLabel: string,
  startDate: Date,
  endDate: Date,
  cost: number
): { subject: string; html: string; text: string } {
  const subject = `Twoja promocja ${promotionLabel} została aktywowana!`

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          .content {
            margin-bottom: 30px;
          }
          .success-badge {
            background-color: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            font-weight: 500;
            margin-bottom: 20px;
          }
          .info-box {
            background-color: #f3f4f6;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: 500;
            color: #6b7280;
          }
          .info-value {
            color: #111827;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            text-align: center;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ProstaSprawa</div>
          </div>

          <div class="content">
            <div class="success-badge">✓ Promocja aktywna</div>

            <h2>Promocja została pomyślnie aktywowana!</h2>

            <p>Witaj ${lawFirmName},</p>

            <p>Twoja promocja <strong>${promotionLabel}</strong> została właśnie aktywowana i jest już widoczna dla potencjalnych klientów!</p>

            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Typ promocji:</span>
                <span class="info-value">${promotionLabel}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Data rozpoczęcia:</span>
                <span class="info-value">${formatDate(startDate)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Data zakończenia:</span>
                <span class="info-value">${formatDate(endDate)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Koszt:</span>
                <span class="info-value">${cost} punktów</span>
              </div>
            </div>

            <p><strong>Co dalej?</strong></p>
            <ul>
              <li>Twój profil jest teraz wyświetlany z większą widocznością</li>
              <li>Możesz śledzić statystyki promocji w panelu kancelarii</li>
              <li>Promocja odnowi się automatycznie, jeśli włączyłeś automatyczne odnowienie</li>
            </ul>

            <div class="button-container">
              <a href="${process.env.NEXTAUTH_URL}/panel-eksperta/promowanie" class="button">
                Zobacz statystyki promocji
              </a>
            </div>
          </div>

          <div class="footer">
            <p>Wiadomość została wysłana automatycznie, prosimy na nią nie odpowiadać.</p>
            <p>&copy; ${new Date().getFullYear()} ProstaSprawa. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Promocja została pomyślnie aktywowana!

Witaj ${lawFirmName},

Twoja promocja ${promotionLabel} została właśnie aktywowana i jest już widoczna dla potencjalnych klientów!

Szczegóły:
- Typ promocji: ${promotionLabel}
- Data rozpoczęcia: ${formatDate(startDate)}
- Data zakończenia: ${formatDate(endDate)}
- Koszt: ${cost} punktów

Co dalej?
- Twój profil jest teraz wyświetlany z większą widocznością
- Możesz śledzić statystyki promocji w panelu kancelarii
- Promocja odnowi się automatycznie, jeśli włączyłeś automatyczne odnowienie

Zobacz statystyki: ${process.env.NEXTAUTH_URL}/panel-eksperta/promowanie

---
Wiadomość została wysłana automatycznie, prosimy na nią nie odpowiadać.
© ${new Date().getFullYear()} ProstaSprawa. Wszelkie prawa zastrzeżone.
  `.trim()

  return { subject, html, text }
}

/**
 * Generuje HTML dla emaila odnowienia promocji
 */
export function generatePromotionRenewedEmail(
  lawFirmName: string,
  promotionLabel: string,
  newEndDate: Date,
  cost: number,
  remainingPoints: number
): { subject: string; html: string; text: string } {
  const subject = `Twoja promocja ${promotionLabel} została odnowiona`

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          .content {
            margin-bottom: 30px;
          }
          .success-badge {
            background-color: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            font-weight: 500;
            margin-bottom: 20px;
          }
          .info-box {
            background-color: #f3f4f6;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            text-align: center;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ProstaSprawa</div>
          </div>

          <div class="content">
            <div class="success-badge">✓ Promocja odnowiona</div>

            <h2>Promocja została automatycznie odnowiona</h2>

            <p>Witaj ${lawFirmName},</p>

            <p>Twoja promocja <strong>${promotionLabel}</strong> została automatycznie odnowiona zgodnie z ustawieniami.</p>

            <div class="info-box">
              <p><strong>Szczegóły odnowienia:</strong></p>
              <ul>
                <li>Nowa data zakończenia: <strong>${formatDate(newEndDate)}</strong></li>
                <li>Koszt odnowienia: <strong>${cost} punktów</strong></li>
                <li>Pozostałe punkty: <strong>${remainingPoints} punktów</strong></li>
              </ul>
            </div>

            <p>Twoja promocja nadal jest aktywna i działa z pełną mocą!</p>

            <div class="button-container">
              <a href="${process.env.NEXTAUTH_URL}/panel-eksperta/promowanie" class="button">
                Zarządzaj promocjami
              </a>
            </div>
          </div>

          <div class="footer">
            <p>Wiadomość została wysłana automatycznie, prosimy na nią nie odpowiadać.</p>
            <p>&copy; ${new Date().getFullYear()} ProstaSprawa. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Promocja została automatycznie odnowiona

Witaj ${lawFirmName},

Twoja promocja ${promotionLabel} została automatycznie odnowiona zgodnie z ustawieniami.

Szczegóły odnowienia:
- Nowa data zakończenia: ${formatDate(newEndDate)}
- Koszt odnowienia: ${cost} punktów
- Pozostałe punkty: ${remainingPoints} punktów

Twoja promocja nadal jest aktywna i działa z pełną mocą!

Zarządzaj promocjami: ${process.env.NEXTAUTH_URL}/panel-eksperta/promowanie

---
Wiadomość została wysłana automatycznie, prosimy na nią nie odpowiadać.
© ${new Date().getFullYear()} ProstaSprawa. Wszelkie prawa zastrzeżone.
  `.trim()

  return { subject, html, text }
}

/**
 * Generuje HTML dla emaila niepowodzenia odnowienia promocji
 */
export function generatePromotionRenewalFailedEmail(
  lawFirmName: string,
  promotionLabel: string,
  requiredPoints: number,
  currentPoints: number
): { subject: string; html: string; text: string } {
  const subject = `Nie udało się odnowić promocji ${promotionLabel}`

  const pointsNeeded = requiredPoints - currentPoints

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          .content {
            margin-bottom: 30px;
          }
          .warning-badge {
            background-color: #ef4444;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            font-weight: 500;
            margin-bottom: 20px;
          }
          .warning-box {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            text-align: center;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ProstaSprawa</div>
          </div>

          <div class="content">
            <div class="warning-badge">⚠ Niewystarczające punkty</div>

            <h2>Nie udało się odnowić promocji</h2>

            <p>Witaj ${lawFirmName},</p>

            <p>Niestety, nie mogliśmy automatycznie odnowić Twojej promocji <strong>${promotionLabel}</strong> z powodu niewystarczającej liczby punktów.</p>

            <div class="warning-box">
              <p><strong>Szczegóły:</strong></p>
              <ul>
                <li>Wymagane punkty: <strong>${requiredPoints} punktów</strong></li>
                <li>Twoje punkty: <strong>${currentPoints} punktów</strong></li>
                <li>Brakuje: <strong>${pointsNeeded} punktów</strong></li>
              </ul>
            </div>

            <p><strong>Co się stało?</strong></p>
            <ul>
              <li>Promocja została dezaktywowana</li>
              <li>Automatyczne odnowienie zostało wyłączone</li>
              <li>Możesz ją ponownie aktywować po doładowaniu punktów</li>
            </ul>

            <p><strong>Co możesz zrobić?</strong></p>
            <ul>
              <li>Dokup punkty w panelu kancelarii</li>
              <li>Aktywuj promocję ponownie</li>
            </ul>

            <div class="button-container">
              <a href="${process.env.NEXTAUTH_URL}/panel-eksperta/punkty" class="button">
                Dokup punkty
              </a>
            </div>
          </div>

          <div class="footer">
            <p>Wiadomość została wysłana automatycznie, prosimy na nią nie odpowiadać.</p>
            <p>&copy; ${new Date().getFullYear()} ProstaSprawa. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Nie udało się odnowić promocji

Witaj ${lawFirmName},

Niestety, nie mogliśmy automatycznie odnowić Twojej promocji ${promotionLabel} z powodu niewystarczającej liczby punktów.

Szczegóły:
- Wymagane punkty: ${requiredPoints} punktów
- Twoje punkty: ${currentPoints} punktów
- Brakuje: ${pointsNeeded} punktów

Co się stało?
- Promocja została dezaktywowana
- Automatyczne odnowienie zostało wyłączone
- Możesz ją ponownie aktywować po doładowaniu punktów

Co możesz zrobić?
- Dokup punkty w panelu kancelarii
- Aktywuj promocję ponownie

Dokup punkty: ${process.env.NEXTAUTH_URL}/panel-eksperta/punkty

---
Wiadomość została wysłana automatycznie, prosimy na nią nie odpowiadać.
© ${new Date().getFullYear()} ProstaSprawa. Wszelkie prawa zastrzeżone.
  `.trim()

  return { subject, html, text }
}

/**
 * Generuje HTML dla emaila weryfikacji adresu email
 */
export function generateEmailVerificationEmail(
  verificationUrl: string,
  userName?: string,
  isLawFirm?: boolean
): { subject: string; html: string; text: string } {
  const subject = 'Potwierdź swój adres email - ProstaSprawa'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            text-align: center;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
          .info-box {
            background-color: #eff6ff;
            border-left: 4px solid #2563eb;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ProstaSprawa</div>
          </div>

          <div class="content">
            <h2>Witamy w ProstaSprawa!</h2>

            ${userName ? `<p>Witaj ${userName},</p>` : '<p>Witaj,</p>'}

            <p>Dziękujemy za rejestrację ${isLawFirm ? 'kancelarii' : 'konta'} w serwisie ProstaSprawa.</p>

            <p>Aby aktywować swoje konto i rozpocząć korzystanie z platformy, musisz potwierdzić swój adres email.</p>

            <div class="button-container">
              <a href="${verificationUrl}" class="button">Potwierdź adres email</a>
            </div>

            <p>Lub skopiuj i wklej poniższy link do przeglądarki:</p>
            <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>

            <div class="info-box">
              <strong>ℹ️ Ważne informacje:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Link weryfikacyjny jest ważny przez 24 godziny</li>
                <li>Bez potwierdzenia emaila nie będziesz mógł się zalogować</li>
                <li>Jeśli nie rejestrowałeś się w ProstaSprawa, zignoruj tę wiadomość</li>
              </ul>
            </div>

            ${isLawFirm ? `
              <p><strong>Co dalej?</strong></p>
              <p>Po potwierdzeniu emaila będziesz mógł:</p>
              <ul>
                <li>Uzupełnić profil swojej kancelarii</li>
                <li>Przeglądać dostępne sprawy</li>
                <li>Składać oferty klientom</li>
                <li>Aktywować promocje swojego profilu</li>
              </ul>
            ` : `
              <p><strong>Co dalej?</strong></p>
              <p>Po potwierdzeniu emaila będziesz mógł:</p>
              <ul>
                <li>Dodawać sprawy prawne</li>
                <li>Przeglądać oferty kancelarii</li>
                <li>Kontaktować się z prawnikami</li>
                <li>Wystawiać opinie</li>
              </ul>
            `}
          </div>

          <div class="footer">
            <p>Wiadomość została wysłana automatycznie, prosimy na nią nie odpowiadać.</p>
            <p>&copy; ${new Date().getFullYear()} ProstaSprawa. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Witamy w ProstaSprawa!

${userName ? `Witaj ${userName},` : 'Witaj,'}

Dziękujemy za rejestrację ${isLawFirm ? 'kancelarii' : 'konta'} w serwisie ProstaSprawa.

Aby aktywować swoje konto i rozpocząć korzystanie z platformy, musisz potwierdzić swój adres email.

Otwórz poniższy link w przeglądarce:
${verificationUrl}

WAŻNE:
- Link weryfikacyjny jest ważny przez 24 godziny
- Bez potwierdzenia emaila nie będziesz mógł się zalogować
- Jeśli nie rejestrowałeś się w ProstaSprawa, zignoruj tę wiadomość

${isLawFirm ? `
Co dalej?
Po potwierdzeniu emaila będziesz mógł:
- Uzupełnić profil swojej kancelarii
- Przeglądać dostępne sprawy
- Składać oferty klientom
- Aktywować promocje swojego profilu
` : `
Co dalej?
Po potwierdzeniu emaila będziesz mógł:
- Dodawać sprawy prawne
- Przeglądać oferty kancelarii
- Kontaktować się z prawnikami
- Wystawiać opinie
`}

---
Wiadomość została wysłana automatycznie, prosimy na nią nie odpowiadać.
© ${new Date().getFullYear()} ProstaSprawa. Wszelkie prawa zastrzeżone.
  `.trim()

  return { subject, html, text }
}

/**
 * Generuje HTML dla emaila formularza kontaktowego
 */
export function generateContactFormEmail(
  lawFirmName: string,
  lawFirmEmail: string,
  senderName: string,
  senderEmail: string,
  senderPhone: string | null,
  subject: string,
  message: string
): { subject: string; html: string; text: string } {
  const emailSubject = `Nowa wiadomość z formularza kontaktowego - ${senderName}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            background-color: #2563eb;
            color: white;
            padding: 20px;
            border-radius: 8px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            margin-bottom: 30px;
          }
          .info-box {
            background-color: #f3f4f6;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-row {
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: 500;
            color: #6b7280;
            display: inline-block;
            width: 120px;
          }
          .info-value {
            color: #111827;
          }
          .message-box {
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
            white-space: pre-wrap;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            text-align: center;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ProstaSprawa</div>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Nowa wiadomość kontaktowa</p>
          </div>

          <div class="content">
            <h2>Witaj ${lawFirmName}!</h2>

            <p>Otrzymałeś nową wiadomość przez formularz kontaktowy na swoim profilu:</p>

            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Od:</span>
                <span class="info-value">${senderName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value"><a href="mailto:${senderEmail}">${senderEmail}</a></span>
              </div>
              ${senderPhone ? `
              <div class="info-row">
                <span class="info-label">Telefon:</span>
                <span class="info-value"><a href="tel:${senderPhone}">${senderPhone}</a></span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="info-label">Temat:</span>
                <span class="info-value">${subject}</span>
              </div>
            </div>

            <h3>Treść wiadomości:</h3>
            <div class="message-box">${message}</div>

            <p><strong>Pamiętaj:</strong> Szybka odpowiedź zwiększa szansę na pozyskanie klienta!</p>

            <div class="button-container">
              <a href="mailto:${senderEmail}" class="button">
                Odpowiedz na email
              </a>
            </div>
          </div>

          <div class="footer">
            <p>Wiadomość została wysłana automatycznie, prosimy na nią nie odpowiadać.</p>
            <p>&copy; ${new Date().getFullYear()} ProstaSprawa. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Nowa wiadomość z formularza kontaktowego

Witaj ${lawFirmName}!

Otrzymałeś nową wiadomość przez formularz kontaktowy na swoim profilu:

Od: ${senderName}
Email: ${senderEmail}
${senderPhone ? `Telefon: ${senderPhone}` : ''}
Temat: ${subject}

Treść wiadomości:
${message}

Pamiętaj: Szybka odpowiedź zwiększa szansę na pozyskanie klienta!

Odpowiedz na email: ${senderEmail}

---
Wiadomość została wysłana automatycznie, prosimy na nią nie odpowiadać.
© ${new Date().getFullYear()} ProstaSprawa. Wszelkie prawa zastrzeżone.
  `.trim()

  return { subject: emailSubject, html, text }
}

/**
 * Generuje HTML dla emaila weryfikacji subskrypcji newslettera
 */
export function generateNewsletterVerificationEmail(
  verificationUrl: string,
  email: string
): { subject: string; html: string; text: string } {
  const subject = 'Potwierdź swój zapis do newslettera - ProstaSprawa'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1e5e4e;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #1e5e4e;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            text-align: center;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
          .info-box {
            background-color: #f0fdf4;
            border-left: 4px solid #1e5e4e;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ProstaSprawa</div>
          </div>

          <div class="content">
            <h2>Potwierdź subskrypcję newslettera</h2>

            <p>Witaj,</p>

            <p>Dziękujemy za chęć zapisu do newslettera serwisu ProstaSprawa (dla adresu: <strong>${email}</strong>).</p>

            <p>Aby potwierdzić subskrypcję i zacząć otrzymywać porady prawne, nowości oraz przydatne informacje, kliknij poniższy przycisk:</p>

            <div class="button-container">
              <a href="${verificationUrl}" class="button">Potwierdzam subskrypcję</a>
            </div>

            <p>Lub skopiuj i wklej poniższy link do przeglądarki:</p>
            <p style="word-break: break-all; color: #1e5e4e;">${verificationUrl}</p>

            <div class="info-box">
              <strong>ℹ️ Ważne:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Jeśli to nie Ty wpisałeś swój adres email na naszej stronie, zignoruj tę wiadomość.</li>
                <li>Twój adres nie zostanie dodany do bazy dopóki nie klikniesz w powyższy link.</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p>Wiadomość została wysłana automatycznie, prosimy na nią nie odpowiadać.</p>
            <p>&copy; ${new Date().getFullYear()} ProstaSprawa. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Potwierdź subskrypcję newslettera - ProstaSprawa

Dziękujemy za chęć zapisu do newslettera serwisu ProstaSprawa (dla adresu: ${email}).

Aby potwierdzić subskrypcję i zacząć otrzymywać porady prawne, nowości oraz przydatne informacje, przejdź pod poniższy adres:
${verificationUrl}

Jeśli to nie Ty wpisałeś swój adres email na naszej stronie, zignoruj tę wiadomość. Twój adres nie zostanie dodany do bazy dopóki nie potwierdzisz zapisu.

---
Wiadomość została wysłana automatycznie, prosimy na nią nie odpowiadać.
© ${new Date().getFullYear()} ProstaSprawa. Wszelkie prawa zastrzeżone.
  `.trim()

  return { subject, html, text }
}


