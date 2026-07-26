/**
 * Generuje components/animate-ui/icons/registry.ts na podstawie plików ikon
 * pobranych z rejestru Animate UI (https://animate-ui.com/docs/icons).
 *
 * Uruchomienie po dodaniu nowych ikon:
 *   bun scripts/generate-animate-ui-icons-registry.mjs
 *
 * Ikony dociągamy przez shadcn CLI, np.:
 *   npx shadcn@latest add @animate-ui/icons-gavel
 */
import fs from "node:fs"
import path from "node:path"
import { icons as lucideIcons } from "lucide-react"

const ROOT = path.resolve(import.meta.dirname, "..")
const ICONS_DIR = path.join(ROOT, "components/animate-ui/icons")
const OUTPUT = path.join(ICONS_DIR, "registry.ts")

// Animate UI trzyma ikony w kebab-case, Lucide w PascalCase. Te kilka nazw
// rozjeżdża się między bibliotekami, więc mapujemy je ręcznie.
const LUCIDE_OVERRIDES = {
  "chevron-left-right": "ChevronsLeftRight",
  "chevron-up-down": "ChevronsUpDown",
  fingerprint: "FingerprintPattern",
  "message-circle-question": "MessageCircleQuestionMark",
}

const toPascalCase = (name) =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")

/** Nazwa eksportowanego komponentu — w kilku plikach nie jest to PascalCase nazwy pliku. */
const readExportName = (file) => {
  const source = fs.readFileSync(path.join(ICONS_DIR, file), "utf8")
  const exportBlock = source.match(/export \{([\s\S]*?)\};/)
  if (!exportBlock) throw new Error(`Brak bloku export w ${file}`)

  const exportName = exportBlock[1]
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .find((entry) => entry !== "animations" && !entry.startsWith("type ") && !entry.includes(" as "))

  if (!exportName) throw new Error(`Nie znaleziono komponentu w ${file}`)
  return exportName
}

const response = await fetch("https://animate-ui.com/r/registry.json")
if (!response.ok) throw new Error(`Rejestr Animate UI zwrócił HTTP ${response.status}`)
const registry = await response.json()

const keywordsByName = new Map(
  registry.items
    .filter((item) => item.name.startsWith("icons-"))
    .map((item) => [item.name.slice("icons-".length), item.meta?.keywords ?? []]),
)

const names = fs
  .readdirSync(ICONS_DIR)
  .filter((file) => file.endsWith(".tsx") && file !== "icon.tsx")
  .map((file) => file.replace(/\.tsx$/, ""))
  .sort()

const loaders = []
const keywords = []
const lucideNames = []
const missingLucide = []

for (const name of names) {
  const exportName = readExportName(`${name}.tsx`)
  loaders.push(
    `  "${name}": () =>\n    import("@/components/animate-ui/icons/${name}").then(\n      (mod) => mod.${exportName} as AnimateUiIconComponent,\n    ),`,
  )

  const iconKeywords = keywordsByName.get(name) ?? []
  if (iconKeywords.length > 0) {
    keywords.push(`  "${name}": ${JSON.stringify(iconKeywords)},`)
  }

  const lucideName = LUCIDE_OVERRIDES[name] ?? toPascalCase(name)
  if (lucideName in lucideIcons) {
    lucideNames.push(`  "${name}": "${lucideName}",`)
  } else {
    missingLucide.push(name)
  }
}

const file = `// PLIK GENEROWANY — nie edytuj ręcznie.
// Źródło: bun scripts/generate-animate-ui-icons-registry.mjs
import type { ComponentType } from "react"

import type { IconProps } from "@/components/animate-ui/icons/icon"

export type AnimateUiIconProps = IconProps<string>
export type AnimateUiIconComponent = ComponentType<AnimateUiIconProps>

/**
 * Leniwe importy ikon Animate UI — dzięki nim strona publiczna pobiera tylko
 * te ikony, które faktycznie są ustawione na kategoriach.
 */
export const ANIMATE_UI_ICON_LOADERS: Record<string, () => Promise<AnimateUiIconComponent>> = {
${loaders.join("\n")}
}

export const ANIMATE_UI_ICON_NAMES = Object.keys(ANIMATE_UI_ICON_LOADERS)

/** Dodatkowe frazy do wyszukiwarki ikon w panelu administracyjnym. */
export const ANIMATE_UI_ICON_KEYWORDS: Record<string, string[]> = {
${keywords.join("\n")}
}

/**
 * Odpowiednik z Lucide — rysowany zanim doładuje się animowana wersja ikony
 * (ikony Animate UI to animowane ikony Lucide, więc podmiana jest niewidoczna).
 */
export const ANIMATE_UI_LUCIDE_EQUIVALENTS: Record<string, string> = {
${lucideNames.join("\n")}
}
`

fs.writeFileSync(OUTPUT, file)

console.log(`Zapisano ${path.relative(ROOT, OUTPUT)} — ${names.length} ikon.`)
if (missingLucide.length > 0) {
  console.log(`Bez odpowiednika w Lucide (${missingLucide.length}): ${missingLucide.join(", ")}`)
}
