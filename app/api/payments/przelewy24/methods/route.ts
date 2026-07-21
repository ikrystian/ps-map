import { p24Client } from "@/lib/przelewy24"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get("lang") || "pl"
    const rawAmount = searchParams.get("amount")
    const currency = searchParams.get("currency") || undefined

    const amount = rawAmount ? parseInt(rawAmount, 10) : undefined

    const result = await p24Client.getPaymentMethods({
      lang,
      ...(amount !== undefined && !isNaN(amount) && { amount }),
      ...(currency && { currency }),
    })

    if (result.error) {
      return Response.json(
        { error: result.error, responseCode: result.responseCode },
        { status: 400 }
      )
    }

    return Response.json({
      success: true,
      data: result.data || [],
      responseCode: result.responseCode,
    })
  } catch (error) {
    console.error("Error fetching P24 payment methods:", error)
    return Response.json(
      { error: "Błąd podczas pobierania metod płatności Przelewy24" },
      { status: 500 }
    )
  }
}
