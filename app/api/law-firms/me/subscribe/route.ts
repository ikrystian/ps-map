import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Tylko kancelarie mogą kupować pakiety" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { planId, period, autoRenewal = false, metodaPlatnosci = "PRZELEW" } = body // period: 1, 6, 12 (months)

    if (!planId || !period) {
      return Response.json(
        { error: "Brak wymaganych danych" },
        { status: 400 }
      )
    }

    // Pobierz szczegóły pakietu
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      return Response.json(
        { error: "Nie znaleziono pakietu" },
        { status: 404 }
      )
    }

    if (!plan.aktywny) {
      return Response.json(
        { error: "Pakiet jest nieaktywny" },
        { status: 400 }
      )
    }

    // Pobierz dane kancelarii
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono kancelarii" },
        { status: 404 }
      )
    }

    // Oblicz cenę w zależności od okresu
    let price = 0
    switch (period) {
      case 1:
        price = plan.cena1Miesiac ?? 0
        break
      case 6:
        price = plan.cena6Miesiecy ?? 0
        break
      case 12:
        price = plan.cena12Miesiecy
        break
      default:
        return Response.json(
          { error: "Nieprawidłowy okres subskrypcji" },
          { status: 400 }
        )
    }

    if (price === 0) {
      return Response.json(
        { error: "Cena dla wybranego okresu jest niedostępna" },
        { status: 400 }
      )
    }

    // Proporcjonalne rozliczenie - jeśli kancelaria ma aktywny pakiet
    let proRataCredit = 0
    let upgradeNote = ""

    if (lawFirm.dataPakietuDo && new Date(lawFirm.dataPakietuDo) > new Date()) {
      // Pakiet jeszcze aktywny - oblicz wartość niewykorzystanego czasu
      const now = new Date()
      const remainingDays = Math.ceil(
        (new Date(lawFirm.dataPakietuDo).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Pobierz poprzedni pakiet aby znać jego cenę (jeśli istnieje)
      const previousPlan = lawFirm.pakietSubskrypcji
        ? await prisma.subscriptionPlan.findUnique({
          where: { typ: lawFirm.pakietSubskrypcji },
        })
        : null

      if (previousPlan && remainingDays > 0) {
        // Oblicz dzienną wartość poprzedniego pakietu
        // Zakładamy że cena roczna to baza
        const dailyValue = previousPlan.cena12Miesiecy / 365
        proRataCredit = dailyValue * remainingDays

        upgradeNote = `Niewykorzystany czas z pakietu ${previousPlan.nazwa}: ${remainingDays} dni (wartość: ${proRataCredit.toFixed(2)} zł)`
      }
    }

    // Oblicz finalną cenę po uwzględnieniu kredytu
    const finalPrice = Math.max(price - proRataCredit, 0)

    // Oblicz daty subskrypcji
    const dataPakietuOd = new Date()
    const dataPakietuDo = new Date()
    dataPakietuDo.setMonth(dataPakietuDo.getMonth() + period)

    // Generuj numer zamówienia
    const orderNumber = `SUB-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

    const isOnlinePayment = metodaPlatnosci === "PAYU" || metodaPlatnosci === "PRZELEWY24"
    const isPointPayment = metodaPlatnosci === "POINTS"

    // Konwersja ceny na punkty (1 PLN = 2 pkt)
    const POINTS_PER_PLN = 2
    const pointsCost = Math.round(finalPrice * POINTS_PER_PLN)

    let updatedLawFirm = lawFirm
    let order

    if (isPointPayment) {
      if (lawFirm.punktySaldo < pointsCost) {
        return Response.json(
          { error: "Niewystarczająca liczba punktów" },
          { status: 400 }
        )
      }

      // Prepare point transactions
      const balanceAfterPurchase = lawFirm.punktySaldo - pointsCost
      const balanceAfterBonus = balanceAfterPurchase + plan.punktyGratis

      const pointTransactions = [
        prisma.pointTransaction.create({
          data: {
            lawFirmId: lawFirm.id,
            amount: -pointsCost,
            balanceAfter: balanceAfterPurchase,
            type: "SUBSCRIPTION_PURCHASE",
            description: `Zakup pakietu ${plan.nazwa} na okres ${period} miesięcy`,
          },
        }),
      ]

      // Add bonus transaction if there are bonus points
      if (plan.punktyGratis > 0) {
        pointTransactions.push(
          prisma.pointTransaction.create({
            data: {
              lawFirmId: lawFirm.id,
              amount: plan.punktyGratis,
              balanceAfter: balanceAfterBonus,
              type: "SUBSCRIPTION_BONUS",
              description: `Bonus punktów za pakiet ${plan.nazwa}`,
            },
          })
        )
      }

      const result = await prisma.$transaction([
        prisma.lawFirm.update({
          where: { id: lawFirm.id },
          data: {
            pakietSubskrypcji: plan.typ,
            dataPakietuOd,
            dataPakietuDo,
            autoRenewal,
            punktySaldo: balanceAfterBonus,
          },
        }),
        prisma.order.create({
          data: {
            orderNumber,
            lawFirmId: lawFirm.id,
            orderType: "SUBSCRIPTION",
            subscriptionPlanId: plan.id,
            subscriptionPeriod: period,
            packageStartDate: dataPakietuOd,
            packageEndDate: dataPakietuDo,
            kwota: finalPrice, // Zapisujemy kwotę w PLN dla historii
            punktyKoszt: pointsCost, // Zapisujemy koszt w punktach
            metodaPlatnosci: "POINTS",
            statusPlatnosci: "ZAPLACONE",
            zaplaconoData: new Date(),
          },
        }),
        ...pointTransactions,
      ])
      updatedLawFirm = result[0]
      order = result[1]
    } else if (isOnlinePayment) {
      // Dla płatności online tworzymy tylko zamówienie oczekujące
      order = await prisma.order.create({
        data: {
          orderNumber,
          lawFirmId: lawFirm.id,
          orderType: "SUBSCRIPTION",
          subscriptionPlanId: plan.id,
          subscriptionPeriod: period,
          packageStartDate: dataPakietuOd,
          packageEndDate: dataPakietuDo,
          kwota: finalPrice,
          metodaPlatnosci: metodaPlatnosci,
          statusPlatnosci: "OCZEKUJE",
          zaplaconoData: null,
        },
      })
    } else {
      // Dla innych metod (symulacja/przelew) aktualizujemy od razu
      const result = await prisma.$transaction([
        prisma.lawFirm.update({
          where: { id: lawFirm.id },
          data: {
            pakietSubskrypcji: plan.typ,
            dataPakietuOd,
            dataPakietuDo,
            autoRenewal,
            punktySaldo: {
              increment: plan.punktyGratis,
            },
          },
        }),
        prisma.order.create({
          data: {
            orderNumber,
            lawFirmId: lawFirm.id,
            orderType: "SUBSCRIPTION",
            subscriptionPlanId: plan.id,
            subscriptionPeriod: period,
            packageStartDate: dataPakietuOd,
            packageEndDate: dataPakietuDo,
            kwota: finalPrice,
            metodaPlatnosci: metodaPlatnosci,
            statusPlatnosci: "ZAPLACONE",
            zaplaconoData: new Date(),
          },
        }),
      ])
      updatedLawFirm = result[0]
      order = result[1]
    }

    // Generuj numer faktury
    const invoiceNumber = `FV/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`

    // Oblicz kwoty VAT na podstawie finalnej ceny
    const vatRate = 23.0
    const netAmount = finalPrice / (1 + vatRate / 100)
    const vatAmount = finalPrice - netAmount
    const grossAmount = finalPrice

    // Oblicz termin płatności (7 dni)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)

    // Utwórz fakturę
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        lawFirmId: lawFirm.id,
        buyerName: lawFirm.nazwaFirmy,
        buyerNIP: lawFirm.nip,
        buyerAddress: lawFirm.adres,
        buyerPostalCode: lawFirm.kodPocztowy,
        buyerCity: lawFirm.miasto,
        netAmount,
        vatRate,
        vatAmount,
        grossAmount,
        status: isOnlinePayment ? "ISSUED" : "PAID",
        dueDate,
        paymentDate: isOnlinePayment ? null : new Date(),
      },
    })

    return Response.json({
      success: true,
      message: isOnlinePayment ? "Zamówienie utworzone, oczekiwanie na płatność" : "Pakiet został aktywowany",
      lawFirm: updatedLawFirm,
      plan: {
        nazwa: plan.nazwa,
        typ: plan.typ,
        punktyGratis: plan.punktyGratis,
        dataPakietuOd,
        dataPakietuDo,
        autoRenewal,
      },
      pricing: {
        originalPrice: price,
        proRataCredit,
        finalPrice,
        upgradeNote: upgradeNote || undefined,
      },
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
      },
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
      },
    })
  } catch (error) {
    console.error("Error subscribing to plan:", error)
    return Response.json(
      { error: "Wystąpił błąd podczas aktywacji pakietu" },
      { status: 500 }
    )
  }
}
