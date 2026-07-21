import { auth } from "@/lib/auth"
import { generateInvoiceForOrder } from "@/lib/invoice-generator"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

// GET - Pobierz historię zamówień punktów dla ekspertów
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    // Sprawdź czy użytkownik jest ekspertem
    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Dostęp tylko dla ekspertów" },
        { status: 403 }
      )
    }

    // Pobierz dane eksperta
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu eksperta" },
        { status: 404 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") // OCZEKUJE, ZAPLACONE, ANULOWANE, ZWROT

    // Buduj warunki zapytania
    const where: any = {
      lawFirmId: lawFirm.id,
    }

    if (status) {
      where.statusPlatnosci = status
    }

    // Pobierz zamówienia z paginacją
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          subscriptionPlan: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return Response.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return Response.json(
      { error: "Błąd podczas pobierania zamówień" },
      { status: 500 }
    )
  }
}

// POST - Utwórz nowe zamówienie punktów
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    // Sprawdź czy użytkownik jest ekspertem
    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Dostęp tylko dla ekspertów" },
        { status: 403 }
      )
    }

    // Pobierz dane eksperta (dane adresowe do faktury są na koncie użytkownika)
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: { adres: true, kodPocztowy: true, miasto: true },
        },
      },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu eksperta" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      pakietPunktow,
      liczbaPunktow,
      kwota,
      metodaPlatnosci,
      daneFaktury,
    } = body

    // Walidacja wymaganych pól
    if (!pakietPunktow || !liczbaPunktow || !kwota || !metodaPlatnosci) {
      return Response.json(
        { error: "Brak wymaganych pól" },
        { status: 400 }
      )
    }

    // Walidacja wartości
    if (liczbaPunktow <= 0 || kwota <= 0) {
      return Response.json(
        { error: "Liczba punktów i kwota muszą być większe od 0" },
        { status: 400 }
      )
    }

    // Walidacja metody płatności
    const validPaymentMethods = ["PAYU", "PRZELEWY24", "TPAY", "PRZELEW", "PAYPAL", "BACS", "TEST"]
    if (!validPaymentMethods.includes(metodaPlatnosci)) {
      return Response.json(
        { error: "Nieprawidłowa metoda płatności" },
        { status: 400 }
      )
    }

    const paymentSettingKeys: Record<string, string> = {
      TEST: "enablePaymentTest",
      PRZELEWY24: "enablePaymentPrzelewy24",
      PAYU: "enablePaymentPayU",
      TPAY: "enablePaymentTpay",
      PRZELEW: "enablePaymentPrzelew",
    }

    const settingKey = paymentSettingKeys[metodaPlatnosci]
    if (settingKey) {
      const paymentSetting = await prisma.settings.findUnique({
        where: { key: settingKey },
      })
      const isEnabled = paymentSetting ? paymentSetting.value !== "false" : true
      if (!isEnabled) {
        return Response.json(
          { error: "Wybrana metoda płatności jest obecnie wyłączona w systemie" },
          { status: 400 }
        )
      }
    } else {
      return Response.json(
        { error: "Wybrana metoda płatności nie jest obecnie obsługiwana" },
        { status: 400 }
      )
    }

    const isTestPayment = metodaPlatnosci === "TEST"

    // Sprawdź czy płatność testowa ma być automatycznie akceptowana
    let shouldAutoApprove = isTestPayment
    if (isTestPayment) {
      const autoApproveSetting = await prisma.settings.findUnique({
        where: { key: "autoApproveTestPayment" },
      })
      shouldAutoApprove = autoApproveSetting ? autoApproveSetting.value === "true" : true
    }

    const finalDaneFaktury = daneFaktury
      ? JSON.stringify(daneFaktury)
      : JSON.stringify({
        nazwa: lawFirm.nazwa || "",
        nip: lawFirm.nip || "",
        adres: lawFirm.user?.adres || "",
        kodPocztowy: lawFirm.user?.kodPocztowy || "",
        miasto: lawFirm.user?.miasto || "",
      })

    // Utwórz zamówienie
    const orderNumber = `PKT-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

    const order = await prisma.order.create({
      data: {
        lawFirmId: lawFirm.id,
        orderNumber,
        pakietPunktow,
        liczbaPunktow,
        kwota,
        metodaPlatnosci,
        daneFaktury: finalDaneFaktury,
        statusPlatnosci: shouldAutoApprove ? "ZAPLACONE" : "OCZEKUJE",
        zaplaconoData: shouldAutoApprove ? new Date() : null,
        transactionId: isTestPayment ? `TXN-TEST-PTS-${Date.now()}` : null,
        externalOrderId: isTestPayment ? `EXT-TEST-PTS-${Date.now()}` : null,
      },
    })

    if (shouldAutoApprove) {
      // 1. Zwiększ saldo punktów eksperta natychmiast
      await prisma.lawFirm.update({
        where: { id: lawFirm.id },
        data: {
          punktySaldo: {
            increment: liczbaPunktow,
          },
        },
      })
      // 2. Wygeneruj opłaconą fakturę
      await generateInvoiceForOrder(order.id)
    }

    return Response.json(order, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return Response.json(
      { error: "Błąd podczas tworzenia zamówienia" },
      { status: 500 }
    )
  }
}
