/**
 * SMTP email sender using nodemailer
 *
 * Supports:
 * - STARTTLS (port 587) - default for most providers
 * - SSL/TLS   (port 465)
 * - Display name in From header: "Name <email>"
 */

import nodemailer from 'nodemailer'

interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailOptions {
  from: string
  to: string
  subject: string
  text?: string
  html?: string
}

export interface SMTPResponse {
  success: boolean
  error?: string
  log?: string
}

/**
 * Send email using nodemailer with TLS support
 */
export async function sendSMTPEmail(
  config: SMTPConfig,
  options: EmailOptions
): Promise<SMTPResponse> {
  const log: string[] = []

  try {
    const useSecure = config.secure || config.port === 465

    log.push(`I: Connecting to ${config.host}:${config.port} (${useSecure ? 'SSL/TLS' : 'STARTTLS'})`)

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: useSecure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
      tls: {
        rejectUnauthorized: false, // allow self-signed certificates
      },
    })

    const info = await transporter.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    log.push(`S: Message sent: ${info.messageId}`)
    log.push(`S: Response: ${info.response}`)

    return { success: true, log: log.join('\n') }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    log.push(`E: ${message}`)
    console.error('SMTP Error:', error)
    return { success: false, error: message, log: log.join('\n') }
  }
}
