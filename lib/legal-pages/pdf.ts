import { readFile } from "fs/promises"
import { join } from "path"
import fontkit from "@pdf-lib/fontkit"
import { PDFDocument, PDFFont, PDFPage, rgb, RGB } from "pdf-lib"
import { COMPANY } from "@/lib/company"
import { formatDate, formatDateLong } from "@/lib/format"
import type { LegalPageContent } from "./types"

const FONT_REGULAR_PATH = join(process.cwd(), "assets", "fonts", "DejaVuSans.ttf")
const FONT_BOLD_PATH = join(process.cwd(), "assets", "fonts", "DejaVuSans-Bold.ttf")
const LOGO_PATH = join(process.cwd(), "assets", "invoice", "logo-color.png")

/** Kolory marki (jak w lib/invoice-pdf.ts). */
const COLORS = {
  text: rgb(0.13, 0.13, 0.13),
  muted: rgb(0.42, 0.42, 0.42),
  teal: rgb(0x0d / 255, 0xa1 / 255, 0x92 / 255),
  greenDark: rgb(0x0c / 255, 0x45 / 255, 0x39 / 255),
  rule: rgb(0.85, 0.85, 0.85),
}

// A4 w punktach
const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN_X = 56
const MARGIN_TOP = 56
const MARGIN_BOTTOM = 64
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN_X

const BODY_SIZE = 9.5
const BODY_LEADING = 14
const PARAGRAPH_GAP = 5

// Akapity wypunktowane dostają wcięcie wiszące, żeby kolejne wiersze nie zaczynały się pod znakiem
const BULLET_RE = /^([•●\-–]\s+)/

/** Usuwa znaki, które psują pomiar i rysowanie tekstu (tabulatory, twarde spacje, znaki sterujące). */
const normalize = (text: string) =>
  text.replace(/\t/g, "    ").replace(/[  ]/g, " ").replace(/[\u0000-\u0008\u000B-\u001F​]/g, "")

/** Łamie tekst na wiersze mieszczące się w `maxWidth`; zachowuje ręczne podziały wierszy. */
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = []
  for (const rawLine of normalize(text).split("\n")) {
    const words = rawLine.split(/ +/).filter(Boolean)
    if (words.length === 0) {
      lines.push("")
      continue
    }
    let current = ""
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        current = candidate
        continue
      }
      if (current) lines.push(current)
      // Słowo dłuższe niż cały wiersz (np. URL) — dzielimy po znakach
      let rest = word
      while (font.widthOfTextAtSize(rest, size) > maxWidth) {
        let cut = rest.length - 1
        while (cut > 1 && font.widthOfTextAtSize(rest.slice(0, cut), size) > maxWidth) cut--
        lines.push(rest.slice(0, cut))
        rest = rest.slice(cut)
      }
      current = rest
    }
    if (current) lines.push(current)
  }
  return lines
}

/**
 * Generuje PDF strony prawnej (regulamin / polityka prywatności) z bieżącej treści
 * edytowalnej w panelu admina — ten sam tekst, który widać na stronie.
 */
export async function generateLegalPagePdf(
  content: LegalPageContent,
  options: { documentTitle: string; generatedAt?: Date }
): Promise<Uint8Array> {
  const generatedAt = options.generatedAt ?? new Date()

  const [fontRegularBytes, fontBoldBytes, logoBytes] = await Promise.all([
    readFile(FONT_REGULAR_PATH),
    readFile(FONT_BOLD_PATH),
    readFile(LOGO_PATH),
  ])

  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  const font = await pdfDoc.embedFont(fontRegularBytes, { subset: true })
  const fontBold = await pdfDoc.embedFont(fontBoldBytes, { subset: true })
  const logo = await pdfDoc.embedPng(logoBytes)

  pdfDoc.setTitle(`${options.documentTitle} — ProstaSprawa.pl`)
  pdfDoc.setAuthor(COMPANY.name)
  pdfDoc.setSubject(content.heroSubtitle)
  pdfDoc.setCreator("ProstaSprawa.pl")
  pdfDoc.setLanguage("pl-PL")
  pdfDoc.setCreationDate(generatedAt)
  pdfDoc.setModificationDate(generatedAt)

  let page: PDFPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let y = PAGE_HEIGHT - MARGIN_TOP

  const newPage = () => {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    y = PAGE_HEIGHT - MARGIN_TOP
  }
  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN_BOTTOM) newPage()
  }
  const drawLine = (text: string, x: number, size: number, usedFont: PDFFont, color: RGB) => {
    if (text) page.drawText(text, { x, y, size, font: usedFont, color })
  }

  /** Akapit z łamaniem wierszy i przenoszeniem na kolejne strony. */
  const drawParagraph = (
    text: string,
    opts: { size?: number; leading?: number; usedFont?: PDFFont; color?: RGB; indent?: number; width?: number } = {}
  ) => {
    const size = opts.size ?? BODY_SIZE
    const leading = opts.leading ?? BODY_LEADING
    const usedFont = opts.usedFont ?? font
    const color = opts.color ?? COLORS.text
    const x = MARGIN_X + (opts.indent ?? 0)
    const width = opts.width ?? CONTENT_WIDTH - (opts.indent ?? 0)

    const bullet = text.match(BULLET_RE)?.[1]
    const hang = bullet ? usedFont.widthOfTextAtSize(bullet, size) : 0
    const lines = bullet
      ? (() => {
          const body = wrapText(text.slice(bullet.length), usedFont, size, width - hang)
          return body.map((line, i) => (i === 0 ? bullet + line : line))
        })()
      : wrapText(text, usedFont, size, width)

    lines.forEach((line, i) => {
      ensureSpace(leading)
      y -= leading
      drawLine(line, x + (i > 0 ? hang : 0), size, usedFont, color)
    })
  }

  // === Nagłówek dokumentu ===
  const logoDims = logo.scale(130 / logo.width)
  page.drawImage(logo, { x: MARGIN_X, y: y - logoDims.height, width: logoDims.width, height: logoDims.height })
  const dateLabel = `Stan na ${formatDateLong(generatedAt)}`
  page.drawText(dateLabel, {
    x: PAGE_WIDTH - MARGIN_X - font.widthOfTextAtSize(dateLabel, 8.5),
    y: y - logoDims.height / 2 - 3,
    size: 8.5,
    font,
    color: COLORS.muted,
  })
  y -= logoDims.height + 28

  drawParagraph(content.heroTitle, { size: 20, leading: 24, usedFont: fontBold, color: COLORS.greenDark })
  y -= 4
  drawParagraph(content.heroSubtitle, { size: 10.5, leading: 15, color: COLORS.muted })
  if (content.lastUpdated) {
    drawParagraph(`Ostatnia aktualizacja: ${content.lastUpdated}`, { size: 8.5, leading: 13, color: COLORS.muted })
  }
  y -= 12
  page.drawLine({
    start: { x: MARGIN_X, y },
    end: { x: PAGE_WIDTH - MARGIN_X, y },
    thickness: 1.2,
    color: COLORS.teal,
  })
  y -= 10

  // === Rozdziały ===
  for (const section of content.sections) {
    // Nagłówek rozdziału nie może zostać sam na dole strony — wymagamy miejsca na ~3 wiersze treści
    ensureSpace(18 + 20 + 3 * BODY_LEADING)
    y -= 18
    if (section.number) {
      drawParagraph(`ROZDZIAŁ ${section.number}`, { size: 8, leading: 12, usedFont: fontBold, color: COLORS.teal })
    }
    drawParagraph(section.title, { size: 13, leading: 18, usedFont: fontBold, color: COLORS.text })
    y -= 4

    for (const paragraph of section.paragraphs) {
      y -= PARAGRAPH_GAP
      drawParagraph(paragraph)
    }
  }

  // === Stopka na każdej stronie (po złożeniu dokumentu znamy liczbę stron) ===
  const pages = pdfDoc.getPages()
  const footerLeft = `${options.documentTitle} · ProstaSprawa.pl · wygenerowano ${formatDate(generatedAt)}`
  pages.forEach((p, index) => {
    p.drawLine({
      start: { x: MARGIN_X, y: MARGIN_BOTTOM - 22 },
      end: { x: PAGE_WIDTH - MARGIN_X, y: MARGIN_BOTTOM - 22 },
      thickness: 0.5,
      color: COLORS.rule,
    })
    const pageLabel = `Strona ${index + 1} z ${pages.length}`
    const pageLabelWidth = font.widthOfTextAtSize(pageLabel, 7.5)
    const leftMaxWidth = CONTENT_WIDTH - pageLabelWidth - 16
    const [leftText] = wrapText(footerLeft, font, 7.5, leftMaxWidth)
    p.drawText(leftText, { x: MARGIN_X, y: MARGIN_BOTTOM - 36, size: 7.5, font, color: COLORS.muted })
    p.drawText(pageLabel, {
      x: PAGE_WIDTH - MARGIN_X - pageLabelWidth,
      y: MARGIN_BOTTOM - 36,
      size: 7.5,
      font,
      color: COLORS.muted,
    })
  })

  return pdfDoc.save()
}
