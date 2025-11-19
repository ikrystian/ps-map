import crypto from "crypto"

export interface PayUOrderRequest {
    notifyUrl: string
    customerIp: string
    merchantPosId: string
    description: string
    currencyCode: string
    totalAmount: string // Amount in grosz (e.g. 1000 for 10.00 PLN)
    extOrderId: string
    buyer: {
        email: string
        phone?: string
        firstName?: string
        lastName?: string
        language?: string
    }
    products: {
        name: string
        unitPrice: string
        quantity: string
    }[]
    continueUrl?: string // Where to redirect after payment
}

export interface PayUOrderResponse {
    status: {
        statusCode: string
    }
    redirectUri: string
    orderId: string
    extOrderId?: string
}

export interface PayUNotification {
    order: {
        orderId: string
        extOrderId: string
        orderCreateDate: string
        notifyUrl: string
        customerIp: string
        merchantPosId: string
        description: string
        currencyCode: string
        totalAmount: string
        buyer: any
        products: any[]
        status: "COMPLETED" | "PENDING" | "CANCELED" | "WAITING_FOR_CONFIRMATION"
    }
    properties?: any[]
}

export class PayUClient {
    private posId: string
    private md5Key: string
    private clientId: string
    private clientSecret: string
    private apiUrl: string
    private sandbox: boolean

    constructor() {
        this.posId = process.env.PAYU_POS_ID || ""
        this.md5Key = process.env.PAYU_MD5_KEY || ""
        this.clientId = process.env.PAYU_CLIENT_ID || ""
        this.clientSecret = process.env.PAYU_CLIENT_SECRET || ""
        // Default to sandbox if not specified or implied
        this.sandbox = true
        this.apiUrl = "https://secure.snd.payu.com" // Sandbox URL

        // If we want production, we might need a flag. 
        // For now, the user provided credentials look like sandbox (standard PayU test credentials often start with 300xxx or similar, but 500396 is also common for sandbox/test).
        // The user link https://developers.payu.com/europe/api/ implies standard API.
        // Let's assume sandbox for now based on the context of "integration". 
        // If needed, we can switch to https://secure.payu.com based on an env var.
        if (process.env.NODE_ENV === 'production' && process.env.PAYU_ENVIRONMENT === 'production') {
            this.apiUrl = "https://secure.payu.com"
            this.sandbox = false
        }
    }

    private async getAccessToken(): Promise<string> {
        const params = new URLSearchParams()
        params.append("grant_type", "client_credentials")
        params.append("client_id", this.clientId)
        params.append("client_secret", this.clientSecret)

        try {
            const response = await fetch(`${this.apiUrl}/pl/standard/user/oauth/authorize`, {
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
                console.error("PayU Auth Response (Non-JSON):", text)
                throw new Error(`PayU Auth returned non-JSON response: ${text.substring(0, 100)}...`)
            }

            if (!response.ok) {
                console.error("PayU Auth Error:", data)
                throw new Error(data.error_description || data.error || "Failed to authenticate with PayU")
            }

            return data.access_token
        } catch (error) {
            console.error("PayU Auth Exception:", error)
            throw error
        }
    }

    async retrieveOrder(orderId: string): Promise<any> {
        const token = await this.getAccessToken()

        try {
            const response = await fetch(`${this.apiUrl}/api/v2_1/orders/${orderId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                const error = await response.json()
                console.error("PayU Retrieve Order Error:", error)
                throw new Error("Failed to retrieve order from PayU")
            }

            return await response.json()
        } catch (error) {
            console.error("PayU Retrieve Order Exception:", error)
            throw error
        }
    }

    async createOrder(orderRequest: PayUOrderRequest): Promise<PayUOrderResponse> {
        const token = await this.getAccessToken()

        try {
            const response = await fetch(`${this.apiUrl}/api/v2_1/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(orderRequest),
                redirect: "manual",
            })

            // Handle 302 Redirect (PayU sometimes redirects directly to payment page)
            if (response.status === 302 || response.status === 301 || response.status === 303 || response.status === 307) {
                const location = response.headers.get("location")
                if (location) {
                    // Extract orderId from URL params
                    let orderId = ""
                    try {
                        const url = new URL(location)
                        orderId = url.searchParams.get("orderId") || ""
                    } catch (e) {
                        console.warn("Could not parse PayU redirect URL for orderId:", location)
                    }

                    return {
                        status: { statusCode: "SUCCESS" },
                        redirectUri: location,
                        orderId: orderId,
                        extOrderId: orderRequest.extOrderId,
                    }
                }
            }

            const text = await response.text()
            let data: any

            try {
                data = JSON.parse(text)
            } catch (e) {
                console.error(`PayU Order Create Response (Non-JSON). Status: ${response.status}, URL: ${response.url}`)
                console.error("Response Body Preview:", text.substring(0, 500))
                throw new Error(`PayU Order Create returned non-JSON response (Status: ${response.status}): ${text.substring(0, 200)}...`)
            }

            if (!response.ok) {
                console.error("PayU Order Create Error:", data)
                throw new Error(data.status?.codeLiteral || "Failed to create PayU order")
            }

            return data
        } catch (error) {
            console.error("PayU Order Create Exception:", error)
            throw error
        }
    }

    verifyNotificationSignature(headers: Headers, body: string): boolean {
        const signatureHeader = headers.get("OpenPayu-Signature")
        if (!signatureHeader) return false

        // Header format: sender=...;signature=...;algorithm=MD5
        const parts = signatureHeader.split(";")
        const signaturePart = parts.find(p => p.trim().startsWith("signature="))

        if (!signaturePart) return false

        const signature = signaturePart.split("=")[1]

        // Verify signature
        // Concatenate body + key
        const concatenated = body + this.md5Key
        const expectedSignature = crypto.createHash("md5").update(concatenated).digest("hex")

        return signature === expectedSignature
    }
}

export const payuClient = new PayUClient()
