import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { resolveInvoiceBuyer } from "@/lib/invoice-generator"
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

    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Tylko eksperci mogą kupować pakiety" },
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

    // Pobierz dane eksperta (dane adresowe do faktury są na koncie użytkownika)
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            imie: true,
            nazwisko: true,
            adres: true,
            kodPocztowy: true,
            miasto: true,
            companyData: {
              select: {
                COMPANY_name: true,
                COMPANY_nip: true,
                COMPANY_residenceAddress: true,
                COMPANY_workingAddress: true,
              },
            },
          },
        },
      },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "nie znaleziono eksperta" },
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

    // Pakiet darmowy (cena 0) — aktywacja bez płatności i bezterminowo
    if (price === 0) {
      const PACKAGE_ORDER = ["PODSTAWOWY", "STANDARD", "PREMIUM", "BIZNES"]
      const getPlanRank = (planTyp: string | null | undefined): number => {
        if (!planTyp) return -1
        const typUpper = planTyp.toUpperCase()
        if (typUpper === "FREE") return 0
        const idx = PACKAGE_ORDER.indexOf(typUpper)
        return idx !== -1 ? idx + 1 : -1
      }

      // Nie pozwól na przejście z wyższego, wciąż aktywnego pakietu na darmowy
      const hasActivePaid =
        lawFirm.pakietSubskrypcji &&
        (!lawFirm.dataPakietuDo || new Date(lawFirm.dataPakietuDo) > new Date())
      if (hasActivePaid && getPlanRank(plan.typ) < getPlanRank(lawFirm.pakietSubskrypcji)) {
        return Response.json(
          { error: `Nie możesz przejść na niższy pakiet (${plan.nazwa}), ponieważ posiadasz obecnie wyższy aktywny pakiet.` },
          { status: 400 }
        )
      }

      const dataPakietuOd = new Date()
      const orderNumber = `SUB-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`
      const finalDaneFaktury = JSON.stringify({
        nazwa: lawFirm.nazwa || "",
        nip: lawFirm.nip || "",
        adres: lawFirm.user?.adres || "",
        kodPocztowy: lawFirm.user?.kodPocztowy || "",
        miasto: lawFirm.user?.miasto || "",
      })

      const [updatedFreeLawFirm, freeOrder] = await prisma.$transaction([
        prisma.lawFirm.update({
          where: { id: lawFirm.id },
          data: {
            pakietSubskrypcji: plan.typ,
            dataPakietuOd,
            dataPakietuDo: null, // bezterminowo
            autoRenewal: false,
            punktySaldo: { increment: plan.punktyGratis },
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
            packageEndDate: null,
            kwota: 0,
            metodaPlatnosci: "PRZELEW",
            statusPlatnosci: "ZAPLACONE",
            zaplaconoData: new Date(),
            daneFaktury: finalDaneFaktury,
          },
        }),
        // Samodzielny zakup pakietu — modal powitalny o darmowym pakiecie Biznes
        // nie powinien się już wyświetlać (kupujący widzi modal aktywacji zakupu)
        prisma.notificationSettings.updateMany({
          where: { userId: session.user.id },
          data: { welcomePackageSeen: true },
        }),
      ])

      return Response.json({
        success: true,
        message: "Pakiet został aktywowany",
        lawFirm: updatedFreeLawFirm,
        plan: {
          nazwa: plan.nazwa,
          typ: plan.typ,
          punktyGratis: plan.punktyGratis,
          dataPakietuOd,
          dataPakietuDo: null,
          autoRenewal: false,
        },
        pricing: { originalPrice: 0, proRataCredit: 0, finalPrice: 0 },
        order: { id: freeOrder.id, orderNumber: freeOrder.orderNumber },
      })
    }

    // Proporcjonalne rozliczenie - jeśli ekspert ma aktywny pakiet
    let proRataCredit = 0
    let upgradeNote = ""

    if (lawFirm.dataPakietuDo && new Date(lawFirm.dataPakietuDo) > new Date()) {
      // Zablokuj przejście na niższy pakiet
      const PACKAGE_ORDER = ["PODSTAWOWY", "STANDARD", "PREMIUM", "BIZNES"]
      const getPlanRank = (planTyp: string | null | undefined): number => {
        if (!planTyp) return -1
        const typUpper = planTyp.toUpperCase()
        if (typUpper === "FREE") return 0
        const idx = PACKAGE_ORDER.indexOf(typUpper)
        return idx !== -1 ? idx + 1 : -1
      }

      const currentRank = getPlanRank(lawFirm.pakietSubskrypcji)
      const targetRank = getPlanRank(plan.typ)

      if (targetRank < currentRank) {
        return Response.json(
          { error: `Nie możesz przejść na niższy pakiet (${plan.nazwa}), ponieważ posiadasz obecnie wyższy aktywny pakiet.` },
          { status: 400 }
        )
      }

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

    // Walidacja metody płatności
    const validPaymentMethods = ["PAYU", "PRZELEWY24", "TPAY", "PRZELEW", "POINTS", "TEST"]
    if (!validPaymentMethods.includes(metodaPlatnosci)) {
      return Response.json(
        { error: "Nieprawidłowa metoda płatności" },
        { status: 400 }
      )
    }

    if (metodaPlatnosci !== "POINTS") {
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
    }

    // Oblicz daty subskrypcji
    const dataPakietuOd = new Date()
    const dataPakietuDo = new Date()
    dataPakietuDo.setMonth(dataPakietuDo.getMonth() + period)

    // Generuj numer zamówienia
    const orderNumber = `SUB-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

    const isOnlinePayment = metodaPlatnosci === "PAYU" || metodaPlatnosci === "PRZELEWY24"
    const isPointPayment = metodaPlatnosci === "POINTS"
    const isTestPayment = metodaPlatnosci === "TEST"

    // Sprawdź czy płatność testowa ma być automatycznie akceptowana
    let shouldAutoApprove = true
    if (isTestPayment) {
      const autoApproveSetting = await prisma.settings.findUnique({
        where: { key: "autoApproveTestPayment" }
      })
      shouldAutoApprove = autoApproveSetting ? autoApproveSetting.value === "true" : true
    }

    const isPendingPayment = isOnlinePayment || (isTestPayment && !shouldAutoApprove)

    // Konwersja ceny na punkty (1 PLN = 2 pkt)
    const POINTS_PER_PLN = 2
    const pointsCost = Math.round(finalPrice * POINTS_PER_PLN)

    let updatedLawFirm: any = lawFirm
    let order

    const finalDaneFaktury = JSON.stringify({
      nazwa: lawFirm.nazwa || "",
      nip: lawFirm.nip || "",
      adres: lawFirm.user?.adres || "",
      kodPocztowy: lawFirm.user?.kodPocztowy || "",
      miasto: lawFirm.user?.miasto || "",
    })

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
            daneFaktury: finalDaneFaktury,
          },
        }),
        ...pointTransactions,
        // Samodzielny zakup pakietu — modal powitalny o darmowym pakiecie Biznes
        // nie powinien się już wyświetlać (kupujący widzi modal aktywacji zakupu)
        prisma.notificationSettings.updateMany({
          where: { userId: session.user.id },
          data: { welcomePackageSeen: true },
        }),
      ])
      updatedLawFirm = result[0]
      order = result[1]
    } else if (isPendingPayment) {
      // Dla płatności online lub niezatwierdzonej testowej tworzymy tylko zamówienie oczekujące
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
          daneFaktury: finalDaneFaktury,
          transactionId: isTestPayment ? `TXN-TEST-SUB-${Date.now()}` : null,
          externalOrderId: isTestPayment ? `EXT-TEST-SUB-${Date.now()}` : null,
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
            daneFaktury: finalDaneFaktury,
            transactionId: isTestPayment ? `TXN-TEST-SUB-${Date.now()}` : null,
            externalOrderId: isTestPayment ? `EXT-TEST-SUB-${Date.now()}` : null,
          },
        }),
        // Samodzielny zakup pakietu — modal powitalny o darmowym pakiecie Biznes
        // nie powinien się już wyświetlać (kupujący widzi modal aktywacji zakupu)
        prisma.notificationSettings.updateMany({
          where: { userId: session.user.id },
          data: { welcomePackageSeen: true },
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

    // Dane nabywcy: z CompanyData (Biała lista) jeśli uzupełnione, w przeciwnym
    // razie z profilu kancelarii/użytkownika.
    const buyer = resolveInvoiceBuyer(lawFirm)

    // Utwórz fakturę
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        lawFirmId: lawFirm.id,
        buyerName: buyer.buyerName,
        buyerNIP: buyer.buyerNIP,
        buyerAddress: buyer.buyerAddress,
        buyerPostalCode: buyer.buyerPostalCode,
        buyerCity: buyer.buyerCity,
        netAmount,
        vatRate,
        vatAmount,
        grossAmount,
        status: isPendingPayment ? "ISSUED" : "PAID",
        dueDate,
        paymentDate: isPendingPayment ? null : new Date(),
      },
    })

    return Response.json({
      success: true,
      message: isPendingPayment ? "Zamówienie utworzone, oczekiwanie na płatność" : "Pakiet został aktywowany",
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
