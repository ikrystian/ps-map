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
    nip: settings.find(s => s.key === "ksefNip")?.value || "1234567890",
    token: settings.find(s => s.key === "ksefToken")?.value || "",
    env: (settings.find(s => s.key === "ksefEnv")?.value as "test" | "prod") || "test"
  }
}

/**
 * Parses address string into street name and house number for KSeF compliance
 */
function parseAddress(address: string) {
  const cleanAddress = address.trim()
  // Match patterns like "ul. Marszałkowska 10/12", "Marszałkowska 10", "Al. Jerozolimskie 12"
  const match = cleanAddress.match(/^(?:ul\.\s+|al\.\s+|aleja\s+)?(.*?)\s+(\d+[a-zA-Z]*(?:\/\d+)?)$/i)
  if (match) {
    return {
      street: match[1].trim(),
      houseNo: match[2].trim()
    }
  }
  return {
    street: cleanAddress,
    houseNo: "1" // Fallback
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
 * Generates an XML invoice compliant with KSeF FA(3) schema
 */
export function generateInvoiceXml(invoice: any): string {
  const issueDateStr = formatDate(invoice.issueDate)
  const saleDateStr = formatDate(invoice.saleDate)
  const creationDateTimeStr = formatDateTime(invoice.issueDate)

  const sellerNip = "1234567890" // Platform NIP
  const sellerName = "Prosta Sprawa Sp. z o.o."
  const sellerAddress = parseAddress("ul. Przykładowa 123")
  const sellerPostalCode = "00-001"
  const sellerCity = "Warszawa"

  const buyerNip = invoice.buyerNIP ? invoice.buyerNIP.replace(/\D/g, "") : null
  const buyerAddress = parseAddress(invoice.buyerAddress)
  const buyerPostalCode = invoice.buyerPostalCode
  const buyerCity = invoice.buyerCity
  const buyerName = invoice.buyerName

  const netAmount = invoice.netAmount.toFixed(2)
  const vatAmount = invoice.vatAmount.toFixed(2)
  const grossAmount = invoice.grossAmount.toFixed(2)
  const vatRate = String(invoice.vatRate)

  const itemDescription = invoice.order.orderType === "SUBSCRIPTION"
    ? `Subskrypcja: ${invoice.order.subscriptionPlan?.nazwa || "Pakiet subskrypcji"}`
    : "Pakiet punktów"

  // FA(3) XML Template
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Faktura xmlns="http://crd.gov.pl/wzor/2025/06/25/13775/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://crd.gov.pl/wzor/2025/06/25/13775/ schemat.xsd">
  <Naglowek>
    <KodFormularza kodSystemowy="FA (3)" wersjaSchema="1-0E">FA</KodFormularza>
    <WariantFormularza>3</WariantFormularza>
    <DataWytworzeniaFa>${creationDateTimeStr}</DataWytworzeniaFa>
    <KodUrzedu>1472</KodUrzedu>
    <CelZlozenia>1</CelZlozenia>
  </Naglowek>
  <Podmiot1>
    <DaneIdentyfikacyjne>
      <NIP>${sellerNip}</NIP>
      <NazwaPelna>${escapeXml(sellerName)}</NazwaPelna>
    </DaneIdentyfikacyjne>
    <Adres>
      <KodKraju>PL</KodKraju>
      <AdresPol>
        <KodPocztowy>${sellerPostalCode}</KodPocztowy>
        <Miejscowosc>${sellerCity}</Miejscowosc>
        <Ulica>${escapeXml(sellerAddress.street)}</Ulica>
        <NrDomu>${escapeXml(sellerAddress.houseNo)}</NrDomu>
      </AdresPol>
    </Adres>
  </Podmiot1>
  <Podmiot2>
    ${buyerNip ? `
    <DaneIdentyfikacyjne>
      <NIP>${buyerNip}</NIP>
      <NazwaPelna>${escapeXml(buyerName)}</NazwaPelna>
    </DaneIdentyfikacyjne>
    ` : `
    <DaneIdentyfikacyjne>
      <BrakNIP>1</BrakNIP>
      <NazwaPelna>${escapeXml(buyerName)}</NazwaPelna>
    </DaneIdentyfikacyjne>
    `}
    <Adres>
      <KodKraju>PL</KodKraju>
      <AdresPol>
        <KodPocztowy>${buyerPostalCode}</KodPocztowy>
        <Miejscowosc>${escapeXml(buyerCity)}</Miejscowosc>
        <Ulica>${escapeXml(buyerAddress.street)}</Ulica>
        <NrDomu>${escapeXml(buyerAddress.houseNo)}</NrDomu>
      </AdresPol>
    </Adres>
  </Podmiot2>
  <Fa>
    <KodWaluty>PLN</KodWaluty>
    <P_1>${issueDateStr}</P_1>
    <P_2>${escapeXml(invoice.invoiceNumber)}</P_2>
    <P_6>${saleDateStr}</P_6>
    <P_13_1>${netAmount}</P_13_1>
    <P_14_1>${vatAmount}</P_14_1>
    <P_15>${grossAmount}</P_15>
    <Adnotacje>
      <P_16>2</P_16>
      <P_17>2</P_17>
      <P_18>2</P_18>
      <P_18A>2</P_18A>
      <P_19>2</P_19>
      <P_22>2</P_22>
      <P_23>2</P_23>
      <P_PMarzy>2</P_PMarzy>
    </Adnotacje>
    <RodzajFaktury>VAT</RodzajFaktury>
    <FaWiersz>
      <NrWierszaFa>1</NrWierszaFa>
      <P_7>${escapeXml(itemDescription)}</P_7>
      <P_8A>szt.</P_8A>
      <P_8B>1</P_8B>
      <P_9A>${netAmount}</P_9A>
      <P_11>${netAmount}</P_11>
      <P_12>${vatRate}</P_12>
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
 * Sends an invoice to KSeF (real API call or simulated run if keys are not set)
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

  // Mark status as pending transmission
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      ksefStatus: "PENDING",
      ksefDiagnostics: null
    }
  })

  // Load KSeF config
  const config = await getKsefConfig()
  const isMock = !config.enabled || !config.token || !config.nip

  if (isMock && !forceReal) {
    // Run simulation
    console.log(`KSeF: Running in SIMULATION MODE for invoice ${invoice.invoiceNumber}`)
    
    // Generate XML to test logic and save it in logs
    const xml = generateInvoiceXml(invoice)

    // Simulate async network latency
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Generate simulated KSeF details
    const ksefPart1 = config.nip.replace(/\D/g, "")
    const ksefPart2 = formatDate(new Date()).replace(/-/g, "")
    const ksefPart3 = crypto.randomBytes(8).toString("hex").toUpperCase()
    const ksefNumber = `${ksefPart1}-${ksefPart2}-${ksefPart3}-01`
    const ksefReferenceNumber = `REF-${crypto.randomBytes(6).toString("hex").toUpperCase()}`

    const upoXml = `<?xml version="1.0" encoding="UTF-8"?>
<UrzadowePoswiadczenieOdbioru xmlns="http://crd.gov.pl/xml/schematy/upo/2020/01/01/">
  <Naglowek>
    <WersjaSchema>1-0</WersjaSchema>
    <DataOdbioru>${formatDateTime(new Date())}</DataOdbioru>
  </Naglowek>
  <StatusKSeF>ACCEPTED</StatusKSeF>
  <KsefInvoiceNumber>${ksefNumber}</KsefInvoiceNumber>
  <ReferenceNumber>${ksefReferenceNumber}</ReferenceNumber>
  <Komunikat>Dokument został poprawnie przyjęty i przetworzony przez system KSeF 2.0.</Komunikat>
</UrzadowePoswiadczenieOdbioru>`

    // Update database
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ksefStatus: "ACCEPTED",
        ksefNumber,
        ksefReferenceNumber,
        upoContent: upoXml,
        ksefDiagnostics: "Symulacja KSeF 2.0: Faktura wysłana i zaakceptowana pomyślnie."
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
          ksefNumber,
          ksefReferenceNumber,
          xmlPreview: xml.substring(0, 1000)
        })
      }
    })

    return true
  }

  // Real KSeF 2.0 Integration
  try {
    const ksefBaseUrl = config.env === "prod"
      ? "https://api.ksef.mf.gov.pl/api/v2"
      : "https://api-test.ksef.mf.gov.pl/api/v2"

    console.log(`KSeF: Connecting to KSeF 2.0 (${config.env}) for invoice ${invoice.invoiceNumber}`)

    // 1. Fetch certificates
    const certsResponse = await ksefFetch(
      `${ksefBaseUrl}/security/public-key-certificates`,
      {},
      "Fetch certificates"
    )
    if (!certsResponse.ok) {
      throw new Error(`Failed to fetch KSeF security certificates. HTTP Status ${certsResponse.status}`)
    }
    const certsData = await certsResponse.json()
    const tokenCertObj = certsData.subjects?.find((s: any) => s.usage === "KsefTokenEncryption") || certsData.subjects?.[0]
    const symCertObj = certsData.subjects?.find((s: any) => s.usage === "SymmetricKeyEncryption") || certsData.subjects?.[0]

    if (!tokenCertObj || !symCertObj) {
      throw new Error("Could not identify required encryption certificates from KSeF")
    }

    const tokenPublicKey = crypto.createPublicKey(derToPem(tokenCertObj.certificate))
    const symPublicKey = crypto.createPublicKey(derToPem(symCertObj.certificate))

    // 2. Fetch challenge
    const cleanedNip = config.nip.replace(/\D/g, "")
    const challengeResponse = await ksefFetch(`${ksefBaseUrl}/auth/challenge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: {
          type: "onip",
          identifier: cleanedNip
        }
      })
    }, "Auth challenge")

    if (!challengeResponse.ok) {
      throw new Error(`KSeF Auth Challenge failed: ${challengeResponse.statusText}`)
    }
    const challengeData = await challengeResponse.json()
    const challenge = challengeData.challenge
    const timestamp = challengeData.timestamp

    // 3. Encrypt Authorization Token
    const challengeTimestamp = new Date(timestamp).toISOString() // or string representation
    const textToEncrypt = `${config.token}|${challengeTimestamp}`
    
    const encryptedToken = crypto.publicEncrypt({
      key: tokenPublicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256"
    }, Buffer.from(textToEncrypt, "utf8"))

    // 4. Authenticate and get temporary token
    const tokenResponse = await ksefFetch(`${ksefBaseUrl}/auth/ksef-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challenge,
        ksefToken: encryptedToken.toString("base64")
      })
    }, "Token authentication")

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      throw new Error(`KSeF Token Authentication failed (HTTP ${tokenResponse.status}): ${errorText}`)
    }

    const tokenData = await tokenResponse.json()
    const tempToken = tokenData.authenticationToken?.token
    const authReferenceNumber = tokenData.referenceNumber

    // 5. Redeem Token (Get JWT Access Token)
    const redeemResponse = await ksefFetch(`${ksefBaseUrl}/auth/token/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authenticationToken: tempToken
      })
    }, "Token redeem")

    if (!redeemResponse.ok) {
      throw new Error(`KSeF Token Redeem failed: ${redeemResponse.statusText}`)
    }
    const redeemData = await redeemResponse.json()
    const accessToken = redeemData.accessToken

    // 6. Generate AES symmetric key and IV for invoice session
    const aesKey = crypto.randomBytes(32)
    const aesIv = crypto.randomBytes(16)

    // Encrypt symmetric key with KSeF public key
    const encryptedSymKey = crypto.publicEncrypt({
      key: symPublicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256"
    }, aesKey)

    // 7. Start interactive session
    const sessionResponse = await ksefFetch(`${ksefBaseUrl}/sessions/online`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        formCode: {
          systemCode: "FA (3)",
          schemaVersion: "1-0E",
          targetNamespace: "http://crd.gov.pl/wzor/2025/06/25/13775/",
          value: "Faktura"
        },
        encryption: {
          encryptionKey: encryptedSymKey.toString("base64")
        }
      })
    }, "Online session init")

    if (!sessionResponse.ok) {
      const errTxt = await sessionResponse.text()
      throw new Error(`KSeF Online Session Init failed (HTTP ${sessionResponse.status}): ${errTxt}`)
    }
    const sessionData = await sessionResponse.json()
    const sessionRefNumber = sessionData.referenceNumber

    // 8. Generate invoice XML and encrypt it
    const xmlContent = generateInvoiceXml(invoice)
    const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, aesIv)
    let encryptedXml = cipher.update(xmlContent, "utf8", "base64")
    encryptedXml += cipher.final("base64")

    // 9. Send Encrypted Invoice
    const uploadResponse = await ksefFetch(`${ksefBaseUrl}/sessions/online/${sessionRefNumber}/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "X-KSeF-Symmetric-IV": aesIv.toString("base64")
      },
      body: JSON.stringify({
        invoiceContent: encryptedXml
      })
    }, "Upload invoice")

    if (!uploadResponse.ok) {
      const errTxt = await uploadResponse.text()
      throw new Error(`KSeF Upload Invoice failed (HTTP ${uploadResponse.status}): ${errTxt}`)
    }
    const uploadData = await uploadResponse.json()

    // 10. Process upload result
    const docNumber = uploadData.documentNumber
    const ksefId = uploadData.ksefInvoiceNumber || `KSEF-${cleanedNip}-${formatDate(new Date()).replace(/-/g, "")}-${docNumber}`

    // Update database
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ksefStatus: "SENT",
        ksefNumber: ksefId,
        ksefReferenceNumber: sessionRefNumber,
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
          ksefNumber: ksefId,
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
