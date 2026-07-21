import crypto from "crypto"

export interface P24TransactionRequest {
  merchantId: number
  posId: number
  sessionId: string
  amount: number
  currency: string
  description: string
  email: string
  country?: string
  language?: string
  urlReturn: string
  urlStatus: string
  sign: string
  encoding?: string
}

export interface P24TransactionResponse {
  data?: {
    token: string
  }
  error?: string
  code?: number
}

export interface P24VerifyRequest {
  merchantId: number
  posId: number
  sessionId: string
  amount: number
  currency: string
  orderId: number
  sign: string
}

export class Przelewy24Client {
  private merchantId: number
  private posId: number
  private crc: string
  private apiKey: string
  private apiUrl: string
  private sandbox: boolean

  constructor() {
    this.merchantId = parseInt(process.env.P24_MERCHANT_ID || "0")
    this.posId = parseInt(process.env.P24_POS_ID || "0")
    this.crc = process.env.P24_CRC || ""
    this.apiKey = process.env.P24_API_KEY || ""
    this.sandbox = process.env.P24_SANDBOX === "true"
    this.apiUrl = process.env.P24_API_URL || "https://sandbox.przelewy24.pl"
  }

  // Kolejność kluczy w JSON musi być identyczna jak w dokumentacji P24 (sha384 z json_encode)
  private sha384(payload: Record<string, unknown>): string {
    return crypto.createHash("sha384").update(JSON.stringify(payload)).digest("hex")
  }

  private generateSign(data: {
    sessionId: string
    merchantId?: number
    amount: number
    currency: string
    crc: string
  }): string {
    const { sessionId, merchantId, amount, currency, crc } = data
    return this.sha384({
      sessionId,
      merchantId: merchantId || this.merchantId,
      amount,
      currency,
      crc,
    })
  }

  // Sign notyfikacji urlStatus: {merchantId, posId, sessionId, amount, originAmount, currency, orderId, methodId, statement, crc}
  verifyNotificationSign(notification: {
    merchantId: number
    posId: number
    sessionId: string
    amount: number
    originAmount: number
    currency: string
    orderId: number
    methodId: number
    statement: string
    sign: string
  }): boolean {
    const expected = this.sha384({
      merchantId: notification.merchantId,
      posId: notification.posId,
      sessionId: notification.sessionId,
      amount: notification.amount,
      originAmount: notification.originAmount,
      currency: notification.currency,
      orderId: notification.orderId,
      methodId: notification.methodId,
      statement: notification.statement,
      crc: this.crc,
    })

    const expectedBuf = Buffer.from(expected, "hex")
    const receivedBuf = Buffer.from(notification.sign || "", "hex")
    return (
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf)
    )
  }

  private getAuthHeader(): string {
    const credentials = `${this.posId}:${this.apiKey}`
    return `Basic ${Buffer.from(credentials).toString("base64")}`
  }

  async registerTransaction(params: {
    sessionId: string
    amount: number
    description: string
    email: string
    urlReturn: string
    urlStatus: string
    country?: string
    language?: string
  }): Promise<P24TransactionResponse> {
    const {
      sessionId,
      amount,
      description,
      email,
      urlReturn,
      urlStatus,
      country = "PL",
      language = "pl",
    } = params

    const sign = this.generateSign({
      sessionId,
      merchantId: this.merchantId,
      amount,
      currency: "PLN",
      crc: this.crc,
    })

    const requestData: P24TransactionRequest = {
      merchantId: this.merchantId,
      posId: this.posId,
      sessionId,
      amount,
      currency: "PLN",
      description,
      email,
      country,
      language,
      urlReturn,
      urlStatus,
      sign,
      encoding: "UTF-8",
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/v1/transaction/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getAuthHeader(),
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("P24 registration error:", data)
        return {
          error: data.error || "Nie udało się zarejestrować transakcji",
          code: data.code,
        }
      }

      return { data: data.data }
    } catch (error) {
      console.error("P24 API error:", error)
      return {
        error: "Błąd połączenia z bramką płatniczą",
      }
    }
  }

  async verifyTransaction(params: {
    sessionId: string
    amount: number
    orderId: number
  }): Promise<{ success: boolean; error?: string }> {
    const { sessionId, amount, orderId } = params

    // Sign weryfikacji: {sessionId, orderId, amount, currency, crc} — inny niż przy rejestracji!
    const sign = this.sha384({
      sessionId,
      orderId,
      amount,
      currency: "PLN",
      crc: this.crc,
    })

    const requestData: P24VerifyRequest = {
      merchantId: this.merchantId,
      posId: this.posId,
      sessionId,
      amount,
      currency: "PLN",
      orderId,
      sign,
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/v1/transaction/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getAuthHeader(),
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("P24 verification error:", data)
        return {
          success: false,
          error: data.error || "Nie udało się zweryfikować transakcji",
        }
      }

      return { success: true }
    } catch (error) {
      console.error("P24 verification API error:", error)
      return {
        success: false,
        error: "Błąd połączenia z bramką płatniczą",
      }
    }
  }

  async getTransactionBySessionId(sessionId: string): Promise<{
    data?: { orderId: number; sessionId: string; status: number; amount: number; currency: string }
    error?: string
  }> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/v1/transaction/by/sessionId/${encodeURIComponent(sessionId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: this.getAuthHeader(),
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || "Nie udało się pobrać danych transakcji" }
      }

      return { data: data.data }
    } catch (error) {
      console.error("P24 getTransaction API error:", error)
      return { error: "Błąd połączenia z bramką płatniczą" }
    }
  }

  getPaymentUrl(token: string): string {
    return `${this.apiUrl}/trnRequest/${token}`
  }
}

export const p24Client = new Przelewy24Client()
