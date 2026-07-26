"use client"

import { AnimateUiIcon } from "@/components/animate-ui/icons/animate-ui-icon"
import { getAnimateUiIconName } from "@/lib/category-icons"
import { cn } from "@/lib/utils"
import { icons } from "lucide-react"
import type { ComponentType } from "react"

interface CategoryIconProps {
  /** Pole `ikona` kategorii — nazwa z Lucide albo "animate-ui:<nazwa>". */
  ikona?: string | null
  /** Pole `ikonaUrl` kategorii — ma pierwszeństwo przed ikoną z biblioteki. */
  ikonaUrl?: string | null
  className?: string
  /** Dodatkowe klasy tylko dla wgranej ikony (`ikonaUrl`). */
  imageClassName?: string
  /** Odtwarza animację ikon Animate UI (ikony Lucide są statyczne). */
  animate?: boolean
  /** Rysowana, gdy kategoria nie ma ikony lub nazwa jest nieznana. */
  fallback?: ComponentType<{ className?: string }> | null
}

/**
 * Jedno miejsce, które zamienia ikonę zapisaną na kategorii na komponent —
 * obsługuje wgrany plik, animowane ikony Animate UI i statyczne ikony Lucide.
 */
export function CategoryIcon({
  ikona,
  ikonaUrl,
  className,
  imageClassName,
  animate = false,
  fallback: Fallback = null,
}: CategoryIconProps) {
  if (ikonaUrl) {
    return <img src={ikonaUrl} alt="" className={cn(className, "object-contain", imageClassName)} />
  }

  const animateUiName = getAnimateUiIconName(ikona)
  if (animateUiName) {
    return <AnimateUiIcon name={animateUiName} animate={animate} className={className} />
  }

  const LucideIcon = ikona ? icons[ikona as keyof typeof icons] : null
  if (LucideIcon) {
    return <LucideIcon className={className} />
  }

  return Fallback ? <Fallback className={className} /> : null
}
