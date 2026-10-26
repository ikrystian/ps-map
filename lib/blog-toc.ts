import { generateSlug } from "@/lib/utils"

export interface BlogTocItem {
  id: string
  label: string
}

const HEADING_RE = /<h([1-4])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&lt;": "<",
  "&gt;": ">",
}

function headingText(innerHtml: string) {
  return innerHtml
    .replace(/<[^>]*>/g, "")
    .replace(/&(nbsp|amp|quot|#39|apos|lt|gt);/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Buduje spis treści wpisu i dokleja nagłówkom atrybuty `id`, do których
 * linkuje spis. Spis obejmuje nagłówki najwyższego poziomu użytego w treści
 * (zwykle h2) — tak jak na stronach, na których się wzorujemy. Istniejące
 * `id` (np. wpisane w trybie HTML) są zachowywane.
 */
export function buildBlogToc(html: string): { html: string; toc: BlogTocItem[] } {
  const levels = Array.from(html.matchAll(HEADING_RE), (match) => Number(match[1]))
  if (levels.length === 0) return { html, toc: [] }

  const tocLevel = String(Math.min(...levels))
  const toc: BlogTocItem[] = []
  const usedIds = new Set<string>()

  const withIds = html.replace(HEADING_RE, (full, level: string, attrs: string | undefined, inner: string) => {
    if (level !== tocLevel) return full

    const label = headingText(inner)
    if (!label) return full

    const existingId = attrs?.match(/\sid\s*=\s*["']([^"']+)["']/i)?.[1]
    if (existingId) {
      usedIds.add(existingId)
      toc.push({ id: existingId, label })
      return full
    }

    const base = generateSlug(label) || "sekcja"
    let id = base
    for (let n = 2; usedIds.has(id); n++) id = `${base}-${n}`
    usedIds.add(id)
    toc.push({ id, label })

    return `<h${level} id="${id}"${attrs ?? ""}>${inner}</h${level}>`
  })

  return { html: withIds, toc }
}
