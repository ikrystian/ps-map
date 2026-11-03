import { escapeHtml } from "@/lib/email-layout"
import { openConfidential } from "./confidential"
import { czynnoscLabel, rolaLabel } from "./constants"
import { chamberLabel, displayName, resolveRole } from "./people"
import type { FullOrderRow } from "./serialize"
import { formatDay, formatTermin } from "./time"

/**
 * Wzór pełnomocnictwa substytucyjnego (dla aplikanta: upoważnienia) do pobrania
 * w szczegółach zlecenia. Dokument HTML zapisany jako .doc otwiera Word i LibreOffice;
 * wystawia go i podpisuje sam zlecający — platforma tylko podstawia dane.
 */

const BLANK = "…………………………………………"

export function buildPowerOfAttorney(order: FullOrderRow): { filename: string; content: string } {
  const poufne = openConfidential(order.poufne)
  const owner = order.zlecajacy
  const substitute = order.zastepca
  const aplikant = substitute ? resolveRole(substitute) === "APLIKANT" : false
  const e = (value: string | null | undefined, fallback = BLANK) => escapeHtml(value?.trim() || fallback)

  const court = [order.miejsce, order.wydzial].filter(Boolean).join(", ")
  const term = order.termin ? formatTermin(order.termin, order.terminMaGodzine, order.terminDoUstalenia, { weekday: false }) : BLANK
  const substituteText = substitute
    ? `${displayName(substitute)}${chamberLabel(substitute) ? ` (${chamberLabel(substitute)})` : ""}`
    : null
  const act = `${czynnoscLabel(order.czynnosc).toLowerCase()} w dniu ${term}`

  const title = aplikant ? "UPOWAŻNIENIE" : "PEŁNOMOCNICTWO SUBSTYTUCYJNE"
  const basis =
    substitute?.aplikantRodzaj === "RADCOWSKA" ? "ustawy o radcach prawnych" : "ustawy – Prawo o adwokaturze"

  const body = aplikant
    ? `<p>Na podstawie przepisów ${basis} upoważniam aplikanta ${e(substituteText)} do zastępowania mnie
       w sprawie o sygn. akt ${e(poufne.sygnatura)}${poufne.strony ? ` (${e(poufne.strony)})` : ""}, prowadzonej przed ${e(court)},
       w szczególności do udziału w czynności: ${e(act)}.</p>`
    : `<p>Działając jako ${e(rolaLabel(order.rolaZastepcy))} w sprawie o sygn. akt ${e(poufne.sygnatura)}${poufne.strony ? ` (${e(poufne.strony)})` : ""},
       prowadzonej przed ${e(court)}, udzielam dalszego pełnomocnictwa (substytucji) ${e(substituteText)}
       do zastępowania mnie w tej sprawie, w szczególności do udziału w czynności: ${e(act)}.</p>
       <p>Substytut jest umocowany w zakresie, w jakim sam jestem umocowany.</p>`

  const content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${title}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 2.5cm; }
  body { font-family: "Times New Roman", serif; font-size: 12pt; line-height: 1.5; }
  .prawo { text-align: right; }
  h1 { font-size: 14pt; text-align: center; letter-spacing: 1pt; margin: 36pt 0 24pt; }
  p { text-align: justify; margin: 0 0 12pt; }
  .podpis { margin-top: 60pt; text-align: right; }
</style></head>
<body>
  <p class="prawo">${e(owner.user.miasto)}, dnia ${formatDay(new Date())} r.</p>
  <p>${e(displayName(owner))}<br>${e(owner.nazwa)}${owner.user.adres ? `<br>${e(owner.user.adres)}` : ""}${owner.user.kodPocztowy || owner.user.miasto ? `<br>${e([owner.user.kodPocztowy, owner.user.miasto].filter(Boolean).join(" "))}` : ""}</p>
  <h1>${title}</h1>
  ${body}
  <p class="podpis">${BLANK}<br>${e(displayName(owner))}</p>
</body></html>`

  const slug = (order.numer ?? order.id).replace(/[^A-Za-z0-9]+/g, "-")
  return {
    filename: `${aplikant ? "upowaznienie" : "pelnomocnictwo-substytucyjne"}-${slug}.doc`,
    content,
  }
}
