import { prisma } from "@/lib/prisma"
import * as crypto from "crypto"

export interface KsefConfig {
  enabled: boolean
  nip: string
  token: string
  env: "test" | "prod"
}

/** Per-request timeout for KSeF HTTP calls (ms) */
const KSEF_TIMEOUT_MS = 30000
/** Maximum number of attempts (1 initial + retries) for transient failures */
const KSEF_MAX_ATTEMPTS = 3
/** Base delay for exponential backoff between retries (ms) */
const KSEF_RETRY_BASE_DELAY_MS = 1000

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Determines whether an HTTP status code represents a transient error
 * that is safe to retry (timeouts, rate limiting, server-side failures).
 */
function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500
}

/**
 * Performs a fetch with an abort-based timeout and automatic retries on
 * transient failures (network errors, timeouts, 408/429/5xx responses).
 * Uses exponential backoff between attempts.
 *
 * @param label Human-readable name of the operation, used in error messages/logs.
 */
async function ksefFetch(
  url: string,
  init: RequestInit = {},
  label = "KSeF request"
): Promise<Response> {
  let lastError: unknown

  for (let attempt = 1; attempt <= KSEF_MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), KSEF_TIMEOUT_MS)

    try {
      const response = await fetch(url, { ...init, signal: controller.signal })

      // Retry transient server-side / throttling responses
      if (isRetryableStatus(response.status) && attempt < KSEF_MAX_ATTEMPTS) {
        lastError = new Error(`${label} returned HTTP ${response.status}`)
        console.warn(`KSeF: ${label} HTTP ${response.status} (attempt ${attempt}/${KSEF_MAX_ATTEMPTS}), retrying...`)
        await sleep(KSEF_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
        continue
      }

      return response
    } catch (error: any) {
      const isTimeout = error?.name === "AbortError"
      lastError = isTimeout
        ? new Error(`${label} timed out after ${KSEF_TIMEOUT_MS}ms`)
        : error

      if (attempt < KSEF_MAX_ATTEMPTS) {
        console.warn(
          `KSeF: ${label} ${isTimeout ? "timed out" : "failed"} (attempt ${attempt}/${KSEF_MAX_ATTEMPTS}), retrying...`
        )
        await sleep(KSEF_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
        continue
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`${label} failed after ${KSEF_MAX_ATTEMPTS} attempts`)
}

/**
 * Fetches KSeF settings from the database
 */
export async function getKsefConfig(): Promise<KsefConfig> {
  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: ["ksefEnabled", "ksefNip", "ksefToken", "ksefEnv"]
      }
    }
  })

  return {
    enabled: settings.find(s => s.key === "ksefEnabled")?.value === "true",
    nip: (settings.find(s => s.key === "ksefNip")?.value || "1234567890").trim(),
    // Trim chroni przed spacją/nową linią z kopiowania — KSeF odrzuca wtedy
    // token z błędem "Nieprawidłowe kodowanie tokenu".
    token: (settings.find(s => s.key === "ksefToken")?.value || "").trim(),
    env: (settings.find(s => s.key === "ksefEnv")?.value as "test" | "prod") || "test"
  }
}

/**
 * Formats date to YYYY-MM-DD
 */
function formatDate(d: Date | string) {
  const date = new Date(d)
  return date.toISOString().split("T")[0]
}

/**
 * Formats datetime to ISO with Z
 */
function formatDateTime(d: Date | string) {
  const date = new Date(d)
  return date.toISOString().replace(/\.\d+Z$/, "Z")
}

/**
 * Escapes XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;"
      case ">": return "&gt;"
      case "&": return "&amp;"
      case "'": return "&apos;"
      case "\"": return "&quot;"
      default: return c
    }
  })
}

/**
 * Generates an XML invoice compliant with KSeF FA(3) schema (version 1-0E,
 * namespace http://crd.gov.pl/wzor/2025/06/25/13775/).
 *
 * Kwoty obliczane metodą "od netto" per reguła semantyczna KSeF W_019:
 *   P_14_1 = round(P_13_1 × stawka/100, 2)
 *   P_15   = P_13_1 + P_14_1
 */
export function generateInvoiceXml(invoice: any, sellerNipOverride?: string): string {
  const issueDateStr = formatDate(invoice.issueDate)
  const saleDateStr = formatDate(invoice.saleDate)
  // DataWytworzeniaFa = chwila wytworzenia dokumentu XML (nie data wystawienia faktury).
  const creationDateTimeStr = formatDateTime(new Date())

  // NIP sprzedawcy musi być zgodny z NIP-em uwierzytelnionego kontekstu KSeF,
  // inaczej KSeF odrzuci fakturę.
  const sellerNip = sellerNipOverride?.replace(/\D/g, "") || "1234567890"
  const sellerName = "Prosta Sprawa Sp. z o.o."
  const sellerPostalCode = "00-001"
  const sellerCity = "Warszawa"

  const buyerNip = invoice.buyerNIP ? invoice.buyerNIP.replace(/\D/g, "") : null
  const buyerAddressL1 = invoice.buyerAddress || ""
  const buyerAddressL2 = [invoice.buyerPostalCode, invoice.buyerCity].filter(Boolean).join(" ")
  const buyerName = invoice.buyerName

  // Obliczenie kwot zgodnie z regułą W_019: VAT = round(netto × stawka/100, 2).
  // Dzięki temu P_14_1 zawsze = round(P_13_1 × stawka/100, 2) — wymóg KSeF.
  const vatRateNum: number = invoice.vatRate  // np. 23 dla stawki 23%
  const netStr = invoice.netAmount.toFixed(2)
  const vatStr = (Math.round(parseFloat(netStr) * vatRateNum) / 100).toFixed(2)
  const grossStr = (parseFloat(netStr) + parseFloat(vatStr)).toFixed(2)
  const vatRateStr = String(vatRateNum)

  const itemDescription = invoice.order.orderType === "SUBSCRIPTION"
    ? `Subskrypcja: ${invoice.order.subscriptionPlan?.nazwa || "Pakiet subskrypcji"}`
    : "Pakiet punktów"

  // FA(3) XML — schemat http://crd.gov.pl/wzor/2025/06/25/13775/
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Faktura xmlns="http://crd.gov.pl/wzor/2025/06/25/13775/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://crd.gov.pl/wzor/2025/06/25/13775/ schemat.xsd">
  <Naglowek>
    <KodFormularza kodSystemowy="FA (3)" wersjaSchemy="1-0E">FA</KodFormularza>
    <WariantFormularza>3</WariantFormularza>
    <DataWytworzeniaFa>${creationDateTimeStr}</DataWytworzeniaFa>
  </Naglowek>
  <Podmiot1>
    <DaneIdentyfikacyjne>
      <NIP>${sellerNip}</NIP>
      <Nazwa>${escapeXml(sellerName)}</Nazwa>
    </DaneIdentyfikacyjne>
    <Adres>
      <KodKraju>PL</KodKraju>
      <AdresL1>${escapeXml("ul. Przykładowa 123")}</AdresL1>
      <AdresL2>${escapeXml(sellerPostalCode + " " + sellerCity)}</AdresL2>
    </Adres>
  </Podmiot1>
  <Podmiot2>
    <DaneIdentyfikacyjne>
      ${buyerNip ? `<NIP>${buyerNip}</NIP>` : `<BrakID>1</BrakID>`}
      <Nazwa>${escapeXml(buyerName || "Nabywca")}</Nazwa>
    </DaneIdentyfikacyjne>
    <Adres>
      <KodKraju>PL</KodKraju>
      <AdresL1>${escapeXml(buyerAddressL1 || "Brak adresu")}</AdresL1>
      ${buyerAddressL2 ? `<AdresL2>${escapeXml(buyerAddressL2)}</AdresL2>` : ""}
    </Adres>
    <JST>2</JST>
    <GV>2</GV>
  </Podmiot2>
  <Fa>
    <KodWaluty>PLN</KodWaluty>
    <P_1>${issueDateStr}</P_1>
    <P_2>${escapeXml(invoice.invoiceNumber)}</P_2>
    <P_6>${saleDateStr}</P_6>
    <P_13_1>${netStr}</P_13_1>
    <P_14_1>${vatStr}</P_14_1>
    <P_15>${grossStr}</P_15>
    <Adnotacje>
      <P_16>2</P_16>
      <P_17>2</P_17>
      <P_18>2</P_18>
      <P_18A>2</P_18A>
      <Zwolnienie>
        <P_19N>1</P_19N>
      </Zwolnienie>
      <NoweSrodkiTransportu>
        <P_22N>1</P_22N>
      </NoweSrodkiTransportu>
      <P_23>2</P_23>
      <PMarzy>
        <P_PMarzyN>1</P_PMarzyN>
      </PMarzy>
    </Adnotacje>
    <RodzajFaktury>VAT</RodzajFaktury>
    <FaWiersz>
      <NrWierszaFa>1</NrWierszaFa>
      <P_7>${escapeXml(itemDescription)}</P_7>
      <P_8A>szt.</P_8A>
      <P_8B>1</P_8B>
      <P_9A>${netStr}</P_9A>
      <P_11>${netStr}</P_11>
      <P_12>${vatRateStr}</P_12>
    </FaWiersz>
  </Fa>
</Faktura>`

  return xml.trim()
}

/**
 * Converts a base64 DER certificate into a PEM format string
 */
function derToPem(derBase64: string): string {
  const formatted = derBase64.match(/.{1,64}/g)?.join("\n") || derBase64
  return `-----BEGIN CERTIFICATE-----\n${formatted}\n-----END CERTIFICATE-----`
}

/**
 * Returns the KSeF 2.0 API base URL for the configured environment.
 */
function ksefBaseUrl(config: KsefConfig): string {
  return config.env === "prod"
    ? "https://api.ksef.mf.gov.pl/api/v2"
    : "https://api-test.ksef.mf.gov.pl/api/v2"
}

/**
 * Authenticates against KSeF 2.0 (certificates → challenge → token → redeem)
 * and returns a JWT access token plus the public key used for symmetric-key
 * encryption when opening an interactive session.
 *
 * Extracted into a helper so both invoice submission and status/UPO polling
 * can reuse the same authentication flow.
 */
async function ksefAuthenticate(
  baseUrl: string,
  config: KsefConfig
): Promise<{ accessToken: string; symPublicKey: crypto.KeyObject; symPublicKeyId?: string }> {
  // 1. Fetch certificates
  const certsResponse = await ksefFetch(
    `${baseUrl}/security/public-key-certificates`,
    {},
    "Fetch certificates"
  )
  if (!certsResponse.ok) {
    throw new Error(`Failed to fetch KSeF security certificates. HTTP Status ${certsResponse.status}`)
  }
  const certsData = await certsResponse.json()
  // API zwraca tablicę certyfikatów, a `usage` jest tablicą zastosowań,
  // np. [{ certificate: "...", usage: ["KsefTokenEncryption"] }, ...]
  const certs: any[] = Array.isArray(certsData)
    ? certsData
    : certsData.certificates || certsData.subjects || []
  const findByUsage = (usage: string) =>
    certs.find((c: any) =>
      Array.isArray(c.usage) ? c.usage.includes(usage) : c.usage === usage
    )
  const tokenCertObj = findByUsage("KsefTokenEncryption") || certs[0]
  const symCertObj = findByUsage("SymmetricKeyEncryption") || certs[0]

  if (!tokenCertObj || !symCertObj) {
    throw new Error("Could not identify required encryption certificates from KSeF")
  }

  const tokenPublicKey = crypto.createPublicKey(derToPem(tokenCertObj.certificate))
  const symPublicKey = crypto.createPublicKey(derToPem(symCertObj.certificate))

  // 2. Fetch challenge
  const cleanedNip = config.nip.replace(/\D/g, "")
  const challengeResponse = await ksefFetch(`${baseUrl}/auth/challenge`, {
    method: "POST",
  }, "Auth challenge")

  if (!challengeResponse.ok) {
    throw new Error(`KSeF Auth Challenge failed: ${challengeResponse.statusText}`)
  }
  const challengeData = await challengeResponse.json()
  const challenge = challengeData.challenge
  // KSeF 2.0 wymaga znacznika czasu challenge jako liczby milisekund epoch
  // (format szyfrowanego ciągu: "{token}|{timestampMs}").
  const challengeTimestampMs: number =
    challengeData.timestampMs ?? new Date(challengeData.timestamp).getTime()

  // 3. Encrypt Authorization Token
  const textToEncrypt = `${config.token}|${challengeTimestampMs}`
  const encryptedToken = crypto.publicEncrypt({
    key: tokenPublicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256",
  }, Buffer.from(textToEncrypt, "utf8"))

  // 4. Authenticate and get temporary token
  const tokenResponse = await ksefFetch(`${baseUrl}/auth/ksef-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      challenge,
      contextIdentifier: { type: "Nip", value: cleanedNip },
      encryptedToken: encryptedToken.toString("base64"),
      ...(tokenCertObj.publicKeyId ? { publicKeyId: tokenCertObj.publicKeyId } : {}),
    }),
  }, "Token authentication")

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    throw new Error(`KSeF Token Authentication failed (HTTP ${tokenResponse.status}): ${errorText}`)
  }
  const tokenData = await tokenResponse.json()
  const tempToken = tokenData.authenticationToken?.token
  const authReferenceNumber = tokenData.referenceNumber
  if (!tempToken || !authReferenceNumber) {
    throw new Error("KSeF Token Authentication: missing authenticationToken/referenceNumber in response")
  }

  // 4b. Poll authentication operation status until it completes
  // (code 100 = w toku, 200 = sukces, 4xx = niepowodzenie).
  const authHeaders = { Authorization: `Bearer ${tempToken}` }
  let authCompleted = false
  for (let i = 0; i < 20; i++) {
    const statusResponse = await ksefFetch(
      `${baseUrl}/auth/${authReferenceNumber}`,
      { headers: authHeaders },
      "Auth status check"
    )
    if (!statusResponse.ok) {
      throw new Error(`KSeF Auth status check failed: HTTP ${statusResponse.status}`)
    }
    const statusData = await statusResponse.json()
    const code = statusData.status?.code
    if (code === 200) {
      authCompleted = true
      break
    }
    if (typeof code === "number" && code >= 400) {
      const details = [statusData.status?.description, ...(statusData.status?.details || [])]
        .filter(Boolean)
        .join("; ")
      throw new Error(`KSeF authentication failed (status ${code}): ${details}`)
    }
    await sleep(1000)
  }
  if (!authCompleted) {
    throw new Error("KSeF authentication did not complete in time")
  }

  // 5. Redeem Token (Get JWT Access Token) — authorized with the temporary
  // authenticationToken; the token pair can only be redeemed once.
  const redeemResponse = await ksefFetch(`${baseUrl}/auth/token/redeem`, {
    method: "POST",
    headers: authHeaders,
  }, "Token redeem")

  if (!redeemResponse.ok) {
    const errorText = await redeemResponse.text()
    throw new Error(`KSeF Token Redeem failed (HTTP ${redeemResponse.status}): ${errorText}`)
  }
  const redeemData = await redeemResponse.json()
  const accessToken = redeemData.accessToken?.token
  if (!accessToken) {
    throw new Error("KSeF Token Redeem: missing accessToken in response")
  }

  return { accessToken, symPublicKey, symPublicKeyId: symCertObj.publicKeyId }
}

/**
 * Sends an invoice to KSeF (real API call or simulated run if keys are not set).
 *
 * Guarded against duplicate submission: an invoice that is already PENDING,
 * SENT or ACCEPTED will not be sent again (duplicating a document in KSeF has
 * legal/accounting consequences). The transition to PENDING is performed as an
 * atomic conditional update, so concurrent callers cannot both submit.
 */
export async function sendInvoiceToKsef(invoiceId: string, forceReal = false): Promise<boolean> {
  // Fetch invoice details
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      order: {
        include: {
          subscriptionPlan: true
        }
      }
    }
  })

  if (!invoice) {
    console.error(`KSeF: Invoice ${invoiceId} not found in database`)
    return false
  }

  // === Ochrona przed podwójną wysyłką (idempotencja + wyścig współbieżny) ===
  // Faktura już zaakceptowana przez KSeF — nic nie robimy (idempotentny sukces).
  if (invoice.ksefStatus === "ACCEPTED") {
    console.log(`KSeF: Invoice ${invoice.invoiceNumber} already ACCEPTED, skipping resend.`)
    return true
  }
  // Faktura w trakcie wysyłki lub już wysłana (oczekuje UPO) — nie wysyłamy
  // ponownie, bo spowodowałoby to duplikat dokumentu w KSeF.
  if (invoice.ksefStatus === "PENDING" || invoice.ksefStatus === "SENT") {
    console.warn(`KSeF: Invoice ${invoice.invoiceNumber} is already ${invoice.ksefStatus}, skipping duplicate submission.`)
    return false
  }

  // Atomowe "zajęcie" faktury: przejście do PENDING tylko jeśli status nadal jest
  // null / FAILED / REJECTED. Jeśli równolegle inny proces zdążył ją zająć,
  // updateMany zaktualizuje 0 wierszy i przerywamy, by nie wysłać duplikatu.
  const claim = await prisma.invoice.updateMany({
    where: {
      id: invoiceId,
      OR: [
        { ksefStatus: null },
        { ksefStatus: "FAILED" },
        { ksefStatus: "REJECTED" },
      ],
    },
    data: {
      ksefStatus: "PENDING",
      ksefDiagnostics: null,
    },
  })
  if (claim.count === 0) {
    console.warn(`KSeF: Invoice ${invoice.invoiceNumber} was claimed by another process, skipping.`)
    return false
  }

  // Load KSeF config
  const config = await getKsefConfig()
  const isMock = !config.enabled || !config.token || !config.nip

  if (isMock && !forceReal) {
    // Run simulation — odwzorowuje realny proces: wysyłka kończy się statusem
    // SENT, a numer KSeF i UPO nadaje dopiero polling (checkInvoiceKsefStatus),
    // po którym generowany jest finalny PDF z kodem QR.
    console.log(`KSeF: Running in SIMULATION MODE for invoice ${invoice.invoiceNumber}`)

    const xml = generateInvoiceXml(invoice, config.nip)

    // Simulate async network latency
    await new Promise(resolve => setTimeout(resolve, 1500))

    const ksefReferenceNumber = `REF-${crypto.randomBytes(6).toString("hex").toUpperCase()}`

    // Update database
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ksefStatus: "SENT",
        ksefReferenceNumber,
        ksefXml: xml,
        ksefDiagnostics: "Symulacja KSeF 2.0: Faktura wysłana. Oczekiwanie na przetworzenie i nadanie numeru KSeF."
      }
    })

    // Log to system logs
    await prisma.systemLog.create({
      data: {
        level: "INFO",
        action: "KSEF_INVOICE_SENT_MOCK",
        message: `Symulacja KSeF: Wysłano fakturę ${invoice.invoiceNumber} do KSeF (Mock).`,
        metadata: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          ksefReferenceNumber,
          xmlPreview: xml.substring(0, 1000)
        })
      }
    })

    return true
  }

  // Real KSeF 2.0 Integration
  try {
    const baseUrl = ksefBaseUrl(config)

    console.log(`KSeF: Connecting to KSeF 2.0 (${config.env}) for invoice ${invoice.invoiceNumber}`)

    // 1-5. Authenticate (certificates → challenge → encrypt token → redeem JWT)
    const { accessToken, symPublicKey, symPublicKeyId } = await ksefAuthenticate(baseUrl, config)

    // 6. Generate AES symmetric key and IV for invoice session
    const aesKey = crypto.randomBytes(32)
    const aesIv = crypto.randomBytes(16)

    // Encrypt symmetric key with KSeF public key
    const encryptedSymKey = crypto.publicEncrypt({
      key: symPublicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256"
    }, aesKey)

    // 7. Start interactive session (IV przekazywany przy otwarciu sesji)
    const sessionResponse = await ksefFetch(`${baseUrl}/sessions/online`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        formCode: {
          systemCode: "FA (3)",
          schemaVersion: "1-0E",
          value: "FA"
        },
        encryption: {
          encryptedSymmetricKey: encryptedSymKey.toString("base64"),
          initializationVector: aesIv.toString("base64"),
          ...(symPublicKeyId ? { publicKeyId: symPublicKeyId } : {})
        }
      })
    }, "Online session init")

    if (!sessionResponse.ok) {
      const errTxt = await sessionResponse.text()
      throw new Error(`KSeF Online Session Init failed (HTTP ${sessionResponse.status}): ${errTxt}`)
    }
    const sessionData = await sessionResponse.json()
    const sessionRefNumber = sessionData.referenceNumber

    // 8. Generate invoice XML and encrypt it (AES-256-CBC, PKCS#7)
    const xmlContent = generateInvoiceXml(invoice, config.nip)
    const xmlBuffer = Buffer.from(xmlContent, "utf8")
    const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, aesIv)
    const encryptedBuffer = Buffer.concat([cipher.update(xmlBuffer), cipher.final()])
    const sha256Base64 = (data: Buffer) =>
      crypto.createHash("sha256").update(data).digest("base64")

    // 9. Send Encrypted Invoice (hash i rozmiar jawnego XML oraz szyfrogramu)
    const uploadResponse = await ksefFetch(`${baseUrl}/sessions/online/${sessionRefNumber}/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        invoiceHash: sha256Base64(xmlBuffer),
        invoiceSize: xmlBuffer.length,
        encryptedInvoiceHash: sha256Base64(encryptedBuffer),
        encryptedInvoiceSize: encryptedBuffer.length,
        encryptedInvoiceContent: encryptedBuffer.toString("base64"),
        offlineMode: false
      })
    }, "Upload invoice")

    if (!uploadResponse.ok) {
      const errTxt = await uploadResponse.text()
      throw new Error(`KSeF Upload Invoice failed (HTTP ${uploadResponse.status}): ${errTxt}`)
    }
    const uploadData = await uploadResponse.json()

    // 10. Process upload result. Finalny numer KSeF zostanie nadany dopiero po
    // asynchronicznym przetworzeniu — pobiera go checkInvoiceKsefStatus.
    const invoiceElementRef = uploadData.referenceNumber

    // 11. Close session to trigger processing/UPO generation (best-effort)
    try {
      await ksefFetch(`${baseUrl}/sessions/online/${sessionRefNumber}/close`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${accessToken}` }
      }, "Close session")
    } catch (e) {
      console.warn("KSeF: Failed to close online session (will auto-close):", e)
    }

    // Update database. XML utrwalamy w dokładnie tej postaci, w jakiej został
    // wysłany — jego hash SHA-256 jest częścią weryfikacyjnego kodu QR na PDF.
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ksefStatus: "SENT",
        ksefReferenceNumber: sessionRefNumber,
        ksefXml: xmlContent,
        ksefDiagnostics: "Faktura wysłana do KSeF. Oczekiwanie na przetworzenie i nadanie UPO."
      }
    })

    // Log to system logs
    await prisma.systemLog.create({
      data: {
        level: "INFO",
        action: "KSEF_INVOICE_SENT_REAL",
        message: `Pomyślnie wysłano fakturę ${invoice.invoiceNumber} do KSeF (Real API).`,
        metadata: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          invoiceElementRef,
          ksefReferenceNumber: sessionRefNumber
        })
      }
    })

    return true
  } catch (error: any) {
    console.error("KSeF Error:", error)

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ksefStatus: "FAILED",
        ksefDiagnostics: `Błąd podczas komunikacji z KSeF 2.0: ${error.message || error}`
      }
    })

    await prisma.systemLog.create({
      data: {
        level: "ERROR",
        action: "KSEF_INVOICE_FAILED",
        message: `Błąd wysyłki faktury ${invoice.invoiceNumber} do KSeF.`,
        metadata: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          error: error.message || String(error)
        })
      }
    })

    return false
  }
}

/**
 * Best-effort generation of the final invoice PDF (with KSeF number and QR
 * code) after the invoice has been ACCEPTED. Failures are logged but do not
 * propagate — the PDF is also generated on demand at download time.
 *
 * Dynamiczny import łamie cykl modułów ksef.ts ↔ invoice-pdf.ts.
 */
async function tryGenerateInvoicePdf(invoiceId: string, invoiceNumber: string): Promise<void> {
  try {
    const { generateInvoicePdf } = await import("./invoice-pdf")
    await generateInvoicePdf(invoiceId)
  } catch (error: any) {
    console.error(`KSeF: Failed to generate final PDF for invoice ${invoiceNumber}:`, error)
    await prisma.systemLog.create({
      data: {
        level: "ERROR",
        action: "KSEF_INVOICE_PDF_FAILED",
        message: `Nie udało się wygenerować finalnego PDF faktury ${invoiceNumber}.`,
        metadata: JSON.stringify({ invoiceNumber, error: error.message || String(error) }),
      },
    }).catch(() => {})
  }
}

/**
 * Builds a simulated UPO (Urzędowe Poświadczenie Odbioru) XML document.
 */
function buildMockUpo(ksefNumber: string, referenceNumber: string | null): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<UrzadowePoswiadczenieOdbioru xmlns="http://crd.gov.pl/xml/schematy/upo/2020/01/01/">
  <Naglowek>
    <WersjaSchema>1-0</WersjaSchema>
    <DataOdbioru>${formatDateTime(new Date())}</DataOdbioru>
  </Naglowek>
  <StatusKSeF>ACCEPTED</StatusKSeF>
  <KsefInvoiceNumber>${ksefNumber}</KsefInvoiceNumber>
  <ReferenceNumber>${referenceNumber || ""}</ReferenceNumber>
  <Komunikat>Dokument został poprawnie przyjęty i przetworzony przez system KSeF 2.0.</Komunikat>
</UrzadowePoswiadczenieOdbioru>`
}

/**
 * Sprawdza status faktury wysłanej do KSeF (status "SENT"). Jeśli KSeF
 * zakończył przetwarzanie:
 *  - akceptacja → pobiera UPO i finalny numer KSeF, ustawia status ACCEPTED,
 *  - odrzucenie → ustawia status REJECTED wraz z diagnostyką.
 * Jeśli przetwarzanie wciąż trwa, pozostawia status "SENT".
 *
 * W trybie symulacji (brak konfiguracji KSeF) od razu finalizuje fakturę jako
 * ACCEPTED z wygenerowanym UPO, aby cykl życia faktury się domknął również w dev.
 *
 * Funkcja nigdy nie rzuca wyjątku do wywołującego — przy błędzie sieci/API
 * pozostawia status bez zmian, aby kolejny cykl harmonogramu mógł spróbować ponownie.
 *
 * @returns nowy (lub niezmieniony) status KSeF faktury
 */
export async function checkInvoiceKsefStatus(invoiceId: string): Promise<string> {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
  if (!invoice) {
    console.error(`KSeF: Invoice ${invoiceId} not found for status check`)
    return "NOT_FOUND"
  }

  // Status sprawdzamy wyłącznie dla faktur oczekujących na UPO.
  if (invoice.ksefStatus !== "SENT") {
    return invoice.ksefStatus || "UNKNOWN"
  }

  const config = await getKsefConfig()
  const isMock = !config.enabled || !config.token || !config.nip

  // --- Tryb symulacji: finalizacja jako ACCEPTED z wygenerowanym UPO ---
  if (isMock) {
    const ksefPart1 = (config.nip || "1234567890").replace(/\D/g, "")
    const ksefPart2 = formatDate(new Date()).replace(/-/g, "")
    const ksefPart3 = crypto.randomBytes(8).toString("hex").toUpperCase()
    const ksefNumber = invoice.ksefNumber || `${ksefPart1}-${ksefPart2}-${ksefPart3}-01`

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ksefStatus: "ACCEPTED",
        ksefNumber,
        upoContent: buildMockUpo(ksefNumber, invoice.ksefReferenceNumber),
        ksefDiagnostics: "Symulacja KSeF 2.0: UPO odebrane, faktura zaakceptowana.",
      },
    })

    await prisma.systemLog.create({
      data: {
        level: "INFO",
        action: "KSEF_UPO_RECEIVED_MOCK",
        message: `Symulacja KSeF: odebrano UPO dla faktury ${invoice.invoiceNumber}.`,
        metadata: JSON.stringify({ invoiceNumber: invoice.invoiceNumber, ksefNumber }),
      },
    })

    // Numer KSeF nadany — generujemy finalny PDF z kodem QR
    await tryGenerateInvoicePdf(invoiceId, invoice.invoiceNumber)

    return "ACCEPTED"
  }

  // --- Tryb realny: odpytanie KSeF 2.0 o status sesji i pobranie UPO ---
  if (!invoice.ksefReferenceNumber) {
    // Bez numeru referencyjnego sesji nie ma jak odpytać statusu.
    return "SENT"
  }

  try {
    const baseUrl = ksefBaseUrl(config)
    const { accessToken } = await ksefAuthenticate(baseUrl, config)
    const authHeader = { Authorization: `Bearer ${accessToken}` }

    // Lista faktur w sesji wraz z ich statusami przetwarzania.
    const invoicesRes = await ksefFetch(
      `${baseUrl}/sessions/${invoice.ksefReferenceNumber}/invoices`,
      { headers: authHeader },
      "Session invoices status"
    )
    if (!invoicesRes.ok) {
      // Sesja może być jeszcze nieprzetworzona — zostawiamy SENT do kolejnej próby.
      console.warn(`KSeF: Session ${invoice.ksefReferenceNumber} status HTTP ${invoicesRes.status}, leaving SENT.`)
      return "SENT"
    }

    const data = await invoicesRes.json()
    // Defensywne parsowanie — różne możliwe kształty odpowiedzi KSeF 2.0.
    const items: any[] = data.invoices || data.items || (Array.isArray(data) ? data : [])
    const item = items[0]
    if (!item) {
      return "SENT"
    }

    const statusCode: unknown = item.status?.code ?? item.statusCode ?? item.processingCode
    const ksefNumber: string | undefined = item.ksefNumber || item.ksefInvoiceNumber || invoice.ksefNumber || undefined
    const invoiceRef: string | undefined = item.referenceNumber || item.invoiceReferenceNumber

    // Odrzucenie faktury przez KSeF.
    const isRejected =
      item.status?.processingStatus === "Rejected" ||
      (typeof statusCode === "number" && statusCode >= 400)
    if (isRejected) {
      const reason = item.status?.description || item.description || "Faktura odrzucona przez KSeF"
      // Zbieramy sub-błędy z KSeF (szczegółowe kody walidacji) do diagnostyki.
      const details: string[] = item.status?.details || item.status?.errors || item.errors || []
      const detailsStr = details.length > 0
        ? `\nSzczegóły: ${Array.isArray(details) ? details.map((d: any) => typeof d === "string" ? d : (d.message || d.description || JSON.stringify(d))).join("; ") : JSON.stringify(details)}`
        : ""
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { ksefStatus: "REJECTED", ksefDiagnostics: `KSeF odrzucił fakturę: ${reason}${detailsStr}` },
      })
      await prisma.systemLog.create({
        data: {
          level: "ERROR",
          action: "KSEF_INVOICE_REJECTED",
          message: `Faktura ${invoice.invoiceNumber} odrzucona przez KSeF.`,
          metadata: JSON.stringify({ invoiceNumber: invoice.invoiceNumber, reason, details, rawItem: item }),
        },
      })
      return "REJECTED"
    }

    // Akceptacja — wymaga nadanego finalnego numeru KSeF.
    const isAccepted =
      item.status?.processingStatus === "Accepted" ||
      statusCode === 200 ||
      !!ksefNumber
    if (isAccepted && ksefNumber) {
      // Próba pobrania UPO (best-effort — przy niepowodzeniu pobierzemy później).
      let upoXml: string | null = null
      try {
        const upoUrl = invoiceRef
          ? `${baseUrl}/sessions/${invoice.ksefReferenceNumber}/invoices/${invoiceRef}/upo`
          : `${baseUrl}/sessions/${invoice.ksefReferenceNumber}/invoices/ksef/${ksefNumber}/upo`
        const upoRes = await ksefFetch(upoUrl, { headers: authHeader }, "Fetch UPO")
        if (upoRes.ok) {
          upoXml = await upoRes.text()
        }
      } catch (e) {
        console.warn(`KSeF: Could not fetch UPO for invoice ${invoice.invoiceNumber}:`, e)
      }

      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          ksefStatus: "ACCEPTED",
          ksefNumber,
          upoContent: upoXml,
          ksefDiagnostics: upoXml
            ? "Faktura zaakceptowana przez KSeF, UPO odebrane."
            : "Faktura zaakceptowana przez KSeF. UPO niedostępne — zostanie pobrane w kolejnym cyklu.",
        },
      })
      await prisma.systemLog.create({
        data: {
          level: "INFO",
          action: "KSEF_UPO_RECEIVED",
          message: `Faktura ${invoice.invoiceNumber} zaakceptowana przez KSeF${upoXml ? ", UPO odebrane" : ""}.`,
          metadata: JSON.stringify({ invoiceNumber: invoice.invoiceNumber, ksefNumber }),
        },
      })

      // Numer KSeF nadany — generujemy finalny PDF z kodem QR
      await tryGenerateInvoicePdf(invoiceId, invoice.invoiceNumber)

      return "ACCEPTED"
    }

    // Wciąż w przetwarzaniu — spróbujemy ponownie w kolejnym cyklu.
    return "SENT"
  } catch (error: any) {
    console.error(`KSeF: Status check failed for invoice ${invoice.invoiceNumber}:`, error)
    return "SENT"
  }
}

/**
 * Sprawdza status wszystkich faktur oczekujących na potwierdzenie z KSeF
 * (status "SENT") i — jeśli to możliwe — pobiera ich UPO. Uruchamiane cyklicznie
 * przez harmonogram zadań w tle.
 *
 * @returns podsumowanie: liczba sprawdzonych i wynik per status
 */
export async function pollPendingKsefInvoices(): Promise<{
  checked: number
  accepted: number
  rejected: number
  pending: number
}> {
  const sent = await prisma.invoice.findMany({
    where: { ksefStatus: "SENT" },
    select: { id: true },
  })

  let accepted = 0
  let rejected = 0
  let pending = 0

  for (const inv of sent) {
    const status = await checkInvoiceKsefStatus(inv.id)
    if (status === "ACCEPTED") accepted++
    else if (status === "REJECTED") rejected++
    else pending++
  }

  return { checked: sent.length, accepted, rejected, pending }
}
