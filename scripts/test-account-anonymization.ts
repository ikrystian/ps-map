/**
 * Test end-to-end anonimizacji konta. Uruchamiany na KOPII bazy:
 *   DATABASE_URL="file:/ścieżka/test.db" bun run scripts/__anonymization-test.ts
 */
import {
  ANONYMIZED_COMPANY_NAME,
  ANONYMIZED_NAME,
  ANONYMIZED_TEXT,
  anonymizeUserAccount,
  anonymizedEmailFor,
  getAccountRetentionSummary,
  purgeAccountRetention,
} from "@/lib/account-anonymization"
import { prisma } from "@/lib/prisma"

const failures: string[] = []
const checks: string[] = []

function check(label: string, condition: boolean) {
  if (condition) {
    checks.push(`  ✓ ${label}`)
  } else {
    failures.push(`  ✗ ${label}`)
  }
}

async function main() {
  const suffix = Date.now()
  const category = await prisma.category.findFirst({ select: { id: true } })
  const voivodeship = await prisma.voivodeship.findFirst({ select: { id: true } })
  if (!category || !voivodeship) throw new Error("Brak słowników w bazie testowej")

  // --------------------------------------------------------------------
  // 1. Dane testowe: klient + ekspert + powiązania
  // --------------------------------------------------------------------
  const clientEmail = `test-klient-${suffix}@example.com`
  const expertEmail = `test-ekspert-${suffix}@example.com`

  const clientUser = await prisma.user.create({
    data: {
      email: clientEmail,
      name: "Jan Kowalski",
      password: "$2a$10$hash",
      emailVerified: new Date(),
      image: "/api/files/avatar-test.png",
      role: "CLIENT",
      imie: "Jan",
      nazwisko: "Kowalski",
      numerTelefonu: "500600700",
      adres: "ul. Testowa 1",
      kodPocztowy: "00-001",
      miasto: "Warszawa",
      voivodeshipId: voivodeship.id,
      latitude: 52.1,
      longitude: 21.0,
      client: {
        create: {
          clientType: "BUSINESS",
          imie: "Jan",
          nazwisko: "Kowalski",
          nazwa: "Firma Kowalski sp. z o.o.",
          nip: "1234567890",
          regon: "123456789",
          punktySaldo: 50,
          zgodaRegulamin: true,
        },
      },
      notificationSettings: { create: {} },
      loginHistory: {
        create: { success: true, ipAddress: "83.24.1.1", userAgent: "Mozilla/5.0", location: "Warszawa, Polska" },
      },
      notifications: {
        create: { typ: "SYSTEM", tytul: "Powitanie", tresc: "Witaj Janie Kowalski" },
      },
    },
    include: { client: true },
  })

  const expertUser = await prisma.user.create({
    data: {
      email: expertEmail,
      name: "Anna Nowak",
      password: "$2a$10$hash",
      emailVerified: new Date(),
      role: "LAW_FIRM",
      imie: "Anna",
      nazwisko: "Nowak",
      numerTelefonu: "600700800",
      adres: "ul. Ekspercka 2",
      lawFirm: {
        create: {
          typ: "OSOBA_FIZYCZNA",
          nazwa: "Kancelaria Nowak",
          slug: `kancelaria-nowak-${suffix}`,
          nip: `99${suffix}`.slice(0, 10),
          regon: "987654321",
          opis: "Opis kancelarii",
          logo: "/api/files/logo-test.png",
          linkLinkedIn: "https://linkedin.com/in/anna-nowak",
          typOferty: "WSZYSTKIE",
          punktySaldo: 120,
          zweryfikowana: true,
          aktywna: true,
        },
      },
      companyData: {
        create: {
          COMPANY_name: "Anna Nowak",
          COMPANY_nip: "9876543210",
          COMPANY_pesel: "85010112345",
          COMPANY_residenceAddress: "ul. Ekspercka 2, Warszawa",
        },
      },
    },
    include: { lawFirm: true },
  })

  const clientId = clientUser.client!.id
  const lawFirmId = expertUser.lawFirm!.id

  const testCase = await prisma.case.create({
    data: {
      clientId,
      typSprawy: "FIRMA",
      categoryId: category.id,
      nazwaSprawy: "Sprawa testowa",
      opisSprawy: "Opis sprawy zawierający dane: Jan Kowalski, tel. 500600700",
      zalaczniki: JSON.stringify(["/api/uploads/documents/nieistniejacy.pdf"]),
      imieNazwisko: "Jan Kowalski",
      telefonKontakt: "500600700",
      preferowanyKontakt: "EMAIL",
      voivodeshipId: voivodeship.id,
      status: "OFERTY_OTRZYMANE",
    },
  })

  const offer = await prisma.offer.create({
    data: {
      caseId: testCase.id,
      lawFirmId,
      kwotaNetto: 1000,
      vat: 23,
      kwotaBrutto: 1230,
      terminRealizacjiDni: 14,
      opisOferty: "Oferta testowa",
      zakresUslug: "Zakres testowy",
      warunkiPlatnosci: "PRZELEW_14",
      status: "ZLOZONA",
    },
  })

  const order = await prisma.order.create({
    data: {
      lawFirmId,
      orderType: "POINTS",
      kwota: 500,
      metodaPlatnosci: "PRZELEWY24",
      statusPlatnosci: "ZAPLACONE",
      zaplaconoData: new Date(),
      daneFaktury: JSON.stringify({ nazwa: "Kancelaria Nowak", nip: "9876543210", adres: "ul. Ekspercka 2" }),
    },
  })

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: `FV/TEST/${suffix}`,
      orderId: order.id,
      lawFirmId,
      buyerName: "Kancelaria Nowak",
      buyerNIP: "9876543210",
      buyerAddress: "ul. Ekspercka 2",
      buyerPostalCode: "00-002",
      buyerCity: "Warszawa",
      netAmount: 500,
      vatAmount: 115,
      grossAmount: 615,
      dueDate: new Date(),
    },
  })

  const review = await prisma.review.create({
    data: {
      lawFirmId,
      clientId,
      ocenaOgolna: 5,
      tytulOpinii: "Świetna współpraca",
      trescOpinii: "Bardzo profesjonalna obsługa, polecam każdemu klientowi.",
    },
  })

  const conversation = await prisma.conversation.create({
    data: {
      clientUserId: clientUser.id,
      lawFirmUserId: expertUser.id,
      lastMessageText: "Dzień dobry, Jan Kowalski",
      lastMessageAt: new Date(),
      messages: {
        create: { senderId: clientUser.id, content: "Wiadomość testowa", contentIv: null },
      },
    },
  })

  await prisma.message.create({
    data: {
      senderId: clientUser.id,
      receiverId: expertUser.id,
      caseId: testCase.id,
      temat: "Zapytanie",
      tresc: `Kontakt: ${clientEmail}, tel. 500600700`,
    },
  })

  await prisma.newsletter.create({ data: { email: clientEmail, imie: "Jan" } })
  await prisma.emailLog.create({
    data: { to: clientEmail, subject: "Witamy", content: "Witaj Janie", status: "SUCCESS" },
  })
  await prisma.contactForm.create({
    data: {
      imieNazwisko: "Jan Kowalski",
      email: clientEmail,
      telefon: "500600700",
      temat: "INFORMACJA",
      wiadomosc: `Proszę o kontakt na ${clientEmail}`,
    },
  })
  await prisma.systemLog.create({
    data: {
      level: "INFO",
      action: "USER_LOGIN",
      message: `Zalogowano użytkownika ${clientEmail}`,
      userId: clientUser.id,
      ipAddress: "83.24.1.1",
      userAgent: "Mozilla/5.0",
      metadata: JSON.stringify({ email: clientEmail, telefon: "500600700", nested: { imie: "Jan" } }),
    },
  })
  await prisma.favoriteLawFirm.create({ data: { clientId, lawFirmId } })
  await prisma.consultationBooking.create({
    data: {
      lawFirmId,
      clientId,
      consultationDate: new Date(Date.now() + 86400000),
      duration: 30,
      price: 200,
      topic: "Konsultacja w sprawie umowy",
      clientContact: `${clientEmail} / 500600700`,
      status: "ACCEPTED",
      googleMeetUrl: "https://meet.google.com/test",
    },
  })
  await prisma.certificate.create({
    data: {
      lawFirmId,
      nazwaCertyfikatu: "Certyfikat",
      wydawca: "Izba",
      dataUzyskania: new Date(),
      skanCertyfikatu: "/api/uploads/certificates/test.pdf",
    },
  })
  await prisma.service.create({
    data: { lawFirmId, nazwaUslugi: "Porada", opisUslugi: "Opis", jednostka: "ZA_USLUGE" },
  })
  await prisma.session.create({
    data: { sessionToken: `token-${suffix}`, userId: clientUser.id, expires: new Date(Date.now() + 86400000) },
  })

  // --------------------------------------------------------------------
  // 2. Podsumowanie retencji przed usunięciem
  // --------------------------------------------------------------------
  const summary = await getAccountRetentionSummary(expertUser.id)
  check("podsumowanie retencji zwraca liczbę faktur", summary.invoices === 1)
  check("podsumowanie retencji zwraca liczbę ofert", summary.offers === 1)
  check(
    "retencja księgowa sięga 5 lat po roku wystawienia faktury",
    summary.retentionUntil.getFullYear() >= new Date().getFullYear() + 5
  )

  // --------------------------------------------------------------------
  // 3. Anonimizacja konta klienta
  // --------------------------------------------------------------------
  const clientResult = await anonymizeUserAccount({
    userId: clientUser.id,
    requestedBy: "SELF",
    reason: "test",
  })

  const anonClient = await prisma.user.findUnique({
    where: { id: clientUser.id },
    include: { client: true, accountDeletion: true },
  })

  check("e-mail zastąpiony adresem anonimowym", anonClient?.email === anonymizedEmailFor(clientUser.id))
  check("nazwa użytkownika zanonimizowana", anonClient?.name === ANONYMIZED_NAME)
  check("hasło usunięte", anonClient?.password === null)
  check("weryfikacja e-mail wyczyszczona", anonClient?.emailVerified === null)
  check("zdjęcie profilowe usunięte", anonClient?.image === null)
  check(
    "dane osobowe wyczyszczone",
    anonClient?.imie === null &&
      anonClient?.nazwisko === null &&
      anonClient?.numerTelefonu === null &&
      anonClient?.adres === null &&
      anonClient?.kodPocztowy === null &&
      anonClient?.miasto === null &&
      anonClient?.voivodeshipId === null &&
      anonClient?.latitude === null &&
      anonClient?.longitude === null
  )
  check("konto oznaczone jako usunięte", anonClient?.deletedAt !== null && anonClient?.status === "INACTIVE")
  check("profil klienta zanonimizowany", anonClient?.client?.nazwa === null && anonClient?.client?.nip === null)
  check("saldo punktów wyzerowane", anonClient?.client?.punktySaldo === 0)
  check("rejestr anonimizacji utworzony", Boolean(anonClient?.accountDeletion))
  check(
    "rejestr zawiera hash e-maila zamiast adresu",
    (anonClient?.accountDeletion?.emailHash.length ?? 0) === 64
  )

  const anonCase = await prisma.case.findUnique({ where: { id: testCase.id } })
  check("dane kontaktowe w sprawie usunięte", anonCase?.imieNazwisko === ANONYMIZED_NAME)
  check("telefon w sprawie usunięty", anonCase?.telefonKontakt === ANONYMIZED_TEXT)
  check("sprawa w toku anulowana i zarchiwizowana", anonCase?.status === "ANULOWANA" && anonCase?.isArchived === true)
  check("opis sprawy zachowany do końca retencji", anonCase?.opisSprawy.includes("Opis sprawy") === true)

  const anonOffer = await prisma.offer.findUnique({ where: { id: offer.id } })
  check("aktywna oferta wygasła", anonOffer?.status === "WYGASLA")

  const anonReview = await prisma.review.findUnique({ where: { id: review.id } })
  check("opinia oznaczona jako anonimowa", anonReview?.anonimowa === true)
  check("treść opinii zachowana", anonReview?.trescOpinii.includes("profesjonalna") === true)

  const anonBooking = await prisma.consultationBooking.findFirst({ where: { clientId } })
  check("kontakt w konsultacji usunięty", anonBooking?.clientContact === ANONYMIZED_TEXT)
  check("konsultacja anulowana", anonBooking?.status === "CANCELLED")
  check("link do spotkania usunięty", anonBooking?.googleMeetUrl === null)

  check("sesje usunięte", (await prisma.session.count({ where: { userId: clientUser.id } })) === 0)
  check("powiadomienia usunięte", (await prisma.notification.count({ where: { userId: clientUser.id } })) === 0)
  check(
    "ustawienia powiadomień usunięte",
    (await prisma.notificationSettings.count({ where: { userId: clientUser.id } })) === 0
  )
  check("newsletter usunięty", (await prisma.newsletter.count({ where: { email: clientEmail } })) === 0)
  check("logi e-mail usunięte", (await prisma.emailLog.count({ where: { to: clientEmail } })) === 0)
  check("ulubione usunięte", (await prisma.favoriteLawFirm.count({ where: { clientId } })) === 0)

  const anonLogin = await prisma.loginHistory.findFirst({ where: { userId: clientUser.id } })
  check(
    "historia logowań bez IP, UA i lokalizacji",
    anonLogin !== null && anonLogin.ipAddress === null && anonLogin.userAgent === null && anonLogin.location === null
  )

  const anonSystemLog = await prisma.systemLog.findFirst({
    where: { userId: clientUser.id, action: "USER_LOGIN" },
  })
  check("log systemowy nie zawiera e-maila", anonSystemLog?.message.includes(clientEmail) === false)
  check("metadane logu zredagowane", anonSystemLog?.metadata?.includes(clientEmail) === false)
  check("log systemowy bez IP", anonSystemLog?.ipAddress === null)

  const anonContactForm = await prisma.contactForm.findFirst({ where: { imieNazwisko: ANONYMIZED_NAME } })
  check("formularz kontaktowy zanonimizowany", anonContactForm?.telefon === null)
  check("treść formularza zredagowana", anonContactForm?.wiadomosc.includes(clientEmail) === false)

  const anonConversation = await prisma.conversation.findUnique({ where: { id: conversation.id } })
  check("konwersacja ukryta po stronie klienta", anonConversation?.isDeletedByClient === true)
  check("konwersacja widoczna dla eksperta", anonConversation?.isDeletedByLawFirm === false)

  check(
    "podstawa prawna zapisana w rejestrze",
    clientResult.legalBasis.some((entry) => entry.model === "Case")
  )

  // --------------------------------------------------------------------
  // 4. Anonimizacja konta eksperta
  // --------------------------------------------------------------------
  await anonymizeUserAccount({ userId: expertUser.id, requestedBy: "ADMIN", requestedByUserId: null })

  const anonExpert = await prisma.user.findUnique({
    where: { id: expertUser.id },
    include: { lawFirm: true, companyData: true },
  })

  check("nazwa kancelarii zanonimizowana", anonExpert?.lawFirm?.nazwa === ANONYMIZED_COMPANY_NAME)
  check("slug profilu zmieniony", anonExpert?.lawFirm?.slug.startsWith("usuniete-konto-") === true)
  check(
    "identyfikatory firmy usunięte",
    anonExpert?.lawFirm?.nip === null && anonExpert?.lawFirm?.regon === null
  )
  check("profil publiczny wyczyszczony", anonExpert?.lawFirm?.logo === null && anonExpert?.lawFirm?.opis === "")
  check("linki społecznościowe usunięte", anonExpert?.lawFirm?.linkLinkedIn === null)
  check("profil dezaktywowany", anonExpert?.lawFirm?.aktywna === false)
  check("dane z Białej listy MF usunięte", anonExpert?.companyData === null)
  check("certyfikaty usunięte", (await prisma.certificate.count({ where: { lawFirmId } })) === 0)
  check("cennik usług usunięty", (await prisma.service.count({ where: { lawFirmId } })) === 0)
  check("opinie o kancelarii dezaktywowane", (await prisma.review.findUnique({ where: { id: review.id } }))?.aktywna === false)

  const retainedInvoice = await prisma.invoice.findUnique({ where: { id: invoice.id } })
  check("faktura zachowana w niezmienionej postaci", retainedInvoice?.buyerName === "Kancelaria Nowak")
  check("NIP nabywcy zachowany na fakturze", retainedInvoice?.buyerNIP === "9876543210")

  const retainedOrder = await prisma.order.findUnique({ where: { id: order.id } })
  check("opłacone zamówienie zachowane", retainedOrder?.statusPlatnosci === "ZAPLACONE")
  check("dane do faktury zachowane do końca retencji", retainedOrder?.daneFaktury !== null)

  // --------------------------------------------------------------------
  // 5. Czyszczenie po upływie okresu retencji
  // --------------------------------------------------------------------
  await purgeAccountRetention(expertUser.id)
  await purgeAccountRetention(clientUser.id)

  const purgedInvoice = await prisma.invoice.findUnique({ where: { id: invoice.id } })
  check("po retencji dane nabywcy zanonimizowane", purgedInvoice?.buyerName === ANONYMIZED_COMPANY_NAME)
  check("po retencji NIP nabywcy usunięty", purgedInvoice?.buyerNIP === null)
  check("po retencji faktura nadal istnieje", purgedInvoice !== null)

  const purgedOrder = await prisma.order.findUnique({ where: { id: order.id } })
  check("po retencji dane do faktury usunięte", purgedOrder?.daneFaktury === null)
  check("po retencji kwota zamówienia zachowana", purgedOrder?.kwota === 500)

  const purgedCase = await prisma.case.findUnique({ where: { id: testCase.id } })
  check("po retencji opis sprawy usunięty", purgedCase?.opisSprawy === ANONYMIZED_TEXT)
  check("po retencji załączniki sprawy usunięte", purgedCase?.zalaczniki === null)

  const purgedMessage = await prisma.message.findFirst({ where: { senderId: clientUser.id } })
  check("po retencji treść wiadomości usunięta", purgedMessage?.tresc === ANONYMIZED_TEXT)

  const purgedChat = await prisma.chatMessage.findFirst({ where: { senderId: clientUser.id } })
  check("po retencji treść czatu usunięta", purgedChat?.content === ANONYMIZED_TEXT)
  check("po retencji wektor szyfrowania wyczyszczony", purgedChat?.contentIv === null)

  const deletionRecord = await prisma.accountDeletion.findUnique({ where: { userId: clientUser.id } })
  check("rejestr oznaczony jako wyczyszczony", deletionRecord?.purgedAt !== null)

  // --------------------------------------------------------------------
  // 6. Ponowna anonimizacja jest blokowana
  // --------------------------------------------------------------------
  let blocked = false
  try {
    await anonymizeUserAccount({ userId: clientUser.id, requestedBy: "SELF" })
  } catch (error) {
    blocked = (error as Error).name === "AccountAlreadyAnonymizedError"
  }
  check("ponowna anonimizacja odrzucona", blocked)

  // --------------------------------------------------------------------
  // 7. Wynik
  // --------------------------------------------------------------------
  console.log(checks.join("\n"))
  if (failures.length > 0) {
    console.log("\nBŁĘDY:")
    console.log(failures.join("\n"))
  }
  console.log(`\nWynik: ${checks.length} OK, ${failures.length} błędów`)
  process.exit(failures.length > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error("Test przerwany:", error)
  process.exit(1)
})
