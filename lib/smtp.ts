/**
 * Simple SMTP client using Node.js built-in modules
 * No external dependencies required
 */

import * as tls from 'tls'
import * as net from 'net'

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
 * Simple SMTP client
 */
export class SMTPClient {
  private config: SMTPConfig
  private socket: tls.TLSSocket | net.Socket | null = null
  private responseBuffer: string = ''
  private communicationLog: string[] = []

  constructor(config: SMTPConfig) {
    this.config = config
  }

  private async command(cmd: string, expectedCode?: number, hideData: boolean = false): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error('Socket not connected'))
      }

      const timeout = setTimeout(() => {
        reject(new Error(`Command timeout: ${cmd}`))
      }, 10000)

      const onData = (data: Buffer) => {
        const response = data.toString()
        this.responseBuffer += response
        this.communicationLog.push(`S: ${response.trim()}`)
        const lines = this.responseBuffer.split('\r\n')

        // Check if we have a complete response (ends with \r\n)
        if (this.responseBuffer.endsWith('\r\n')) {
          clearTimeout(timeout)
          this.socket?.removeListener('data', onData)

          const lastLine = lines[lines.length - 2]
          const code = parseInt(lastLine.substring(0, 3))

          if (expectedCode && code !== expectedCode) {
            reject(new Error(`Expected ${expectedCode}, got ${code}: ${lastLine}`))
          } else {
            resolve(this.responseBuffer)
          }

          this.responseBuffer = ''
        }
      }

      this.socket.on('data', onData)
      this.communicationLog.push(`C: ${hideData ? '********' : cmd}`)
      this.socket.write(cmd + '\r\n')
    })
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'))
      }, 10000)

      const onConnect = () => {
        this.communicationLog.push(`I: Connected to ${this.config.host}:${this.config.port}`)
        clearTimeout(timeout)
      }

      const onData = (data: Buffer) => {
        const response = data.toString()
        this.communicationLog.push(`S: ${response.trim()}`)
        if (response.startsWith('220')) {
          this.socket?.removeListener('data', onData)
          resolve()
        }
      }

      if (this.config.secure || this.config.port === 465) {
        this.socket = tls.connect({
          host: this.config.host,
          port: this.config.port,
          rejectUnauthorized: false, // For self-signed certificates
        }, onConnect)
      } else {
        this.socket = net.connect({
          host: this.config.host,
          port: this.config.port,
        }, onConnect)
      }

      this.socket.on('data', onData)
      this.socket.on('error', (err) => {
        this.communicationLog.push(`E: Connection error: ${err.message}`)
        clearTimeout(timeout)
        reject(err)
      })
    })
  }

  async send(options: EmailOptions): Promise<void> {
    try {
      await this.connect()

      // EHLO
      await this.command(`EHLO ${this.config.host}`, 250)

      // Start TLS if not already secure
      if (!this.config.secure && this.config.port !== 465) {
        await this.command('STARTTLS', 220)

        // Upgrade to TLS
        const oldSocket = this.socket as net.Socket
        this.socket = tls.connect({
          socket: oldSocket,
          rejectUnauthorized: false,
        })

        await this.command(`EHLO ${this.config.host}`, 250)
      }

      // AUTH LOGIN
      await this.command('AUTH LOGIN', 334)
      await this.command(Buffer.from(this.config.auth.user).toString('base64'), 334, true)
      await this.command(Buffer.from(this.config.auth.pass).toString('base64'), 235, true)

      // MAIL FROM
      await this.command(`MAIL FROM:<${options.from}>`, 250)

      // RCPT TO
      await this.command(`RCPT TO:<${options.to}>`, 250)

      // DATA
      await this.command('DATA', 354)

      // Email content
      const date = new Date().toUTCString()
      const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@${this.config.host}>`

      let message = `From: ${options.from}\r\n`
      message += `To: ${options.to}\r\n`
      message += `Subject: ${options.subject}\r\n`
      message += `Date: ${date}\r\n`
      message += `Message-ID: ${messageId}\r\n`
      message += `MIME-Version: 1.0\r\n`

      if (options.html) {
        message += `Content-Type: multipart/alternative; boundary="boundary123"\r\n\r\n`
        message += `--boundary123\r\n`
        message += `Content-Type: text/plain; charset=utf-8\r\n\r\n`
        message += `${options.text || options.html.replace(/<[^>]*>/g, '')}\r\n\r\n`
        message += `--boundary123\r\n`
        message += `Content-Type: text/html; charset=utf-8\r\n\r\n`
        message += `${options.html}\r\n\r\n`
        message += `--boundary123--\r\n`
      } else {
        message += `Content-Type: text/plain; charset=utf-8\r\n\r\n`
        message += `${options.text}\r\n`
      }

      message += '\r\n.'
      await this.command(message, 250, true) // Hide body in logs

      // QUIT
      await this.command('QUIT', 221)
    } finally {
      this.socket?.end()
      this.socket = null
    }
  }

  getLog(): string {
    return this.communicationLog.join('\n')
  }
}

/**
 * Send email using SMTP
 */
export async function sendSMTPEmail(
  config: SMTPConfig,
  options: EmailOptions
): Promise<SMTPResponse> {
  const client = new SMTPClient(config)
  try {
    await client.send(options)
    return { success: true, log: client.getLog() }
  } catch (error) {
    console.error('SMTP Error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      log: client.getLog()
    }
  }
}
