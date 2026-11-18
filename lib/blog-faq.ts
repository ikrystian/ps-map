import { headingText } from "@/lib/blog-toc"

export interface BlogFaqItem {
  question: string
  answer: string
}

const HEADING_RE = /<h([1-6])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi
const FAQ_TITLE_RE = /\bfaq\b|najczęstsze pytania/i

/**
 * Wyciąga pary pytanie/odpowiedź z sekcji FAQ wpisu (nagłówek zawierający „FAQ“ lub
 * „najczęstsze pytania“). Pytaniem jest każdy nagłówek niższego poziomu w tej sekcji,
 * odpowiedzią — tekst akapitów między nim a następnym nagłówkiem.
 *
 * Dane do JSON-LD muszą odpowiadać treści widocznej na stronie, dlatego wynik
 * pochodzi wyłącznie z tego samego HTML, który renderuje wpis.
 */
export function extractFaqItems(html: string): BlogFaqItem[] {
  const headings = Array.from(html.matchAll(HEADING_RE)).map((match) => ({
    level: Number(match[1]),
    text: headingText(match[3]),
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
  }))

  const items: BlogFaqItem[] = []

  headings.forEach((section, sectionIndex) => {
    if (!FAQ_TITLE_RE.test(section.text)) return

    // Sekcja trwa do następnego nagłówka tego samego lub wyższego poziomu.
    let sectionEnd = html.length
    const sectionChildren = headings.slice(sectionIndex + 1)
    const next = sectionChildren.find((h) => h.level <= section.level)
    if (next) sectionEnd = next.start

    const questions = sectionChildren.filter((h) => h.start < sectionEnd && h.level > section.level)

    questions.forEach((question, qIndex) => {
      const answerEnd = questions[qIndex + 1]?.start ?? sectionEnd
      // Granice bloków zamieniamy na spacje, żeby akapity nie skleiły się w jedno słowo.
      const answerHtml = html.slice(question.end, answerEnd).replace(/<\/(p|li|div|ul|ol)\s*>|<br\s*\/?>/gi, " ")
      const answer = headingText(answerHtml)
      if (question.text && answer) {
        items.push({ question: question.text, answer })
      }
    })
  })

  return items
}
