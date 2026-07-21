import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { p24Client, P24Channel } from "@/lib/przelewy24"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderId, methodId } = body

    if (!orderId) {
      return Response.json(
        { error: "Brak ID zamówienia" },
        { status: 400 }
      )
    }

    // Pobierz zamówienie
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        lawFirm: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!order) {
      return Response.json(
        { error: "Nie znaleziono zamówienia" },
        { status: 404 }
      )
    }

    // Sprawdź czy zamówienie należy do zalogowanego użytkownika
    if (order.lawFirm.userId !== session.user.id) {
      return Response.json(
        { error: "Brak dostępu do zamówienia" },
        { status: 403 }
      )
    }

    // Sprawdź czy zamówienie nie zostało już opłacone
    if (order.statusPlatnosci === "ZAPLACONE") {
      return Response.json(
        { error: "Zamówienie zostało już opłacone" },
        { status: 400 }
      )
    }

    // Przygotuj dane dla Przelewy24
    const amount = Math.round(order.kwota * 100) // Kwota w groszach
    const sessionId = `${order.id}-${Date.now()}`
    const email = order.lawFirm.user.email || ""
    const description = `Zakup punktów: ${order.pakietPunktow} (${order.liczbaPunktow} pkt)`

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:4000"
    const urlReturn = `${baseUrl}/panel-eksperta/checkout/success?orderId=${order.id}`
    const urlStatus = `${baseUrl}/api/payments/przelewy24/notify`

    // Zarejestruj transakcję w Przelewy24 z obsługą wszystkich kanałów płatności
    const result = await p24Client.registerTransaction({
      sessionId,
      amount,
      description,
      email,
      urlReturn,
      urlStatus,
      country: "PL",
      language: "pl",
      channel: P24Channel.ALL,
      // Jeśli użytkownik wybrał konkretną metodę, przekaż ją — P24 pomija stronę wyboru
      ...(methodId !== undefined && { method: Number(methodId) }),
    })

    if (result.error || !result.data?.token) {
      console.error("P24 registration failed:", result.error)
      return Response.json(
        { error: result.error || "Nie udało się zainicjować płatności" },
        { status: 500 }
      )
    }

    // Zaktualizuj zamówienie
    await prisma.order.update({
      where: { id: orderId },
      data: {
        externalOrderId: sessionId,
        transactionId: result.data.token,
      },
    })

    // Zwróć URL do przekierowania
    const redirectUrl = p24Client.getPaymentUrl(result.data.token)

    return Response.json({
      success: true,
      redirectUrl,
      token: result.data.token,
    })
  } catch (error) {
    console.error("Error initializing P24 payment:", error)
    return Response.json(
      { error: "Błąd podczas inicjalizacji płatności" },
      { status: 500 }
    )
  }
}
