/**
 * Email utility functions
 *
 * Konfiguracja zmiennych środowiskowych:
 * EMAIL_SERVER_HOST=smtp.gmail.com
 * EMAIL_SERVER_PORT=587
 * EMAIL_SERVER_USER=your-email@gmail.com
 * EMAIL_SERVER_PASSWORD=your-app-password
 * EMAIL_FROM=noreply@prostasprawa.pl
 */

import { EmailLogStatus, EmailType } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { sendSMTPEmail } from './smtp'

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
  templateType?: string
  variables?: Record<string, string>
}

/**
 * Pomocnicza funkcja do owijania HTML w szatę graficzną ProstaSprawa, jeśli nie jest już owinięty
 */
export function wrapInBrandLayoutIfNeeded(html: string, preheader: string = ""): string {
  if (html.includes('<html') || html.includes('<!DOCTYPE html') || html.includes('email-container')) {
    return html
  }
  return getBrandEmailLayout(html, preheader)
}

/**
 * Wysyła email przy użyciu szablonu z bazy danych
 */
export async function sendEmailWithTemplate({
  to,
  templateType,
  variables,
  fallbackProvider,
}: {
  to: string
  templateType: EmailType
  variables: Record<string, string>
  fallbackProvider?: () => { subject: string; html: string; text: string }
}): Promise<boolean> {
  try {
    const { prisma } = await import('@/lib/prisma')
    const template = await prisma.emailTemplate.findUnique({
      where: { typ: templateType },
    })

    let subject: string
    let html: string
    let text: string

    if (template && template.aktywny) {
      subject = template.temat
      html = template.trescHtml || template.tresc
      text = template.tresc

      // Zastąp zmienne
      Object.entries(variables).forEach(([key, value]) => {
        // Ucieknij znaki specjalne w kluczu zmiennej dla RexExp
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(escapedKey, 'g')

        subject = subject.replace(regex, value || '')
        html = html.replace(regex, value || '')
        text = text.replace(regex, value || '')
      })

      // Automatycznie owiń w szatę graficzną ProstaSprawa
      html = wrapInBrandLayoutIfNeeded(html, subject)
    } else if (fallbackProvider) {
      const fallback = fallbackProvider()
      subject = fallback.subject
      html = fallback.html
      text = fallback.text
    } else {
      console.error(`Template ${templateType} not found in database and no fallback provided`)
      return false
    }

    return await sendEmail({ to, subject, html, text, templateType, variables })
  } catch (error) {
    console.error(`Error sending templated email (${templateType}):`, error)
    return false
  }
}

/**
 * Wysyła email
 *
 * W środowisku development bez konfiguracji SMTP - loguje do konsoli
 * W produkcji lub z konfiguracją SMTP - wysyła prawdziwy email
 */
export async function sendEmail({ to, subject, html, text, templateType, variables }: SendEmailParams): Promise<boolean> {
  let smtpLog = ''
  let errorMessage: string | undefined = undefined
  let status: EmailLogStatus = EmailLogStatus.FAILED

  try {
    // Pobierz konfigurację SMTP z bazy danych z fallbackiem do zmiennych środowiskowych
    const { prisma } = await import('@/lib/prisma')
    const dbSettings = await prisma.settings.findMany({
      where: {
        key: {
          in: [
            'emailServerHost',
            'emailServerPort',
            'emailServerUser',
            'emailServerPassword',
            'emailFrom',
            'emailFromName',
            'emailLogToMails',
          ],
        },
      },
    })
    const settingsMap = new Map(dbSettings.map((s) => [s.key, s.value]))

    const host = settingsMap.get('emailServerHost') || process.env.EMAIL_SERVER_HOST
    const portStr = settingsMap.get('emailServerPort') || process.env.EMAIL_SERVER_PORT || '587'
    const user = settingsMap.get('emailServerUser') || process.env.EMAIL_SERVER_USER
    const pass = settingsMap.get('emailServerPassword') || process.env.EMAIL_SERVER_PASSWORD
    const fromAddress = settingsMap.get('emailFrom') || process.env.EMAIL_FROM
    const fromName = settingsMap.get('emailFromName') || process.env.EMAIL_FROM_NAME || ''
    const from = fromAddress
      ? fromName
        ? `${fromName} <${fromAddress}>`
        : fromAddress
      : undefined

    const smtpConfigured = !!(host && user && pass && from)
    const nodeEnv = process.env.NODE_ENV as string
    const isDev = nodeEnv !== 'production' && nodeEnv !== 'stage'
    const emailLogToMailsSetting = settingsMap.get('emailLogToMails')
    const shouldLogToMails = emailLogToMailsSetting ? emailLogToMailsSetting === 'true' : isDev

    // Jeżeli włączona jest opcja podglądu (lub domyślnie w trybie dev),
    // NIE wysyłamy prawdziwych maili. Zamiast tego logujemy je do konsoli oraz do bazy (EmailLog),
    // skąd można je podejrzeć na publicznej stronie /mails.
    if (shouldLogToMails) {
      console.log('='.repeat(80))
      console.log('📧 EMAIL (tryb podglądu - nie wysyłam, tylko loguję)')
      console.log('='.repeat(80))
      console.log(`To: ${to}`)
      console.log(`Subject: ${subject}`)
      console.log(`Text: ${text || html.replace(/<[^>]*>/g, '')}`)
      console.log('Podgląd wszystkich maili: /mails')
      console.log('='.repeat(80))

      smtpLog = smtpConfigured
        ? 'Włączony tryb podglądu: pominięto wysyłkę SMTP. Email zapisany do logów (podgląd na /mails).'
        : 'Włączony tryb podglądu: SMTP nie skonfigurowany. Email zapisany do logów (podgląd na /mails).'
      status = EmailLogStatus.SUCCESS
      return true
    }

    // Jeśli SMTP jest skonfigurowany - wyślij prawdziwy email
    if (!smtpConfigured) {
      errorMessage = 'SMTP not configured. Set SMTP settings in Admin Panel settings or environment variables.'
      console.error(errorMessage)
      return false
    }

    const port = parseInt(portStr)
    const result = await sendSMTPEmail(
      {
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      },
      {
        from,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      }
    )

    smtpLog = result.log || ''
    if (result.success) {
      console.log(`✅ Email sent successfully to: ${to}`)
      status = EmailLogStatus.SUCCESS
    } else {
      errorMessage = result.error
      console.error(`❌ Failed to send email to: ${to}. Error: ${errorMessage}`)
      status = EmailLogStatus.FAILED
    }

    return result.success
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error sending email:', error)
    return false
  } finally {
    // Zapisz log do bazy danych
    try {
      const { prisma } = await import('@/lib/prisma')
      await prisma.emailLog.create({
        data: {
          to,
          subject,
          content: text || html.replace(/<[^>]*>/g, ''),
          html,
          templateType,
          variables: variables ? JSON.stringify(variables) : null,
          status,
          errorMessage,
          smtpLog,
        },
      })
    } catch (logError) {
      console.error('Error creating email log:', logError)
    }
  }
}

export function getBrandEmailLayout(
  contentHtml: string,
  preheaderText: string = ""
): string {
  try {
    const templatePath = path.join(process.cwd(), 'prosta_sprawa_email.html')
    if (fs.existsSync(templatePath)) {
      const template = fs.readFileSync(templatePath, 'utf8')

      // Wstawianie treści w miejsce <!-- content here-->
      let finalHtml = template.replace('<!-- content here-->', contentHtml)

      // Dynamiczne podmienianie linków w szablonie prosta_sprawa_email.html dla poprawności działania systemu
      const domainUrl = process.env.URL || 'https://ps-dev.com.pl/'

      // Podmień logo i link "Client Portal" na rzeczywiste linki
      finalHtml = finalHtml.replace('href="#" class="logo"', `href="${domainUrl}" class="logo"`)
      finalHtml = finalHtml.replace('href="#" class="header-link"', `href="${domainUrl}/panel-klienta" class="header-link"`)

      // Podmień linki w stopce na poprawne URL-e systemowe
      finalHtml = finalHtml.replace('href="#">Terms of Service</a>', `href="${domainUrl}/terms">Terms of Service</a>`)
      finalHtml = finalHtml.replace('href="#">Privacy Policy</a>', `href="${domainUrl}/privacy">Privacy Policy</a>`)
      finalHtml = finalHtml.replace('href="#">Cookie Settings</a>', `href="${domainUrl}/cookies">Ciasteczka</a>`)
      finalHtml = finalHtml.replace('src="', `src="${domainUrl}`)
      // Podmień ikony w stopce na poprawne odnośniki
      finalHtml = finalHtml.replace('href="#" class="footer-icon" aria-label="Website"', `href="${domainUrl}" class="footer-icon" aria-label="Website"`)
      finalHtml = finalHtml.replace('href="#" class="footer-icon" aria-label="Email"', `href="mailto:kontakt@prostasprawa.pl" class="footer-icon" aria-label="Email"`)

      // Dodaj preheader jeśli jest podany
      if (preheaderText) {
        const preheaderHtml = `<div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">${preheaderText}</div>`
        finalHtml = finalHtml.replace('<body>', `<body>\n  ${preheaderHtml}`)
      }

      // Aktualizacja roku w stopce
      const currentYear = new Date().getFullYear().toString()
      finalHtml = finalHtml.replace('© 2026 Prosta Sprawa', `© ${currentYear} Prosta Sprawa`)

      return finalHtml
    }
  } catch (err) {
    console.error('Błąd podczas ładowania szablonu prosta_sprawa_email.html:', err)
  }

  return `
    <!DOCTYPE html>
    <html lang="pl">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ProstaSprawa</title>
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
        <style>
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          table { border-collapse: collapse !important; }
          body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
          
          a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
          
          @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .content-padding { padding: 25px 20px !important; }
            .btn { display: block !important; width: auto !important; margin-left: 0 !important; margin-right: 0 !important; text-align: center !important; }
          }
        </style>
      </head>
      <body style="background-color: #0c0c0c; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; margin: 0; padding: 0; width: 100%; -webkit-font-smoothing: antialiased;">
        <!-- Preheader text for inbox preview -->
        ${preheaderText ? `<div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">${preheaderText}</div>` : ""}
        
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c0c0c; table-layout: fixed;">
          <tr>
            <td align="center" valign="top" style="padding: 40px 10px 40px 10px;">
              <!--[if (gte mso 9)|(IE)]>
              <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                <tr>
                  <td align="center" valign="top" width="600">
              <![endif]-->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; background-color: #121212; border: 1px solid #222222; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                
                <!-- Brand Header -->
                <tr>
                  <td align="center" valign="top" style="background-color: #121212; padding: 30px 40px 10px 40px;" class="content-padding">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <!-- Left side: Brand Logo -->
                        <td align="left" valign="middle" style="font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 0.5px;">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <!-- Brand Icon -->
                              <td style="padding-right: 12px; vertical-align: middle;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
                                  <path d="M3 17h6l3-3H6l-3 3zm5-5h6l3-3H11l-3 3zm5-5h6l3-3H16l-3 3z" fill="#00b49e"/>
                                </svg>
                              </td>
                              <td style="vertical-align: middle; line-height: 24px;">
                                Prosta<span style="color: #00b49e; font-weight: 300;">Sprawa</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <!-- Right side: Client Portal link -->
                        <td align="right" valign="middle" style="font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 13px; font-weight: 600;">
                          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:4000'}/panel-klienta" style="color: #00b49e; text-decoration: none;">Client Portal &rarr;</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
 
                <!-- Content Area -->
                <tr>
                  <td align="left" valign="top" style="padding: 40px; background-image: radial-gradient(circle at center, rgba(0, 180, 158, 0.08) 0%, rgba(18, 18, 18, 0) 70%); background-repeat: no-repeat; background-position: center;" class="content-padding">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="left" style="font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; line-height: 1.625; color: #e5e5e5;">
                          ${contentHtml}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
 
                <!-- Divider -->
                <tr>
                  <td align="center" style="padding: 0 40px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="border-top: 1px solid #222222; line-height: 1px; font-size: 1px;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
 
                <!-- Premium Footer -->
                <tr>
                  <td align="center" valign="top" style="padding: 40px;" class="content-padding">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <!-- Brand Title in Serif -->
                      <tr>
                        <td align="center" style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 20px; font-weight: bold; color: #ffffff; padding-bottom: 16px;">
                          Prosta Sprawa
                        </td>
                      </tr>
                      <!-- Terms / Privacy / Cookies Links -->
                      <tr>
                        <td align="center" style="font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif; font-size: 12px; font-weight: 500; color: #a3a3a3; padding-bottom: 20px;">
                          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:4000'}/terms" style="color: #a3a3a3; text-decoration: none; margin: 0 8px;"></a>
                          <span style="color: #404040;">&bull;</span>
                          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:4000'}/privacy" style="color: #a3a3a3; text-decoration: none; margin: 0 8px;">Privacy Policy</a>
                          <span style="color: #404040;">&bull;</span>
                          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:4000'}/cookies" style="color: #a3a3a3; text-decoration: none; margin: 0 8px;">Cookie Settings</a>
                        </td>
                      </tr>
                      <!-- Copyright text -->
                      <tr>
                        <td align="center" style="font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif; font-size: 11px; line-height: 1.6; color: #737373; padding-bottom: 20px; text-align: center;">
                          &copy; ${new Date().getFullYear()} Prosta Sprawa. 
                        </td>
                      </tr>
                      <!-- Social/Utility Icons (Globe and Envelope) -->
                      <tr>
                        <td align="center">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <!-- Globe icon -->
                              <td style="padding: 0 10px;">
                                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:4000'}" style="color: #a3a3a3; text-decoration: none;">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="2" y1="12" x2="22" y2="12"></line>
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                  </svg>
                                </a>
                              </td>
                              <!-- Envelope icon -->
                              <td style="padding: 0 10px;">
                                <a href="mailto:kontakt@prostasprawa.pl" style="color: #a3a3a3; text-decoration: none;">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                  </svg>
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
 
              </table>
              <!--[if (gte mso 9)|(IE)]>
                  </td>
                </tr>
              </table>
              <![endif]-->
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

/**
 * Generuje HTML dla emaila resetowania hasła
 */
export function generatePasswordResetEmail(resetUrl: string, userName?: string): { subject: string; html: string; text: string } {
  const subject = 'Resetowanie hasła - ProstaSprawa'
  const greeting = userName ? `Witaj ${userName},` : 'Witaj,'

  const contentHtml = `
    <h2 style="font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Resetowanie hasła</h2>
    <p style="margin: 0 0 16px 0;">${greeting}</p>
    <p style="margin: 0 0 16px 0;">Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w serwisie ProstaSprawa.</p>
    <p style="margin: 0 0 24px 0;">Aby ustawić nowe hasło, kliknij poniższy przycisk:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Zresetuj hasło</a>
    </div>
    <div style="background-color: #122421; border-left: 4px solid #00b49e; border-radius: 4px; padding: 16px; margin: 24px 0;">
      <strong style="color: #ffffff; font-weight: 600; display: block; margin-bottom: 4px;">⚠️ Ważne:</strong>
      <span style="font-size: 14px; color: #d4d4d4;">Link do resetowania hasła jest ważny przez 1 godzinę.</span>
    </div>
    <p style="margin: 20px 0 0 0; font-size: 14px; color: #a3a3a3;">Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość. Twoje hasło pozostanie bez zmian.</p>
    <p style="margin: 20px 0 0 0; font-size: 12px; color: #a3a3a3; word-break: break-all;">Gdyby przycisk nie działał, skopiuj poniższy link i wklej go do przeglądarki:<br><a href="${resetUrl}" style="color: #00b49e; text-decoration: underline;">${resetUrl}</a></p>
  `

  const html = getBrandEmailLayout(contentHtml, "Instrukcja resetowania hasła do konta ProstaSprawa.")

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

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <span style="background-color: #e6f4ea; color: #137333; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 11px; font-weight: 600; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;">✓ Promocja aktywna</span>
    </div>
    
    <h2 style="font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; font-size: 22px; font-weight: bold; color: #3d3929; margin-top: 0; margin-bottom: 16px;">Promocja została pomyślnie aktywowana!</h2>
    <p style="margin: 0 0 16px 0;">Witaj ${lawFirmName},</p>
    <p style="margin: 0 0 20px 0;">Twoja promocja <strong>${promotionLabel}</strong> została właśnie aktywowana i jest już widoczna dla potencjalnych klientów!</p>

    <div style="background-color: #faf9f5; border: 1px solid #dad9d4; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; font-size: 16px; font-weight: 600; color: #3d3929; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #dad9d4; padding-bottom: 8px;">Szczegóły aktywacji:</h3>
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #83827d; font-weight: 500;" width="40%">Typ promocji:</td>
          <td style="padding: 6px 0; font-size: 14px; color: #3d3929; font-weight: 600;" width="60%">${promotionLabel}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #83827d; font-weight: 500; border-top: 1px solid #ede9de;">Rozpoczęcie:</td>
          <td style="padding: 6px 0; font-size: 14px; color: #3d3929; font-weight: 600; border-top: 1px solid #ede9de;">${formatDate(startDate)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #83827d; font-weight: 500; border-top: 1px solid #ede9de;">Zakończenie:</td>
          <td style="padding: 6px 0; font-size: 14px; color: #3d3929; font-weight: 600; border-top: 1px solid #ede9de;">${formatDate(endDate)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #83827d; font-weight: 500; border-top: 1px solid #ede9de;">Koszt:</td>
          <td style="padding: 6px 0; font-size: 14px; color: #c96442; font-weight: 600; border-top: 1px solid #ede9de;">${cost} punktów</td>
        </tr>
      </table>
    </div>

    <h3 style="font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; font-size: 18px; font-weight: 600; color: #3d3929; margin-top: 24px; margin-bottom: 12px;">Co dalej?</h3>
    <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #535146; line-height: 1.6;">
      <li style="margin-bottom: 8px;">Twój profil jest teraz wyświetlany z większą widocznością w wynikach wyszukiwania.</li>
      <li style="margin-bottom: 8px;">Możesz śledzić statystyki promocji i wyświetleń w panelu eksperta.</li>
      <li style="margin-bottom: 0;">Promocja odnowi się automatycznie, jeśli włączyłeś opcję automatycznego odnowienia.</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXTAUTH_URL}/panel-eksperta/promowanie" class="btn" style="display: inline-block; background-color: #c96442; color: #ffffff !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(201, 100, 66, 0.2); text-align: center;">Zobacz statystyki promocji</a>
    </div>
  `

  const html = getBrandEmailLayout(contentHtml, `Potwierdzenie aktywacji promocji ${promotionLabel} w ProstaSprawa.`)

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
- Możesz śledzić statystyki promocji w panelu eksperta
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

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <span style="background-color: #e6f4ea; color: #137333; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 11px; font-weight: 600; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;">✓ Promocja odnowiona</span>
    </div>
    
    <h2 style="font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; font-size: 22px; font-weight: bold; color: #3d3929; margin-top: 0; margin-bottom: 16px;">Promocja została automatycznie odnowiona</h2>
    <p style="margin: 0 0 16px 0;">Witaj ${lawFirmName},</p>
    <p style="margin: 0 0 20px 0;">Twoja promocja <strong>${promotionLabel}</strong> została automatycznie odnowiona zgodnie z Twoimi ustawieniami.</p>

    <div style="background-color: #faf9f5; border: 1px solid #dad9d4; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; font-size: 16px; font-weight: 600; color: #3d3929; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #dad9d4; padding-bottom: 8px;">Szczegóły odnowienia:</h3>
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #83827d; font-weight: 500;" width="45%">Nowa data zakończenia:</td>
          <td style="padding: 6px 0; font-size: 14px; color: #3d3929; font-weight: 600;" width="55%">${formatDate(newEndDate)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #83827d; font-weight: 500; border-top: 1px solid #ede9de;">Koszt odnowienia:</td>
          <td style="padding: 6px 0; font-size: 14px; color: #c96442; font-weight: 600; border-top: 1px solid #ede9de;">${cost} punktów</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #83827d; font-weight: 500; border-top: 1px solid #ede9de;">Pozostałe punkty:</td>
          <td style="padding: 6px 0; font-size: 14px; color: #3d3929; font-weight: 600; border-top: 1px solid #ede9de;">${remainingPoints} punktów</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0 0 24px 0; color: #535146;">Twoja promocja nadal jest aktivna i działa z pełną mocą, pomagając pozyskiwać nowych klientów!</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXTAUTH_URL}/panel-eksperta/promowanie" class="btn" style="display: inline-block; background-color: #c96442; color: #ffffff !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(201, 100, 66, 0.2); text-align: center;">Zarządzaj promocjami</a>
    </div>
  `

  const html = getBrandEmailLayout(contentHtml, `Promocja ${promotionLabel} została pomyślnie przedłużona w ProstaSprawa.`)

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

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <span style="background-color: #fce8e6; color: #c5221f; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 11px; font-weight: 600; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;">⚠️ Niewystarczające punkty</span>
    </div>
    
    <h2 style="font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; font-size: 22px; font-weight: bold; color: #3d3929; margin-top: 0; margin-bottom: 16px;">Nie udało się odnowić promocji</h2>
    <p style="margin: 0 0 16px 0;">Witaj ${lawFirmName},</p>
    <p style="margin: 0 0 20px 0;">Niestety, nie mogliśmy automatycznie odnowić Twojej promocji <strong>${promotionLabel}</strong> z powodu niewystarczającej liczby punktów na Twoim koncie.</p>

    <div style="background-color: #faf9f5; border: 1px solid #dad9d4; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; font-size: 16px; font-weight: 600; color: #3d3929; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #dad9d4; padding-bottom: 8px;">Szczegóły bilansu:</h3>
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #83827d; font-weight: 500;" width="45%">Wymagane punkty:</td>
          <td style="padding: 6px 0; font-size: 14px; color: #3d3929; font-weight: 600;" width="55%">${requiredPoints} punktów</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #83827d; font-weight: 500; border-top: 1px solid #ede9de;">Stan Twojego konta:</td>
          <td style="padding: 6px 0; font-size: 14px; color: #c96442; font-weight: 600; border-top: 1px solid #ede9de;">${currentPoints} punktów</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #83827d; font-weight: 500; border-top: 1px solid #ede9de;">Brakujące punkty:</td>
          <td style="padding: 6px 0; font-size: 14px; color: #c5221f; font-weight: 600; border-top: 1px solid #ede9de;">${pointsNeeded} punktów</td>
        </tr>
      </table>
    </div>

    <h3 style="font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; font-size: 18px; font-weight: 600; color: #3d3929; margin-top: 24px; margin-bottom: 12px;">Co się stało?</h3>
    <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #535146; line-height: 1.6;">
      <li style="margin-bottom: 8px;">Promocja została dezaktywowana i nie jest widoczna dla klientów.</li>
      <li style="margin-bottom: 8px;">Automatyczne odnowienie zostało wyłączone.</li>
      <li style="margin-bottom: 0;">Możesz aktywować ją ponownie ręcznie po doładowaniu punktów.</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXTAUTH_URL}/panel-eksperta/punkty" class="btn" style="display: inline-block; background-color: #c96442; color: #ffffff !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(201, 100, 66, 0.2); text-align: center;">Dokup punkty</a>
    </div>
  `

  const html = getBrandEmailLayout(contentHtml, `Brak punktów do odnowienia promocji ${promotionLabel} w ProstaSprawa.`)

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
- Dokup punkty w panelu eksperta
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
  const greeting = userName ? `Witaj ${userName},` : 'Witaj,'

  const contentHtml = `
    <h2 style="font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; font-size: 22px; font-weight: bold; color: #3d3929; margin-top: 0; margin-bottom: 16px;">Witamy w ProstaSprawa!</h2>
    <p style="margin: 0 0 16px 0;">${greeting}</p>
    <p style="margin: 0 0 16px 0;">Dziękujemy za rejestrację ${isLawFirm ? 'eksperta' : 'konta'} w serwisie ProstaSprawa.</p>
    <p style="margin: 0 0 24px 0;">Aby aktywować swoje konto i rozpocząć korzystanie z platformy, musisz potwierdzić swój adres email klikając w poniższy przycisk:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" class="btn" style="display: inline-block; background-color: #c96442; color: #ffffff !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(201, 100, 66, 0.2); text-align: center;">Potwierdź adres email</a>
    </div>

    <div style="background-color: #faf9f5; border-left: 4px solid #c96442; border-radius: 4px; padding: 16px; margin: 24px 0;">
      <strong style="color: #3d3929; font-weight: 600; display: block; margin-bottom: 6px;">ℹ️ Ważne informacje:</strong>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #535146; line-height: 1.5;">
        <li style="margin-bottom: 4px;">Link weryfikacyjny jest ważny przez 24 godziny.</li>
        <li style="margin-bottom: 4px;">Bez potwierdzenia adresu email nie będziesz mógł się zalogować.</li>
        <li style="margin-bottom: 0;">Jeśli nie rejestrowałeś się w serwisie ProstaSprawa, zignoruj tę wiadomość.</li>
      </ul>
    </div>

    <h3 style="font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; font-size: 18px; font-weight: 600; color: #3d3929; margin-top: 24px; margin-bottom: 12px;">Co dalej?</h3>
    <p style="margin: 0 0 12px 0; color: #535146;">Po potwierdzeniu adresu email będziesz mógł:</p>
    
    ${isLawFirm ? `
      <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #535146; line-height: 1.6;">
        <li style="margin-bottom: 8px;">Uzupełnić profil swojej eksperta prawnej.</li>
        <li style="margin-bottom: 8px;">Przeglądać dostępne zapytania i sprawy od klientów.</li>
        <li style="margin-bottom: 8px;">Składać profesjonalne oferty pomocy prawnej.</li>
        <li style="margin-bottom: 0;">Aktywować promocje zwiększające widoczność Twojego profilu.</li>
      </ul>
    ` : `
      <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #535146; line-height: 1.6;">
        <li style="margin-bottom: 8px;">Dodawać nowe sprawy i zapytania prawne.</li>
        <li style="margin-bottom: 8px;">Przeglądać oferty pomocy od zweryfikowanych eksperta.</li>
        <li style="margin-bottom: 8px;">Bezpośrednio i bezpiecznie kontaktować się z prawnikami.</li>
        <li style="margin-bottom: 0;">Wystawiać oceny i opinie po zakończonej współpracy.</li>
      </ul>
    `}
    
    <p style="margin: 20px 0 0 0; font-size: 12px; color: #83827d; word-break: break-all;">Gdyby przycisk nie działał, skopiuj poniższy link i wklej go do przeglądarki:<br><a href="${verificationUrl}" style="color: #c96442; text-decoration: underline;">${verificationUrl}</a></p>
  `

  const html = getBrandEmailLayout(contentHtml, "Potwierdź swój adres email, aby zacząć korzystać z ProstaSprawa.")

  const text = `
Witamy w ProstaSprawa!

${userName ? `Witaj ${userName},` : 'Witaj,'}

Dziękujemy za rejestrację ${isLawFirm ? 'eksperta' : 'konta'} w serwisie ProstaSprawa.

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
- Uzupełnić profil swojej eksperta
- Przeglądać dostępne sprawy
- Składać oferty klientom
- Aktywować promocje swojego profilu
` : `
Co dalej?
Po potwierdzeniu emaila będziesz mógł:
- Dodawać sprawy prawne
- Przeglądać oferty eksperta
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
 * Generuje HTML dla emaila powitalnego po rejestracji eksperta z landing page (ps-landing).
 * Konto jest zakładane bez maila aktywacyjnego (skipEmailVerification), więc zamiast
 * weryfikacji wysyłamy podziękowanie za rejestrację i informację o starcie platformy.
 */
export function generateLandingWelcomeEmail(): { subject: string; html: string; text: string } {
  const subject = 'Dziękujemy za rejestrację – ProstaSprawa'

  const contentHtml = `
    <h2 style="font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Witamy w ProstaSprawa!</h2>
    <p style="margin: 0 0 16px 0;">Dzień dobry,</p>
    <p style="margin: 0 0 16px 0;">dziękujemy za rejestrację i cieszymy się, że dołączasz do nas jako jeden z ekspertów tworzących największą aplikację prawną w Polsce.</p>
    <p style="margin: 0 0 16px 0;">Oficjalnie ruszamy <strong>1 lipca</strong>. Do tego czasu odezwie się do Ciebie dedykowany opiekun, który przeprowadzi Cię przez kolejne kroki, pomoże uzupełnić profil i odpowie na wszystkie pytania. Nie musisz nic robić – wystarczy, że poczekasz na kontakt.</p>
    <p style="margin: 0 0 16px 0;">Jeśli już teraz coś budzi Twoją ciekawość lub wątpliwości, śmiało napisz w odpowiedzi na tę wiadomość.</p>
    <p style="margin: 0 0 24px 0;">Do zobaczenia 1 lipca!</p>
    <p style="margin: 0;">Pozdrawiamy,<br>Zespół ProstaSprawa.pl</p>
  `

  const html = getBrandEmailLayout(contentHtml, 'Dziękujemy za rejestrację w ProstaSprawa. Startujemy 1 lipca!')

  const text = `Dzień dobry,

dziękujemy za rejestrację i cieszymy się, że dołączasz do nas jako jeden z ekspertów tworzących największą aplikację prawną w Polsce.

Oficjalnie ruszamy 1 lipca. Do tego czasu odezwie się do Ciebie dedykowany opiekun, który przeprowadzi Cię przez kolejne kroki, pomoże uzupełnić profil i odpowie na wszystkie pytania. Nie musisz nic robić – wystarczy, że poczekasz na kontakt.

Jeśli już teraz coś budzi Twoją ciekawość lub wątpliwości, śmiało napisz w odpowiedzi na tę wiadomość.

Do zobaczenia 1 lipca!

Pozdrawiamy,
Zespół ProstaSprawa.pl`

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

  const contentHtml = `
    <h2 style="font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; font-size: 22px; font-weight: bold; color: #3d3929; margin-top: 0; margin-bottom: 16px;">Nowa wiadomość kontaktowa</h2>
    <p style="margin: 0 0 16px 0;">Witaj ${lawFirmName},</p>
    <p style="margin: 0 0 20px 0;">Otrzymałeś nową wiadomość przez formularz kontaktowy na swoim profilu w serwisie ProstaSprawa:</p>

    <div style="background-color: #faf9f5; border: 1px solid #dad9d4; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; font-size: 16px; font-weight: 600; color: #3d3929; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #dad9d4; padding-bottom: 8px;">Dane kontaktowe nadawcy:</h3>
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #83827d; font-weight: 500;" width="30%">Nadawca:</td>
          <td style="padding: 6px 0; font-size: 14px; color: #3d3929; font-weight: 600;" width="70%">${senderName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #83827d; font-weight: 500; border-top: 1px solid #ede9de;">Email:</td>
          <td style="padding: 6px 0; font-size: 14px; color: #3d3929; font-weight: 600; border-top: 1px solid #ede9de;"><a href="mailto:${senderEmail}" style="color: #c96442; text-decoration: underline;">${senderEmail}</a></td>
        </tr>
        ${senderPhone ? `
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #83827d; font-weight: 500; border-top: 1px solid #ede9de;">Telefon:</td>
          <td style="padding: 6px 0; font-size: 14px; color: #3d3929; font-weight: 600; border-top: 1px solid #ede9de;"><a href="tel:${senderPhone}" style="color: #c96442; text-decoration: underline;">${senderPhone}</a></td>
        </tr>
        ` : ""}
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #83827d; font-weight: 500; border-top: 1px solid #ede9de;">Temat:</td>
          <td style="padding: 6px 0; font-size: 14px; color: #3d3929; font-weight: 600; border-top: 1px solid #ede9de;">${subject}</td>
        </tr>
      </table>
    </div>

    <h3 style="font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; font-size: 18px; font-weight: 600; color: #3d3929; margin-top: 24px; margin-bottom: 12px;">Treść wiadomości:</h3>
    <div style="background-color: #faf9f5; border: 1px solid #dad9d4; border-radius: 8px; padding: 20px; margin: 16px 0; font-style: italic; color: #3d3929; line-height: 1.6; white-space: pre-wrap;">${message}</div>

    <p style="margin: 20px 0 24px 0; color: #535146;"><strong>Pamiętaj:</strong> Szybka odpowiedź znacznie zwiększa szansę na pozyskanie klienta!</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:${senderEmail}" class="btn" style="display: inline-block; background-color: #c96442; color: #ffffff !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(201, 100, 66, 0.2); text-align: center;">Odpowiedz na email</a>
    </div>
  `

  const html = getBrandEmailLayout(contentHtml, `Otrzymałeś nową wiadomość od ${senderName} w ProstaSprawa.`)

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

  const contentHtml = `
    <h2 style="font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; font-size: 22px; font-weight: bold; color: #3d3929; margin-top: 0; margin-bottom: 16px;">Potwierdź zapis do newslettera</h2>
    <p style="margin: 0 0 16px 0;">Witaj,</p>
    <p style="margin: 0 0 16px 0;">Dziękujemy za chęć zapisu do naszego newslettera w serwisie ProstaSprawa (dla adresu: <strong>${email}</strong>).</p>
    <p style="margin: 0 0 24px 0;">Aby potwierdzić subskrypcję i zacząć otrzymywać praktyczne porady prawne, nowości oraz przydatne analizy, kliknij poniższy przycisk:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" class="btn" style="display: inline-block; background-color: #c96442; color: #ffffff !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(201, 100, 66, 0.2); text-align: center;">Potwierdzam subskrypcję</a>
    </div>

    <div style="background-color: #faf9f5; border-left: 4px solid #c96442; border-radius: 4px; padding: 16px; margin: 24px 0;">
      <strong style="color: #3d3929; font-weight: 600; display: block; margin-bottom: 6px;">ℹ️ Ważna informacja:</strong>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #535146; line-height: 1.5;">
        <li style="margin-bottom: 4px;">Jeśli to nie Ty wpisałeś swój adres email na naszej stronie, po prostu zignoruj tę wiadomość.</li>
        <li style="margin-bottom: 0;">Twój adres nie zostanie dodany do bazy dopóki nie klikniesz w powyższy przycisk.</li>
      </ul>
    </div>
    
    <p style="margin: 20px 0 0 0; font-size: 12px; color: #83827d; word-break: break-all;">Gdyby przycisk nie działał, skopiuj poniższy link i wklej go do przeglądarki:<br><a href="${verificationUrl}" style="color: #c96442; text-decoration: underline;">${verificationUrl}</a></p>
  `

  const html = getBrandEmailLayout(contentHtml, "Potwierdź subskrypcję newslettera ProstaSprawa.")

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

/**
 * Generuje URL do wypisania się z newslettera
 */
export function generateNewsletterUnsubscribeUrl(token: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:4000"
  return `${baseUrl}/api/newsletter/unsubscribe?token=${token}`
}
