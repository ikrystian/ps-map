/**
 * Email utility functions
 *
 * UWAGA: Ta implementacja wymaga zainstalowania nodemailer:
 * npm install nodemailer @types/nodemailer
 *
 * Oraz konfiguracji zmiennych środowiskowych:
 * EMAIL_SERVER_HOST=smtp.gmail.com
 * EMAIL_SERVER_PORT=587
 * EMAIL_SERVER_USER=your-email@gmail.com
 * EMAIL_SERVER_PASSWORD=your-app-password
 * EMAIL_FROM=noreply@prostaspawa.pl
 */

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Wysyła email
 *
 * UWAGA: W środowisku development, email jest logowany do konsoli zamiast wysyłany
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
  try {
    // W środowisku development, loguj email do konsoli
    if (process.env.NODE_ENV === 'development') {
      console.log('='.repeat(80))
      console.log('📧 EMAIL (Development Mode)')
      console.log('='.repeat(80))
      console.log(`To: ${to}`)
      console.log(`Subject: ${subject}`)
      console.log(`HTML: ${html}`)
      console.log('='.repeat(80))
      return true
    }

    // W produkcji, tutaj będzie implementacja z nodemailer
    // Przykładowa implementacja (wymaga instalacji nodemailer):
    /*
    const nodemailer = require('nodemailer')

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    })
    */

    console.log(`Email would be sent to: ${to}`)
    return true
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
