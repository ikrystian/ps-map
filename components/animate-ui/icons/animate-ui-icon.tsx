"use client"

import {
  ANIMATE_UI_ICON_LOADERS,
  ANIMATE_UI_LUCIDE_EQUIVALENTS,
  type AnimateUiIconComponent,
} from "@/components/animate-ui/icons/registry"
import { icons } from "lucide-react"
import { useEffect, useState } from "react"

// Raz pobrana ikona zostaje w pamięci — kolejne montowania nie migają
// placeholderem, bo komponent jest dostępny już przy pierwszym renderze.
const iconCache = new Map<string, AnimateUiIconComponent>()

/** Przerwa między powtórzeniami animacji (ms) — bez niej pętla jest nerwowa. */
const LOOP_DELAY_MS = 400

interface AnimateUiIconProps {
  /** Nazwa ikony w kebab-case, np. "gavel". */
  name: string
  /** Odtwarza animację, gdy przechodzi na `true` (np. hover kafelka). */
  animate?: boolean
  /**
   * `false` odkłada pobranie animowanej wersji do pierwszej animacji — używane
   * tam, gdzie na raz renderujemy setki ikon (wybór ikony w panelu admina).
   */
  preload?: boolean
  className?: string
}

/** Statyczny odpowiednik z Lucide — rysowany do czasu doładowania animacji. */
function IconPlaceholder({ name, className }: { name: string; className?: string }) {
  const lucideName = ANIMATE_UI_LUCIDE_EQUIVALENTS[name]
  const LucideIcon = lucideName ? icons[lucideName as keyof typeof icons] : null
  return LucideIcon ? <LucideIcon className={className} /> : null
}

function LazyAnimateUiIcon({ name, animate = false, preload = true, className }: AnimateUiIconProps) {
  const [Icon, setIcon] = useState<AnimateUiIconComponent | null>(() => iconCache.get(name) ?? null)
  const shouldLoad = preload || animate

  useEffect(() => {
    const loader = ANIMATE_UI_ICON_LOADERS[name]
    if (!shouldLoad || !loader) return

    let active = true
    loader()
      .then((component) => {
        iconCache.set(name, component)
        if (active) setIcon(() => component)
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [name, shouldLoad])

  if (!Icon) return <IconPlaceholder name={name} className={className} />

  // `loop` powtarza animację tak długo, jak `animate` jest włączone (czyli przez
  // cały czas trwania hovera); `loopDelay` daje oddech między powtórzeniami.
  return (
    <Icon animate={animate} loop loopDelay={LOOP_DELAY_MS} className={className} />
  )
}

/**
 * Renderuje animowaną ikonę Animate UI ładowaną leniwie. Zanim doładuje się
 * właściwy komponent (oraz w SSR) rysowany jest statyczny odpowiednik z Lucide,
 * więc nie ma pustego miejsca ani przeskoku układu.
 */
export function AnimateUiIcon(props: AnimateUiIconProps) {
  // Klucz resetuje stan przy zmianie ikony — inaczej przez moment widoczna
  // byłaby poprzednio załadowana ikona.
  return <LazyAnimateUiIcon key={props.name} {...props} />
}
