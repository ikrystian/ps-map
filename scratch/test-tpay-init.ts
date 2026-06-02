import "dotenv/config"
import { tpayClient } from "../lib/tpay"

async function runTest() {
  console.log("Starting Tpay init test...")
  console.log("API URL:", process.env.TPAY_ENVIRONMENT !== "production" ? "https://openapi.sandbox.tpay.com" : "https://api.tpay.com")
  console.log("Client ID:", process.env.TPAY_CLIENT_ID)
  console.log("Client Secret:", process.env.TPAY_CLIENT_SECRET ? "Exists (length: " + process.env.TPAY_CLIENT_SECRET.length + ")" : "Missing")

  try {
    const result = await tpayClient.createTransaction({
      amount: 49.00,
      description: "Test transaction",
      payer: {
        email: "test@example.com",
        name: "Test Payer",
      },
      callbacks: {
        notification: {
          url: "http://localhost:3000/api/payments/tpay/notify",
        },
        payerUrls: {
          success: "http://localhost:3000/success",
          error: "http://localhost:3000/failure",
        },
      },
    })
    console.log("SUCCESS:", result)
  } catch (error) {
    console.error("FAILED WITH ERROR:")
    console.error(error)
  }
}

runTest()
