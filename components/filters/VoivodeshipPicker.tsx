"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, X } from "lucide-react"
import { useState } from "react"

export interface VoivodeshipOption {
  id: string
  nazwa: string
  slug?: string | null
}

interface VoivodeshipPickerProps {
  voivodeships: VoivodeshipOption[]
  /** Slug wybranego województwa lub "all" gdy brak wyboru */
  value: string
  /** Zwraca slug województwa lub "all" po wyczyszczeniu */
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  contentClassName?: string
  align?: "start" | "center" | "end"
}

/**
 * Wybór województwa — to samo rozwiązanie co dropdown "Województwo"
 * w wyszukiwarce w PublicHeader.
 */
export function VoivodeshipPicker({
  voivodeships,
  value,
  onChange,
  placeholder = "Wszystkie",
  className,
  contentClassName,
  align = "start",
}: VoivodeshipPickerProps) {
  const [open, setOpen] = useState(false)

  const selectedName =
    value && value !== "all" ? voivodeships.find(v => v.slug === value)?.nazwa || "" : ""

  const handleSelect = (slug: string) => {
    onChange(slug)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            className
          )}
        >
          <span className={cn("truncate", !selectedName && "text-muted-foreground")}>
            {selectedName || placeholder}
          </span>
          <div className="flex items-center gap-1">
            {selectedName && (
              <X
                className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange("all")
                }}
              />
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[240px] p-1 bg-card border-border text-foreground", contentClassName)}
        align={align}
      >
        <div className="max-h-64 overflow-y-auto space-y-0.5">
          <button
            type="button"
            onClick={() => handleSelect("all")}
            className={cn(
              "w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between cursor-pointer border-0",
              value === "all"
                ? "bg-muted text-foreground"
                : "text-foreground/80 hover:bg-primary hover:text-white bg-transparent"
            )}
          >
            <span>Wszystkie</span>
            {value === "all" && <Check className="h-4 w-4 text-teal-400" />}
          </button>
          {voivodeships.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => handleSelect(v.slug || "")}
              className={cn(
                "w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between cursor-pointer border-0",
                value === v.slug
                  ? "bg-muted text-foreground"
                  : "text-foreground/80 hover:bg-muted/50 hover:text-foreground bg-transparent"
              )}
            >
              <span>{v.nazwa}</span>
              {value === v.slug && <Check className="h-4 w-4 text-teal-400" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
