import { sendEmailWithTemplate } from "@/lib/email"
import { sendSystemNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { EmailType } from "@prisma/client"

/**
 * Odblokowuje sprawy danego klienta ukryte do czasu potwierdzenia e-maila
 * (patrz Case.czekaNaAktywacjeEmail) i dopiero teraz powiadamia pasujących
 * ekspertów — wywoływane z /api/auth/verify-email w momencie realnego kliknięcia
 * linku weryfikacyjnego (nie przy automatycznej weryfikacji przy rejestracji).
 */
export async function unlockGatedCasesForUser(userId: string): Promise<void> {
  const client = await prisma.client.findUnique({
    where: { userId },
    select: { id: true },
  })
  if (!client) return

  const gatedCases = await prisma.case.findMany({
    where: { clientId: client.id, czekaNaAktywacjeEmail: true },
    select: { id: true },
  })

  for (const gatedCase of gatedCases) {
    await prisma.case.update({
      where: { id: gatedCase.id },
      data: { czekaNaAktywacjeEmail: false },
    })
    await notifyMatchingLawFirmsForCase(gatedCase.id)
  }
}

/**
 * Powiadamia ekspertów pasujących do sprawy (lokalizacja + kategoria) oraz — jeśli
 * sprawa powstała z linku polecającego — poleconego eksperta. Wywoływane od razu po
 * utworzeniu sprawy widocznej dla ekspertów, albo później, gdy klient dopiero co
 * potwierdził e-mail i sprawa przestała być ukryta (`czekaNaAktywacjeEmail`) —
 * dlatego przyjmuje tylko `caseId` i sam dociąga wszystkie potrzebne dane.
 */
export async function notifyMatchingLawFirmsForCase(caseId: string): Promise<void> {
  const newCase = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      category: true,
      categories: { include: { category: true } },
      voivodeship: true,
      city: true,
      client: { include: { user: { select: { email: true } } } },
      referral: { select: { lawFirmId: true } },
    },
  })

  if (!newCase) return

  const allCategoryIds = [
    newCase.categoryId,
    ...newCase.categories.map((c) => c.categoryId),
  ].filter((id, idx, arr) => arr.indexOf(id) === idx)

  const allCategoryNames = [newCase.category, ...newCase.categories.map((c) => c.category)]
    .filter((cat, idx, arr) => arr.findIndex((c) => c.id === cat.id) === idx)
    .map((cat) => cat.nazwa)
    .join(", ")

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:4000"

  let budzetText = "Do negocjacji"
  if (newCase.budzetOd || newCase.budzetDo) {
    if (newCase.budzetOd && newCase.budzetDo) {
      budzetText = `${newCase.budzetOd} - ${newCase.budzetDo} PLN`
    } else if (newCase.budzetOd) {
      budzetText = `od ${newCase.budzetOd} PLN`
    } else if (newCase.budzetDo) {
      budzetText = `do ${newCase.budzetDo} PLN`
    }
  }

  const { emitNewNotification } = await import("@/lib/socket")

  const lawFirms = await prisma.lawFirm.findMany({
    where: {
      aktywna: true,
      user: { deletedAt: null },
      AND: [
        {
          OR: [
            { calaPolska: true },
            { voivodeships: { some: { voivodeshipId: newCase.voivodeshipId } } },
            ...(newCase.cityId ? [{ cities: { some: { cityId: newCase.cityId } } }] : []),
          ],
        },
        {
          OR: [
            { categories: { none: {} } },
            { categories: { some: { categoryId: { in: allCategoryIds } } } },
          ],
        },
      ],
    },
    select: {
      id: true,
      userId: true,
      nazwa: true,
      user: { select: { email: true } },
    },
  })

  console.log(`[NOTIFY] Found ${lawFirms.length} law firm(s) matching case "${newCase.nazwaSprawy}" (cats: ${allCategoryIds.join(",")}, voiv: ${newCase.voivodeshipId}, city: ${newCase.cityId})`)

  if (lawFirms.length > 0) {
    const locationText = [newCase.city?.nazwa, newCase.voivodeship?.nazwa].filter(Boolean).join(", ")

    for (const lf of lawFirms) {
      // Polecający ekspert dostaje osobne, dokładniejsze powiadomienie – nie dublujemy
      if (newCase.referral && lf.id === newCase.referral.lawFirmId) continue

      const { notification: lfNotification } = await sendSystemNotification({
        userId: lf.userId,
        typ: "NOWA_OFERTA",
        tytul: "Nowa sprawa zgodna z Twoim zakresem",
        tresc: `📋 ${newCase.nazwaSprawy} · ${allCategoryNames}${locationText ? ` · 📍 ${locationText}` : ""}. Sprawdź szczegóły i złóż ofertę.`,
        linkUrl: "/panel-eksperta/sprawy",
      })

      await emitNewNotification(lf.userId, lfNotification)

      if (lf.user?.email) {
        try {
          await sendEmailWithTemplate({
            to: lf.user.email,
            templateType: EmailType.NOWA_SPRAWA,
            variables: {
              "{ekspert}": lf.nazwa,
              "{nazwaSprawi}": newCase.nazwaSprawy,
              "{kategoria}": allCategoryNames,
              "{klient}": `${newCase.client.imie} ${newCase.client.nazwisko}`,
              "{budżet}": budzetText,
              "{linkDoPanelu}": `${baseUrl}/panel-eksperta/sprawy`,
            },
          })
        } catch (emailError) {
          console.error(`Failed to send case email to law firm ${lf.nazwa}:`, emailError)
        }
      }
    }
  }

  // Powiadom eksperta, którego polecenie doprowadziło do powstania sprawy
  if (newCase.referral) {
    try {
      const referringFirm = await prisma.lawFirm.findUnique({
        where: { id: newCase.referral.lawFirmId },
        select: { nazwa: true, userId: true, user: { select: { email: true } } },
      })

      if (referringFirm) {
        const { notification } = await sendSystemNotification({
          userId: referringFirm.userId,
          typ: "POLECENIE_WYKORZYSTANE",
          tytul: "Klient z Twojego polecenia dodał sprawę",
          tresc: `🤝 ${newCase.nazwaSprawy} · ${allCategoryNames}. Sprawa jest już w Twoim panelu — możesz złożyć ofertę.`,
          linkUrl: `/panel-eksperta/sprawy/${newCase.id}`,
          emailTemplateType: EmailType.POLECENIE_SPRAWA_UTWORZONA,
          emailVariables: {
            "{ekspert}": referringFirm.nazwa,
            "{klient}": `${newCase.client.imie} ${newCase.client.nazwisko}`,
            "{email}": newCase.client.user.email,
            "{nazwaSprawy}": newCase.nazwaSprawy,
            "{kategorie}": allCategoryNames,
            "{linkDoSprawy}": `${baseUrl}/panel-eksperta/sprawy/${newCase.id}`,
          },
        })

        await emitNewNotification(referringFirm.userId, notification)
      }
    } catch (referralNotifyError) {
      console.error("Failed to notify referring law firm:", referralNotifyError)
    }
  }
}
