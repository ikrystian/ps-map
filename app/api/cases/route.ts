import { auth } from "@/auth"
import { isReferralUsable } from "@/lib/case-referrals"
import { notifyMatchingLawFirmsForCase } from "@/lib/case-notifications"
import { buildLawFirmCaseWhereInput } from "@/lib/cases"
import { generateCaseOtpEmail, sendEmail, sendEmailWithTemplate } from "@/lib/email"
import { sendSystemNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { EmailType, Prisma } from "@prisma/client"
import crypto from "crypto"
import fs from "fs"
import { NextRequest, NextResponse } from "next/server"
import path from "path"

const CASE_OTP_TTL_MS = 10 * 60 * 1000
const CASE_OTP_MAX_ATTEMPTS = 5

function logErrorToFile(context: string, error: any) {
  try {
    const logDir = path.join(process.cwd(), "logs")
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
    const logPath = path.join(logDir, "api-cases-errors.log")
    const timestamp = new Date().toISOString()
    const errMsg = error instanceof Error ? error.message : String(error)
    const errStack = error instanceof Error ? error.stack : ""
    const logEntry = `[${timestamp}] Context: ${context}\nError: ${errMsg}\nStack: ${errStack}\n${"=".repeat(80)}\n`
    fs.appendFileSync(logPath, logEntry, "utf8")
  } catch (e) {
    console.error("Failed to write to log file", e)
  }
}


export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pobierz sprawy w zależności od roli użytkownika
    if (session.user.role === "CLIENT") {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
      })

      if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 })
      }

      const cases = await prisma.case.findMany({
        where: { clientId: client.id },
        include: {
          category: true,
          categories: { include: { category: true } },
          voivodeship: true,
          city: true,
          referral: { select: { lawFirm: { select: { nazwa: true } } } },
          offers: {
            include: {
              lawFirm: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      return NextResponse.json(cases)
    }

    if (session.user.role === "LAW_FIRM") {
      const searchParams = request.nextUrl.searchParams
      const includeAll = searchParams.get("includeAll") === "true"

      // Pobierz pełny profil eksperta (zakres usług)
      const lawFirm = await prisma.lawFirm.findUnique({
        where: { userId: session.user.id },
        select: {
          id: true,
          calaPolska: true,
          voivodeships: { select: { voivodeshipId: true } },
          cities: { select: { cityId: true } },
          categories: { select: { categoryId: true } },
        }
      })

      if (!lawFirm) {
        return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
      }

      // Filtr statusu
      const statusFilter: Prisma.CaseWhereInput = includeAll
        ? { status: { notIn: ["ANULOWANA"] } }
        : { status: { in: ["NOWA", "OFERTY_OTRZYMANE"] } }

      // Złóż końcowy warunek WHERE
      const whereCondition = buildLawFirmCaseWhereInput(lawFirm, statusFilter)

      // Pobierz wszystkie sprawy zgodnie z warunkiem
      const allCases = await prisma.case.findMany({
        where: whereCondition,
        include: {
          category: true,
          categories: { include: { category: true } },
          voivodeship: true,
          city: { include: { county: true } },
          referral: { select: { lawFirmId: true } },
          client: {
            select: {
              imie: true,
              nazwisko: true,
              user: {
                select: { miasto: true },
              },
            },
          },
          offers: {
            select: {
              id: true,
              status: true,
              kwotaNetto: true,
              terminRealizacjiDni: true,
              createdAt: true,
              lawFirmId: true,
            },
          },
          _count: {
            select: {
              offers: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      // Filtruj sprawy, aby ukryć te z zaakceptowanymi ofertami od innych eksperta
      const filteredCases = allCases.filter((caseItem: any) => {
        // Sprawdź czy istnieje zaakceptowana oferta
        const acceptedOffer = caseItem.offers.find((offer: any) => offer.status === "ZAAKCEPTOWANA")

        // Jeśli nie ma zaakceptowanej oferty, pokaż sprawę
        if (!acceptedOffer) {
          return true
        }

        // Jeśli zaakceptowana oferta jest od tego eksperta, pokaż sprawę
        if (acceptedOffer.lawFirmId === lawFirm.id) {
          return true
        }

        // W przeciwnym razie ukryj sprawę (zaakceptowana oferta od innej eksperta)
        return false
      })

      // Usuń lawFirmId z ofert przed zwróceniem (dane wrażliwe)
      const cases = filteredCases.map(({ referral, ...caseItem }: any) => ({
        ...caseItem,
        // Nie ujawniamy, KTÓRY ekspert polecił sprawę — tylko czy zrobił to ten zalogowany
        zTwojegoPolecenia: referral?.lawFirmId === lawFirm.id,
        // Miasto klienta przeniesione do modelu User — spłaszcz dla zgodności
        client: caseItem.client
          ? { ...caseItem.client, miasto: caseItem.client.user?.miasto ?? null }
          : caseItem.client,
        offers: caseItem.offers
          .filter((offer: any) => offer.lawFirmId === lawFirm.id) // Pokaż tylko oferty tego eksperta
          .map(({ lawFirmId, ...offer }: any) => offer) // Usuń lawFirmId
      }))

      return NextResponse.json(cases)
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (error) {
    logErrorToFile("GET /api/cases", error)
    console.error("Error fetching cases:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const nextAuthSession = await auth()

    let session: { user: { id: string; email: string; role: "CLIENT" } } | null = null
    let usedCaseCreationTicketToken: string | null = null

    if (nextAuthSession?.user && nextAuthSession.user.role === "CLIENT") {
      session = {
        user: { id: nextAuthSession.user.id, email: nextAuthSession.user.email!, role: "CLIENT" },
      }
    } else {
      // Kreator /dodaj-sprawe: konto jeszcze niezalogowane (auth.ts blokuje
      // logowanie do czasu kliknięcia linku w mailu), więc zamiast sesji NextAuth
      // przyjmujemy jednorazowy bilet wydany przez /api/auth/register — patrz
      // CaseCreationTicket. Ticket zostaje skonsumowany dopiero po udanym
      // utworzeniu sprawy niżej, bo retry przy OTP e-mail wykonuje kolejne
      // żądania do tego endpointu z tym samym biletem.
      const ticketToken = request.headers.get("x-case-creation-token")
      if (ticketToken) {
        const ticket = await prisma.caseCreationTicket.findUnique({ where: { token: ticketToken } })
        if (ticket && ticket.expires > new Date()) {
          const ticketUser = await prisma.user.findUnique({
            where: { id: ticket.userId },
            select: { id: true, email: true, role: true },
          })
          if (ticketUser?.role === "CLIENT") {
            session = { user: { id: ticketUser.id, email: ticketUser.email, role: "CLIENT" } }
            usedCaseCreationTicketToken = ticketToken
          }
        }
      }
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Sprawa utworzona przez bilet (bez sesji) należy do konta, które jeszcze nie
    // potwierdziło e-maila — musi zostać ukryta przed ekspertami do tego czasu
    // (patrz Case.czekaNaAktywacjeEmail i buildLawFirmCaseWhereInput).
    const requiresEmailActivation = !nextAuthSession?.user

    // Znajdź klienta
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const body = await request.json()

    // Sprawa może mieć wiele kategorii (categoryIds[]); stare formularze wysyłają pojedyncze categoryId
    const requestedCategoryIds: string[] =
      Array.isArray(body.categoryIds) && body.categoryIds.length > 0
        ? [...new Set(body.categoryIds.filter((id: any) => typeof id === "string" && id))]
        : body.categoryId
          ? [body.categoryId]
          : []

    // Walidacja wymaganych pól
    if (
      !body.typSprawy ||
      requestedCategoryIds.length === 0 ||
      !body.voivodeshipId ||
      !body.cityId ||
      !body.nazwaSprawy ||
      !body.opisSprawy ||
      !body.imieNazwisko ||
      !body.telefonKontakt ||
      !body.preferowanyKontakt ||
      !body.akceptujeKlauzule
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Dodatkowa weryfikacja kodem email (OTP) przed utworzeniem sprawy — opcja z ustawień panelu administratora
    const otpSetting = await prisma.settings.findUnique({ where: { key: "caseCreationOtpEnabled" } })
    const caseOtpEnabled = otpSetting?.value === "true"

    if (caseOtpEnabled) {
      const submittedOtpCode = typeof body.otpCode === "string" ? body.otpCode.trim() : ""

      if (!submittedOtpCode) {
        // Krok 1: brak kodu w żądaniu — wygeneruj nowy kod, wyślij mailem i poinformuj frontend
        const rl = rateLimit(`case-otp-request:${session.user.id}:${getClientIp(request)}`, { limit: 5, windowMs: 15 * 60 * 1000 })
        if (!rl.success) return tooManyRequestsResponse(rl.retryAfterSeconds)

        // Unieważnij poprzednie, jeszcze niewykorzystane kody tego użytkownika
        await prisma.caseOtpVerification.updateMany({
          where: { userId: session.user.id, consumed: false },
          data: { consumed: true },
        })

        const code = crypto.randomInt(100000, 1000000).toString()
        await prisma.caseOtpVerification.create({
          data: {
            userId: session.user.id,
            code,
            expiresAt: new Date(Date.now() + CASE_OTP_TTL_MS),
          },
        })

        try {
          const { subject, html, text } = generateCaseOtpEmail(code, `${client.imie} ${client.nazwisko}`.trim())
          await sendEmail({ to: session.user.email!, subject, html, text })
        } catch (emailError) {
          console.error("Failed to send case OTP email:", emailError)
          return NextResponse.json({ error: "Nie udało się wysłać kodu weryfikacyjnego. Spróbuj ponownie." }, { status: 500 })
        }

        return NextResponse.json({ requiresOtp: true, message: "Kod weryfikacyjny został wysłany na Twój adres email." }, { status: 200 })
      }

      // Krok 2: kod podany w żądaniu — zweryfikuj go przed utworzeniem sprawy
      const rlVerify = rateLimit(`case-otp-verify:${session.user.id}:${getClientIp(request)}`, { limit: 10, windowMs: 15 * 60 * 1000 })
      if (!rlVerify.success) return tooManyRequestsResponse(rlVerify.retryAfterSeconds)

      const otpRecord = await prisma.caseOtpVerification.findFirst({
        where: { userId: session.user.id, consumed: false },
        orderBy: { createdAt: "desc" },
      })

      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        return NextResponse.json({ error: "Kod weryfikacyjny wygasł. Wygeneruj nowy kod.", otpExpired: true }, { status: 400 })
      }

      if (otpRecord.attempts >= CASE_OTP_MAX_ATTEMPTS) {
        await prisma.caseOtpVerification.update({ where: { id: otpRecord.id }, data: { consumed: true } })
        return NextResponse.json({ error: "Przekroczono limit prób. Wygeneruj nowy kod.", otpExpired: true }, { status: 400 })
      }

      if (otpRecord.code !== submittedOtpCode) {
        await prisma.caseOtpVerification.update({ where: { id: otpRecord.id }, data: { attempts: { increment: 1 } } })
        return NextResponse.json({ error: "Nieprawidłowy kod weryfikacyjny.", invalidOtp: true }, { status: 400 })
      }

      await prisma.caseOtpVerification.update({ where: { id: otpRecord.id }, data: { consumed: true } })
    }

    // Sprawa może pochodzić z linku polecającego eksperta (/polecenie/[token]).
    // Niepoprawny token NIE blokuje utworzenia sprawy — sprawa powstaje po prostu bez polecenia.
    const referralToken = typeof body.referralToken === "string" ? body.referralToken.trim() : ""
    let referral: { id: string; lawFirmId: string } | null = null

    if (referralToken) {
      const candidate = await prisma.caseReferral.findUnique({
        where: { token: referralToken },
        select: { id: true, lawFirmId: true, email: true, status: true, expiresAt: true, caseId: true },
      })

      const usability = isReferralUsable(candidate)

      if (!usability.ok) {
        console.warn(`[REFERRAL] Pominięto token przy tworzeniu sprawy: ${usability.reason}`)
      } else if (candidate!.email !== session.user.email?.toLowerCase()) {
        console.warn("[REFERRAL] Token polecenia nie należy do zalogowanego klienta — pomijam")
      } else {
        referral = { id: candidate!.id, lawFirmId: candidate!.lawFirmId }
      }
    }

    // Znajdź kategorie po ID lub po slugu (np. dla dawnych slugów w formularzach)
    const resolvedCategories = []
    for (const requestedId of requestedCategoryIds) {
      let category = await prisma.category.findFirst({
        where: {
          OR: [
            { id: requestedId },
            { slug: requestedId }
          ]
        },
      })

      if (!category) {
        // Jeśli kategoria nie istnieje, a podana wartość wygląda jak UUID, to znaczy że nie istnieje w bazie
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestedId)
        if (isUuid) {
          return NextResponse.json({ error: "Selected category not found" }, { status: 404 })
        }

        // W przeciwnym wypadku utwórz nową kategorię (legacy fallback dla slugów)
        category = await prisma.category.create({
          data: {
            nazwa: requestedId
              .split("-")
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" "),
            slug: requestedId,
            aktywna: true,
          },
        })
      }

      resolvedCategories.push(category)
    }

    // Pierwsza wybrana kategoria pozostaje kategorią główną sprawy
    const category = resolvedCategories[0]
    const allCategoryIds = resolvedCategories.map((c) => c.id)
    const allCategoryNames = resolvedCategories.map((c) => c.nazwa).join(", ")

    // Znajdź lub utwórz województwo
    let voivodeship = await prisma.voivodeship.findUnique({
      where: { slug: body.voivodeshipId },
    })

    if (!voivodeship) {
      // Jeśli województwo nie istnieje, utwórz je
      voivodeship = await prisma.voivodeship.create({
        data: {
          nazwa: body.voivodeshipId
            .split("-")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          slug: body.voivodeshipId,
        },
      })
    }

    // Znajdź miasto
    const city = await prisma.city.findUnique({
      where: { id: body.cityId },
    })

    if (!city) {
      return NextResponse.json({ error: "Selected city not found" }, { status: 404 })
    }

    if (city.voivodeshipId !== voivodeship.id) {
      return NextResponse.json({ error: "City does not belong to the selected voivodeship" }, { status: 400 })
    }

    // Konwersja daty jeśli istnieje
    let oczekiwanyTerminRealizacji = null
    if (body.oczekiwanyTerminRealizacji) {
      oczekiwanyTerminRealizacji = new Date(body.oczekiwanyTerminRealizacji)
    }

    // Utwórz sprawę
    const newCase = await prisma.case.create({
      data: {
        clientId: client.id,
        typSprawy: body.typSprawy,
        categoryId: category.id,
        categories: {
          create: allCategoryIds.map((categoryId) => ({ categoryId })),
        },
        wybranadziedzinaPrawa: null,
        wybranaSpecyfikacja: null,
        nazwaSprawy: body.nazwaSprawy,
        opisSprawy: body.opisSprawy,
        zalaczniki: body.zalaczniki?.length > 0 ? JSON.stringify(body.zalaczniki) : null,
        oczekiwanyTerminRealizacji,
        trybPilny: body.trybPilny || false,
        budzetOd: body.budzetOd || null,
        budzetDo: body.budzetDo || null,
        doNegocjacji: body.doNegocjacji || false,
        imieNazwisko: body.imieNazwisko,
        telefonKontakt: body.telefonKontakt,
        preferowanyKontakt: body.preferowanyKontakt,
        voivodeshipId: voivodeship.id,
        cityId: city.id,
        akceptujeKlauzule: body.akceptujeKlauzule,
        status: "NOWA",
        czekaNaAktywacjeEmail: requiresEmailActivation,
      },
      include: {
        category: true,
        categories: { include: { category: true } },
        voivodeship: true,
        city: true,
      },
    })

    // Zamknij lejek polecenia — sprawa jest celem, po który został wysłany link
    if (referral) {
      try {
        await prisma.caseReferral.update({
          where: { id: referral.id },
          data: {
            caseId: newCase.id,
            clientId: client.id,
            status: "SPRAWA_UTWORZONA",
            wykorzystanoAt: new Date(),
          },
        })
      } catch (referralError) {
        console.error("Failed to link case referral:", referralError)
        referral = null
      }
    }

    // Utwórz powiadomienie dla klienta o dodaniu sprawy
    const { notification: clientNotification } = await sendSystemNotification({
      userId: session.user.id,
      typ: "SYSTEM",
      tytul: "Sprawa dodana pomyślnie",
      tresc: requiresEmailActivation
        ? `Twoja sprawa "${body.nazwaSprawy}" została dodana. Potwierdź adres e-mail klikając w link, który wysłaliśmy — dopiero wtedy eksperci prawni zobaczą sprawę i będą mogli składać oferty.`
        : `Twoja sprawa "${body.nazwaSprawy}" została dodana. Eksperci prawni mogą teraz składać oferty.`,
      linkUrl: `/panel-klienta/sprawy/${newCase.id}`,
      force: true, // Kluczowe / systemowe powiadomienie
    })

    // Emit notification to client via Socket.IO
    const { emitNewNotification } = await import("@/lib/socket")
    await emitNewNotification(session.user.id, clientNotification)

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
    } else if (newCase.doNegocjacji) {
      budzetText = "Do negocjacji"
    }

    // 1. Wyślij email potwierdzający do klienta
    try {
      await sendEmailWithTemplate({
        to: session.user.email!,
        templateType: EmailType.POTWIERDZENIE_DODANIA_SPRAWY,
        variables: {
          "{klient}": `${client.imie} ${client.nazwisko}`,
          "{nazwaSprawy}": newCase.nazwaSprawy,
          "{kategoria}": allCategoryNames,
          "{budzet}": budzetText,
          "{linkDoSprawy}": `${baseUrl}/panel-klienta/sprawy/${newCase.id}`,
        }
      })
    } catch (emailError) {
      console.error("Failed to send case confirmation email to client:", emailError)
    }

    // Powiadom ekspertów o nowej sprawie — pomiń, dopóki klient nie potwierdzi e-maila
    // (sprawa i tak jest wtedy niewidoczna dla ekspertów, patrz buildLawFirmCaseWhereInput).
    // Odblokowanie i wysyłka powiadomień: /api/auth/verify-email.
    if (!requiresEmailActivation) {
      await notifyMatchingLawFirmsForCase(newCase.id)
    }

    // Sprawa powstała — bilet spełnił swoją rolę, nie pozwalamy utworzyć nim drugiej
    if (usedCaseCreationTicketToken) {
      await prisma.caseCreationTicket.delete({ where: { token: usedCaseCreationTicketToken } }).catch(() => {})
    }

    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    logErrorToFile("POST /api/cases", error)
    console.error("Error creating case:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
