"use client"

import { Label } from "@/components/ui/label"
import {
  BANNER_SIZES,
  BANNER_THEMES,
  BANNER_VARIANTS,
  getBannerImagePath,
  getBannerSize,
  type BannerSelection,
} from "@/lib/partner-banner"
import { cn } from "@/lib/utils"

interface BannerPickerProps {
  value: BannerSelection
  onChange: (value: BannerSelection) => void
}

// Kolory poglądowe motywów — tylko do kropki przy przycisku, sam banner to gotowa grafika
const THEME_SWATCHES: Record<BannerSelection["theme"], string> = {
  jasny: "#f6eedc",
  ciemny: "#0f3a2c",
  czarny: "#0a0a0a",
}

function OptionButton({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3 py-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-secondary/50 bg-secondary/10 text-secondary"
          : "border-border/10 bg-background/20 text-muted-foreground hover:border-border/30 hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  )
}

export function BannerPicker({ value, onChange }: BannerPickerProps) {
  const { width, height } = getBannerSize(value.size)
  const selectedVariant = BANNER_VARIANTS.find((v) => v.id === value.variant) ?? BANNER_VARIANTS[0]

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-foreground/80">Rozmiar</Label>
        <div role="radiogroup" aria-label="Rozmiar bannera" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {BANNER_SIZES.map((size) => (
            <OptionButton
              key={size.id}
              selected={value.size === size.id}
              onClick={() => onChange({ ...value, size: size.id })}
            >
              <span className="block font-semibold">{size.width}×{size.height}</span>
              <span className="block font-light opacity-80">{size.label}</span>
            </OptionButton>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-foreground/80">Motyw</Label>
          <div role="radiogroup" aria-label="Motyw bannera" className="grid grid-cols-3 gap-2">
            {BANNER_THEMES.map((theme) => (
              <OptionButton
                key={theme.id}
                selected={value.theme === theme.id}
                onClick={() => onChange({ ...value, theme: theme.id })}
                className="flex items-center gap-2"
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full border border-border/40"
                  style={{ backgroundColor: THEME_SWATCHES[theme.id] }}
                />
                <span className="font-semibold">{theme.label}</span>
              </OptionButton>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-foreground/80">Treść</Label>
          <div role="radiogroup" aria-label="Wariant treści bannera" className="grid grid-cols-2 gap-2">
            {BANNER_VARIANTS.map((variant) => (
              <OptionButton
                key={variant.id}
                selected={value.variant === variant.id}
                onClick={() => onChange({ ...value, variant: variant.id })}
              >
                <span className="block font-semibold">{variant.label}</span>
                <span className="block font-light opacity-80">{variant.hint}</span>
              </OptionButton>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-foreground/80">
          Podgląd <span className="font-light text-muted-foreground">({width}×{height} px)</span>
        </Label>
        <div className="flex justify-center overflow-x-auto rounded-xl border border-border/10 bg-background/40 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={getBannerImagePath(value)}
            src={getBannerImagePath(value)}
            width={width}
            height={height}
            alt={selectedVariant.alt}
            className="h-auto max-w-full"
          />
        </div>
      </div>
    </div>
  )
}
