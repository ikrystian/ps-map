import { prisma } from "@/lib/prisma"
import { getKsefConfig, generateInvoiceXml, KsefConfig } from "@/lib/ksef"
import * as crypto from "crypto"
import { mkdir, readFile, writeFile } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"
import fontkit from "@pdf-lib/fontkit"
import { PDFDocument, PDFFont, rgb, RGB } from "pdf-lib"
import QRCode from "qrcode"

/**
 * Katalog z finalnymi plikami PDF faktur. Celowo POZA `.uploads`, bo tamten
 * katalog jest serwowany publicznie przez /api/uploads/[...path] bez
 * autoryzacji — faktury zawierają dane osobowe i są udostępniane wyłącznie
 * przez autoryzowany endpoint /api/invoices/[id]/pdf.
 */
const INVOICES_DIR = join(process.cwd(), ".invoices")

const FONT_REGULAR_PATH = join(process.cwd(), "assets", "fonts", "DejaVuSans.ttf")
const FONT_BOLD_PATH = join(process.cwd(), "assets", "fonts", "DejaVuSans-Bold.ttf")

/** Dane sprzedawcy prezentowane na fakturze (zgodne z XML FA(3) w lib/ksef.ts). */
const SELLER = {
  name: "Prosta Sprawa Sp. z o.o.",
  address: "ul. Przykładowa 123",
  postalCity: "00-001 Warszawa",
  email: "kontakt@prosta-sprawa.pl",
  phone: "+48 123 456 789",
  bankAccount: "12 3456 7890 1234 5678 9012 3456",
}

/**
 * Buduje URL weryfikacyjny (KOD I) zgodnie ze specyfikacją MF dla KSeF 2.0:
 * https://qr[-test].ksef.mf.gov.pl/invoice/{NIP}/{DD-MM-RRRR}/{SHA-256 Base64URL}
 *
 * Hash liczony jest z dokładnie tego pliku XML, który został wysłany do KSeF
 * (przed zaszyfrowaniem) — dlatego XML jest utrwalany w `invoice.ksefXml`
 * w momencie wysyłki.
 */
export function buildKsefVerificationUrl(
  sellerNip: string,
  issueDate: Date,
  invoiceXml: string,
  env: KsefConfig["env"]
): string {
  const baseUrl = env === "prod"
    ? "https://qr.ksef.mf.gov.pl"
    : "https://qr-test.ksef.mf.gov.pl"

  // Data musi być identyczna z polem P_1 w XML, które jest formatowane w UTC
  // (toISOString w lib/ksef.ts) — stąd gettery UTC, nie lokalna strefa.
  const day = String(issueDate.getUTCDate()).padStart(2, "0")
  const month = String(issueDate.getUTCMonth() + 1).padStart(2, "0")
  const dateSegment = `${day}-${month}-${issueDate.getUTCFullYear()}`

  const hash = crypto
    .createHash("sha256")
    .update(Buffer.from(invoiceXml, "utf8"))
    .digest("base64url")

  return `${baseUrl}/invoice/${sellerNip.replace(/\D/g, "")}/${dateSegment}/${hash}`
}

/** Zwraca ścieżkę pliku PDF na dysku dla danej faktury. */
export function invoicePdfPath(invoiceNumber: string): string {
  return join(INVOICES_DIR, `${invoiceNumber.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`)
}

const formatPln = (amount: number) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

const formatDatePl = (d: Date | string) =>
  new Date(d).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

/**
 * Generuje finalny plik PDF faktury z numerem KSeF i weryfikacyjnym kodem QR.
 *
 * Wywoływana dopiero po zaakceptowaniu faktury przez KSeF (status ACCEPTED
 * i nadany numer KSeF) — wcześniej dokument dla klienta nie istnieje.
 *
 * Zapisuje plik w `.invoices/` i ustawia `invoice.pdfUrl` na autoryzowany
 * endpoint pobierania. Idempotentna — kolejne wywołania nadpisują plik.
 *
 * @returns ścieżka wygenerowanego pliku PDF
 */
export async function generateInvoicePdf(invoiceId: string): Promise<string> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      order: {
        include: { subscriptionPlan: true },
      },
    },
  })

  if (!invoice) {
    throw new Error(`Invoice ${invoiceId} not found`)
  }
  if (invoice.ksefStatus !== "ACCEPTED" || !invoice.ksefNumber) {
    throw new Error(
      `Invoice ${invoice.invoiceNumber} is not accepted by KSeF yet (status: ${invoice.ksefStatus}) — final PDF cannot be generated`
    )
  }

  const config = await getKsefConfig()

  // XML wysłany do KSeF jest źródłem hasha w kodzie QR. Dla faktur sprzed
  // wprowadzenia utrwalania XML odtwarzamy go deterministycznie z danych faktury.
  let invoiceXml = invoice.ksefXml
  if (!invoiceXml) {
    invoiceXml = generateInvoiceXml(invoice, config.nip)
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { ksefXml: invoiceXml },
    })
  }

  const verificationUrl = buildKsefVerificationUrl(
    config.nip,
    new Date(invoice.issueDate),
    invoiceXml,
    config.env
  )

  // Kod QR zgodny z ISO/IEC 18004 (poziom korekcji M, jak w przykładach MF)
  const qrPng = await QRCode.toBuffer(verificationUrl, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 6,
  })

  const [fontRegularBytes, fontBoldBytes] = await Promise.all([
    readFile(FONT_REGULAR_PATH),
    readFile(FONT_BOLD_PATH),
  ])

  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  const font = await pdfDoc.embedFont(fontRegularBytes, { subset: true })
  const fontBold = await pdfDoc.embedFont(fontBoldBytes, { subset: true })
  const qrImage = await pdfDoc.embedPng(qrPng)

  pdfDoc.setTitle(`Faktura ${invoice.invoiceNumber}`)
  pdfDoc.setAuthor(SELLER.name)
  pdfDoc.setSubject(`Faktura ustrukturyzowana KSeF: ${invoice.ksefNumber}`)

  // A4
  const page = pdfDoc.addPage([595.28, 841.89])
  const { width } = page.getSize()
  const margin = 48
  const contentWidth = width - 2 * margin

  const black = rgb(0, 0, 0)
  const gray = rgb(0.4, 0.4, 0.4)
  const lightGray = rgb(0.94, 0.94, 0.94)

  let y = 841.89 - margin

  const drawText = (
    text: string,
    x: number,
    yPos: number,
    size: number,
    usedFont: PDFFont = font,
    color: RGB = black
  ) => {
    page.drawText(text, { x, y: yPos, size, font: usedFont, color })
  }

  const drawRightText = (
    text: string,
    rightEdge: number,
    yPos: number,
    size: number,
    usedFont: PDFFont = font,
    color: RGB = black
  ) => {
    const textWidth = usedFont.widthOfTextAtSize(text, size)
    drawText(text, rightEdge - textWidth, yPos, size, usedFont, color)
  }

  // === Nagłówek ===
  drawText("FAKTURA VAT", margin, y - 18, 20, fontBold)
  drawText(invoice.invoiceNumber, margin, y - 36, 13, font, gray)

  drawRightText(SELLER.name, width - margin, y - 12, 11, fontBold)
  drawRightText(SELLER.address, width - margin, y - 26, 9)
  drawRightText(SELLER.postalCity, width - margin, y - 38, 9)
  drawRightText(`NIP: ${config.nip}`, width - margin, y - 50, 9)

  y -= 62

  // Wyróżniony blok KSeF — numer nadany przez Ministerstwo Finansów
  page.drawRectangle({
    x: margin,
    y: y - 30,
    width: contentWidth,
    height: 28,
    color: lightGray,
  })
  drawText("Faktura ustrukturyzowana (KSeF)", margin + 8, y - 13, 8, fontBold)
  drawText(`Numer KSeF: ${invoice.ksefNumber}`, margin + 8, y - 25, 9)

  y -= 46

  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1.5,
    color: black,
  })

  y -= 22

  // === Strony ===
  const colBuyerX = margin + contentWidth / 2
  drawText("SPRZEDAWCA", margin, y, 9, fontBold)
  drawText("NABYWCA", colBuyerX, y, 9, fontBold)
  y -= 15

  const sellerLines = [
    SELLER.name,
    SELLER.address,
    SELLER.postalCity,
    `NIP: ${config.nip}`,
    `Email: ${SELLER.email}`,
    `Tel: ${SELLER.phone}`,
  ]
  const buyerLines = [
    invoice.buyerName,
    invoice.buyerAddress,
    `${invoice.buyerPostalCode} ${invoice.buyerCity}`,
    ...(invoice.buyerNIP ? [`NIP: ${invoice.buyerNIP}`] : []),
    invoice.buyerCountry,
  ]
  const partyLineHeight = 12
  sellerLines.forEach((line, i) => {
    drawText(line, margin, y - i * partyLineHeight, 8.5, i === 0 ? fontBold : font)
  })
  buyerLines.forEach((line, i) => {
    drawText(line, colBuyerX, y - i * partyLineHeight, 8.5, i === 0 ? fontBold : font)
  })
  y -= Math.max(sellerLines.length, buyerLines.length) * partyLineHeight + 16

  // === Daty ===
  const dates = [
    ["Data wystawienia:", formatDatePl(invoice.issueDate)],
    ["Data sprzedaży:", formatDatePl(invoice.saleDate)],
    ["Termin płatności:", formatDatePl(invoice.dueDate)],
  ]
  let dateX = margin
  for (const [label, value] of dates) {
    drawText(label, dateX, y, 8.5, fontBold)
    const labelWidth = fontBold.widthOfTextAtSize(label, 8.5)
    drawText(value, dateX + labelWidth + 4, y, 8.5)
    dateX += labelWidth + fontBold.widthOfTextAtSize(value, 8.5) + 34
  }
  y -= 26

  // === Tabela pozycji ===
  const columns = [
    { header: "Lp.", width: 0.05, align: "right" as const },
    { header: "Nazwa towaru/usługi", width: 0.39, align: "left" as const },
    { header: "Ilość", width: 0.07, align: "right" as const },
    { header: "J.m.", width: 0.07, align: "left" as const },
    { header: "Cena netto", width: 0.15, align: "right" as const },
    { header: "VAT %", width: 0.09, align: "right" as const },
    { header: "Wartość brutto", width: 0.18, align: "right" as const },
  ]

  const itemDescription = invoice.order.orderType === "SUBSCRIPTION"
    ? `Subskrypcja: ${invoice.order.subscriptionPlan?.nazwa || "Pakiet subskrypcji"}`
    : "Pakiet punktów"

  const rowValues = [
    "1",
    itemDescription,
    "1",
    "szt.",
    formatPln(invoice.netAmount),
    `${invoice.vatRate}%`,
    formatPln(invoice.grossAmount),
  ]

  const headerHeight = 20
  const rowHeight = 30
  const cellPadding = 5

  // Nagłówek tabeli
  page.drawRectangle({
    x: margin,
    y: y - headerHeight,
    width: contentWidth,
    height: headerHeight,
    color: lightGray,
    borderColor: black,
    borderWidth: 0.7,
  })
  let cellX = margin
  for (const col of columns) {
    const colWidth = col.width * contentWidth
    const textY = y - headerHeight + 7
    if (col.align === "right") {
      drawRightText(col.header, cellX + colWidth - cellPadding, textY, 7.5, fontBold)
    } else {
      drawText(col.header, cellX + cellPadding, textY, 7.5, fontBold)
    }
    cellX += colWidth
  }

  // Wiersz pozycji
  const rowTop = y - headerHeight
  page.drawRectangle({
    x: margin,
    y: rowTop - rowHeight,
    width: contentWidth,
    height: rowHeight,
    borderColor: black,
    borderWidth: 0.7,
  })
  cellX = margin
  columns.forEach((col, i) => {
    const colWidth = col.width * contentWidth
    const textY = rowTop - 13
    if (col.align === "right") {
      drawRightText(rowValues[i], cellX + colWidth - cellPadding, textY, 8)
    } else {
      drawText(rowValues[i], cellX + cellPadding, textY, 8)
    }
    if (i === 1) {
      drawText(`Zamówienie: ${invoice.order.orderNumber}`, cellX + cellPadding, textY - 11, 7, font, gray)
    }
    // Pionowe linie siatki
    if (i > 0) {
      page.drawLine({
        start: { x: cellX, y: y },
        end: { x: cellX, y: rowTop - rowHeight },
        thickness: 0.7,
        color: black,
      })
    }
    cellX += colWidth
  })

  y = rowTop - rowHeight - 24

  // === Podsumowanie ===
  const summaryRight = width - margin
  const summaryLabelX = margin + contentWidth * 0.55
  drawText("Razem netto:", summaryLabelX, y, 9)
  drawRightText(formatPln(invoice.netAmount), summaryRight, y, 9)
  y -= 14
  drawText(`VAT (${invoice.vatRate}%):`, summaryLabelX, y, 9)
  drawRightText(formatPln(invoice.vatAmount), summaryRight, y, 9)
  y -= 8
  page.drawLine({
    start: { x: summaryLabelX, y },
    end: { x: summaryRight, y },
    thickness: 1,
    color: black,
  })
  y -= 14
  drawText("RAZEM BRUTTO:", summaryLabelX, y, 11, fontBold)
  drawRightText(formatPln(invoice.grossAmount), summaryRight, y, 11, fontBold)

  y -= 34

  // === Kod QR (weryfikacja w KSeF) + informacje o płatności ===
  // Zgodnie ze spec. MF pod kodem QR umieszczany jest numer KSeF faktury.
  const qrSize = 108
  const qrX = width - margin - qrSize
  const qrTop = y
  page.drawImage(qrImage, {
    x: qrX,
    y: qrTop - qrSize,
    width: qrSize,
    height: qrSize,
  })
  const qrLabelSize = 6
  const qrLabel = invoice.ksefNumber
  const qrLabelWidth = font.widthOfTextAtSize(qrLabel, qrLabelSize)
  drawText(
    qrLabel,
    qrX + (qrSize - qrLabelWidth) / 2,
    qrTop - qrSize - 8,
    qrLabelSize
  )
  const qrCaption = "Zweryfikuj fakturę w KSeF"
  const qrCaptionWidth = font.widthOfTextAtSize(qrCaption, 7)
  drawText(qrCaption, qrX + (qrSize - qrCaptionWidth) / 2, qrTop + 6, 7, font, gray)

  // Informacje o płatności (po lewej stronie kodu QR)
  const payBoxWidth = contentWidth - qrSize - 24
  page.drawRectangle({
    x: margin,
    y: qrTop - qrSize,
    width: payBoxWidth,
    height: qrSize,
    color: rgb(0.97, 0.97, 0.97),
    borderColor: rgb(0.85, 0.85, 0.85),
    borderWidth: 0.7,
  })
  let payY = qrTop - 16
  drawText("Informacje o płatności:", margin + 10, payY, 9, fontBold)
  payY -= 15
  drawText("Sposób płatności: Przelew bankowy", margin + 10, payY, 8)
  payY -= 12
  drawText(`Nr konta: ${SELLER.bankAccount}`, margin + 10, payY, 8)
  if (invoice.paymentDate) {
    payY -= 15
    drawText(
      `Faktura opłacona dnia: ${formatDatePl(invoice.paymentDate)}`,
      margin + 10,
      payY,
      8,
      fontBold,
      rgb(0.13, 0.55, 0.13)
    )
  }

  y = qrTop - qrSize - 30

  // === Stopka ===
  drawText(
    "Faktura wystawiona automatycznie przez system Prosta Sprawa i przesłana do Krajowego Systemu e-Faktur (KSeF).",
    margin,
    y,
    7.5,
    font,
    gray
  )
  y -= 11
  drawText(
    `W przypadku pytań prosimy o kontakt: ${SELLER.email}`,
    margin,
    y,
    7.5,
    font,
    gray
  )

  const pdfBytes = await pdfDoc.save()

  if (!existsSync(INVOICES_DIR)) {
    await mkdir(INVOICES_DIR, { recursive: true })
  }
  const filePath = invoicePdfPath(invoice.invoiceNumber)
  await writeFile(filePath, pdfBytes)

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { pdfUrl: `/api/invoices/${invoiceId}/pdf` },
  })

  return filePath
}
