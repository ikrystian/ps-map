import {
  InvoiceStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  PointTransactionType,
  PrismaClient,
} from "@prisma/client";

export async function seedFinances(prisma: PrismaClient, lawFirms: any[]) {
  console.log("Seeding finances (orders, invoices, point transactions)...");

  const plans = await prisma.subscriptionPlan.findMany();
  const planBiznes = plans.find((p) => p.typ === "BIZNES") || plans[0];
  const planPremium = plans.find((p) => p.typ === "PREMIUM") || plans[1] || plans[0];
  const planStandard = plans.find((p) => p.typ === "STANDARD") || plans[2] || plans[0];
  const planPodstawowy = plans.find((p) => p.typ === "PODSTAWOWY") || plans[3] || plans[0];

  let invoiceSeq = 1;

  for (let i = 0; i < lawFirms.length; i++) {
    const firm = lawFirms[i];
    const fullFirm = await prisma.lawFirm.findUnique({
      where: { id: firm.id },
      include: { user: true },
    });
    if (!fullFirm) continue;

    const u = fullFirm.user;
    const buyerAddress = u.adres || "ul. Przykładowa 1";
    const buyerCity = u.miasto || "Warszawa";
    const buyerPostal = u.kodPocztowy || "00-001";
    const buyerNip = fullFirm.nip || "5213698521";

    const invoiceDataJson = JSON.stringify({
      buyerName: fullFirm.nazwa,
      buyerNIP: buyerNip,
      buyerAddress: `${buyerAddress}, ${buyerPostal} ${buyerCity}`,
    });

    // 1. Zamówienie subskrypcji
    let chosenPlan = planPodstawowy;
    if (fullFirm.pakietSubskrypcji === "BIZNES") chosenPlan = planBiznes;
    else if (fullFirm.pakietSubskrypcji === "PREMIUM") chosenPlan = planPremium;
    else if (fullFirm.pakietSubskrypcji === "STANDARD") chosenPlan = planStandard;

    const subGross = chosenPlan.cena12Miesiecy;
    const subNet = Math.round((subGross / 1.23) * 100) / 100;
    const subVat = Math.round((subGross - subNet) * 100) / 100;

    const subOrderDate = new Date(Date.now() - (30 + i * 2) * 24 * 60 * 60 * 1000);
    const subOrder = await prisma.order.create({
      data: {
        orderNumber: `SUB-2026-${String(1000 + i).padStart(5, "0")}`,
        lawFirmId: fullFirm.id,
        orderType: OrderType.SUBSCRIPTION,
        subscriptionPlanId: chosenPlan.id,
        subscriptionPeriod: 12,
        packageStartDate: subOrderDate,
        packageEndDate: new Date(subOrderDate.getTime() + 365 * 24 * 60 * 60 * 1000),
        kwota: subGross,
        metodaPlatnosci: i % 2 === 0 ? PaymentMethod.PAYU : PaymentMethod.PRZELEWY24,
        statusPlatnosci: PaymentStatus.ZAPLACONE,
        daneFaktury: invoiceDataJson,
        createdAt: subOrderDate,
        zaplaconoData: subOrderDate,
      },
    });

    // Faktura za subskrypcję
    const subInvNum = `FV/2026/09/${String(invoiceSeq++).padStart(5, "0")}`;
    await prisma.invoice.create({
      data: {
        invoiceNumber: subInvNum,
        orderId: subOrder.id,
        lawFirmId: fullFirm.id,
        buyerName: fullFirm.nazwa,
        buyerNIP: buyerNip,
        buyerAddress: buyerAddress,
        buyerPostalCode: buyerPostal,
        buyerCity: buyerCity,
        buyerCountry: "Polska",
        netAmount: subNet,
        vatRate: 23.0,
        vatAmount: subVat,
        grossAmount: subGross,
        status: InvoiceStatus.PAID,
        issueDate: subOrderDate,
        saleDate: subOrderDate,
        paymentDate: subOrderDate,
        dueDate: new Date(subOrderDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        ksefNumber: `5252812345-20260915-${String(i).padStart(8, "0")}-01`,
        ksefStatus: "ACCEPTED",
      },
    });

    // 2. Zamówienie punktów
    const pktCount = 500;
    const pktGross = 400.0;
    const pktNet = Math.round((pktGross / 1.23) * 100) / 100;
    const pktVat = Math.round((pktGross - pktNet) * 100) / 100;
    const pktOrderDate = new Date(Date.now() - (15 + i) * 24 * 60 * 60 * 1000);

    const pktOrder = await prisma.order.create({
      data: {
        orderNumber: `PKT-2026-${String(2000 + i).padStart(5, "0")}`,
        lawFirmId: fullFirm.id,
        orderType: OrderType.POINTS,
        pakietPunktow: "500_pkt",
        liczbaPunktow: pktCount,
        kwota: pktGross,
        metodaPlatnosci: PaymentMethod.TEST,
        statusPlatnosci: PaymentStatus.ZAPLACONE,
        daneFaktury: invoiceDataJson,
        createdAt: pktOrderDate,
        zaplaconoData: pktOrderDate,
      },
    });

    const pktInvNum = `FV/2026/10/${String(invoiceSeq++).padStart(5, "0")}`;
    await prisma.invoice.create({
      data: {
        invoiceNumber: pktInvNum,
        orderId: pktOrder.id,
        lawFirmId: fullFirm.id,
        buyerName: fullFirm.nazwa,
        buyerNIP: buyerNip,
        buyerAddress: buyerAddress,
        buyerPostalCode: buyerPostal,
        buyerCity: buyerCity,
        buyerCountry: "Polska",
        netAmount: pktNet,
        vatRate: 23.0,
        vatAmount: pktVat,
        grossAmount: pktGross,
        status: InvoiceStatus.PAID,
        issueDate: pktOrderDate,
        saleDate: pktOrderDate,
        paymentDate: pktOrderDate,
        dueDate: new Date(pktOrderDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        ksefNumber: `5252812345-20261010-${String(i).padStart(8, "0")}-02`,
        ksefStatus: "ACCEPTED",
      },
    });

    // 3. Historia transakcji punktowych (PointTransaction)
    let balance = 0;

    // A. Bonus z pakietu subskrypcji
    const bonusPkt = chosenPlan.punktyGratis || 50;
    balance += bonusPkt;
    await prisma.pointTransaction.create({
      data: {
        lawFirmId: fullFirm.id,
        amount: bonusPkt,
        balanceAfter: balance,
        type: PointTransactionType.SUBSCRIPTION_BONUS,
        description: `Punkty gratis do pakietu ${chosenPlan.nazwa}`,
        createdAt: subOrderDate,
      },
    });

    // B. Zakup pakietu 500 punktów
    balance += pktCount;
    await prisma.pointTransaction.create({
      data: {
        lawFirmId: fullFirm.id,
        amount: pktCount,
        balanceAfter: balance,
        type: PointTransactionType.POINTS_PURCHASE,
        description: `Zakup pakietu ${pktCount} punktów (Zamówienie ${pktOrder.orderNumber})`,
        createdAt: pktOrderDate,
      },
    });

    // C. Bonus partnerski
    balance += 100;
    await prisma.pointTransaction.create({
      data: {
        lawFirmId: fullFirm.id,
        amount: 100,
        balanceAfter: balance,
        type: PointTransactionType.PARTNER_BONUS,
        description: "Miesięczny bonus za aktywny baner w Klubie Partnerskim",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    });

    // D. Wyróżnienie oferty na sprawie
    balance -= 50;
    await prisma.pointTransaction.create({
      data: {
        lawFirmId: fullFirm.id,
        amount: -50,
        balanceAfter: balance,
        type: PointTransactionType.OFFER_HIGHLIGHT,
        description: "Wyróżnienie oferty na liście ofert sprawy klienta",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    // E. Korekta salda do wartości lawFirm.punktySaldo
    const diff = fullFirm.punktySaldo - balance;
    if (diff !== 0) {
      balance += diff;
      await prisma.pointTransaction.create({
        data: {
          lawFirmId: fullFirm.id,
          amount: diff,
          balanceAfter: balance,
          type: diff > 0 ? PointTransactionType.ADMIN_ADJUSTMENT : PointTransactionType.PROMOTION_PURCHASE,
          description: diff > 0 ? "Premia promocyjna od administratora platformy" : "Opłata za promocję w katalogu ekspertów",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log(`✓ Utworzono zamówienia, faktury KSeF oraz historię transakcji punktowych dla wszystkich kancelarii`);
}
