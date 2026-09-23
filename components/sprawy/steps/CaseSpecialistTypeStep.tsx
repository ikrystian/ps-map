"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Briefcase, Scale } from "lucide-react"
import type { SpecialistType } from "@/components/sprawy/case-draft-types"

interface CaseSpecialistTypeStepProps {
  value: SpecialistType | ""
  error?: string
  onSelect: (value: SpecialistType) => void
}

const OPTIONS: { value: SpecialistType; label: string; icon: typeof Scale; description: string }[] = [
  {
    value: "PRAWNIK",
    label: "Prawnika",
    icon: Scale,
    description: "Adwokata lub radcę prawnego — porada, pisma, umowy, reprezentacja przed sądem lub urzędem.",
  },
  {
    value: "EKSPERT",
    label: "Eksperta",
    icon: Briefcase,
    description: "Specjalistę z innej dziedziny niż prawo, np. z finansów, wycen, IT, marketingu czy zarządzania.",
  },
]

export function CaseSpecialistTypeStep({ value, error, onSelect }: CaseSpecialistTypeStepProps) {
  return (
    <div className="space-y-6">
      <div id="field-typSpecjalisty">
        <Label
          className={cn(
            "text-muted-foreground text-sm font-semibold mb-4 block",
            error && "text-destructive",
          )}
        >
          Kogo szukasz? *
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OPTIONS.map((option) => {
            const isSelected = value === option.value
            const OptionIcon = option.icon
            return (
              <Card
                key={option.value}
                className={cn(
                  "cursor-pointer border transition-all duration-300 rounded-lg relative overflow-hidden p-6 group hover:bg-background-sec/20 flex flex-col justify-between h-full min-h-[160px]",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                    : error
                      ? "border-destructive/60 bg-background-sec/10 hover:border-destructive"
                      : "border-border/30 bg-background-sec/10 hover:border-border/60",
                )}
                onClick={() => onSelect(option.value)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-md flex items-center justify-center border transition-all duration-300",
                        isSelected
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-background-sec border-border/10 text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      <OptionIcon className="h-5 w-5" />
                    </div>
                    <div
                      className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                        isSelected
                          ? "border-primary"
                          : "border-border/30 group-hover:border-border/60",
                      )}
                    >
                      {isSelected && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-base font-semibold text-foreground">
                      {option.label}
                    </h4>
                    <p className="text-xs text-muted-foreground font-light leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
        {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      </div>
    </div>
  )
}
