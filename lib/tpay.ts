import crypto from "crypto"

export interface TpayTransactionRequest {
  amount: number
  description: string
  payer: {
    email: string
    name: string
  }
  callbacks: {
    notification: {
      url: string
    }
    payerUrls: {
      success: string
      error: string
    }
  }
}

export interface TpayTransactionResponse {
  result: string
  transactionId: string
  transactionPaymentUrl: string
  error?: string
}

let cachedCert: string | null = null

async function getSignatureCertificate(sandbox: boolean): Promise<string> {
  if (cachedCert) return cachedCert
  const url = sandbox
    ? "https://secure.sandbox.tpay.com/x509/notifications-jws.pem"
    : "https://secure.tpay.com/x509/notifications-jws.pem"
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error("Failed to fetch Tpay JWS certificate")
  }
  cachedCert = await res.text()
  return cachedCert
}

export class TpayClient {
  private clientId: string
  private clientSecret: string
  private apiUrl: string
  private sandbox: boolean

  constructor() {
    this.clientId = process.env.TPAY_CLIENT_ID || ""
    this.clientSecret = process.env.TPAY_CLIENT_SECRET || ""
    this.sandbox = process.env.TPAY_ENVIRONMENT !== "production"
    this.apiUrl = this.sandbox
      ? "https://openapi.sandbox.tpay.com"
      : "https://api.tpay.com"
  }

  private async getAccessToken(): Promise<string> {
    const params = new URLSearchParams()
    params.append("client_id", this.clientId)
    params.append("client_secret", this.clientSecret)

    try {
      const response = await fetch(`${this.apiUrl}/oauth/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      })

      const text = await response.text()
      let data: any

      try {
        data = JSON.parse(text)
      } catch (e) {
        console.error("Tpay Auth Response (Non-JSON):", text)
        throw new Error(`Tpay Auth returned non-JSON response: ${text.substring(0, 100)}...`)
      }

      if (!response.ok) {
        console.error("Tpay Auth Error:", data)
        throw new Error(data.error_description || data.error || "Failed to authenticate with Tpay")
      }

      return data.access_token
    } catch (error) {
      console.error("Tpay Auth Exception:", error)
      throw error
    }
  }

  async createTransaction(request: TpayTransactionRequest): Promise<TpayTransactionResponse> {
    const token = await this.getAccessToken()

    try {
      const response = await fetch(`${this.apiUrl}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      })

      const text = await response.text()
      let data: any

      try {
        data = JSON.parse(text)
      } catch (e) {
        console.error(`Tpay Transaction Create Response (Non-JSON). Status: ${response.status}`)
        throw new Error(`Tpay Transaction Create returned non-JSON response: ${text.substring(0, 200)}...`)
      }

      if (!response.ok) {
        console.error("Tpay Transaction Create Error:", data)
        throw new Error(data.message || "Failed to create Tpay transaction")
      }

      return data
    } catch (error) {
      console.error("Tpay Transaction Create Exception:", error)
      throw error
    }
  }

  async verifyNotificationSignature(headers: Headers, bodyText: string): Promise<boolean> {
    try {
      const jws = headers.get("x-jws-signature")
      if (!jws) {
        console.error("Missing x-jws-signature header")
        return false
      }

      const jwsParts = jws.split(".")
      if (jwsParts.length !== 3) {
        console.error("Invalid JWS signature format")
        return false
      }

      const [header, , signature] = jwsParts

      // base64url encode the body
      const payload = Buffer.from(bodyText)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")

      const dataToVerify = `${header}.${payload}`
      const signatureBuffer = Buffer.from(signature, "base64url")

      const certPem = await getSignatureCertificate(this.sandbox)

      const isValid = crypto.verify(
        "sha256",
        Buffer.from(dataToVerify),
        certPem,
        signatureBuffer
      )

      return isValid
    } catch (error) {
      console.error("Error during Tpay JWS signature verification:", error)
      return false
    }
  }
}

export const tpayClient = new TpayClient()
