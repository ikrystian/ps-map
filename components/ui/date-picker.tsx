"use client"

import { format, isValid, parseISO } from "date-fns"
import { pl } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"
import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const customCalendarStyles = `
  .rdp-root {
    --rdp-color: hsl(var(--primary));
    --rdp-background-color: hsl(var(--primary) / 0.15);
    --rdp-accent-color: hsl(var(--primary));
    --rdp-accent-color-foreground: hsl(var(--primary-foreground));
    margin: 0;
    font-family: inherit;
  }
  .rdp-day {
    border-radius: var(--radius, 0.5rem);
  }
  .rdp-day_selected, .rdp-day_selected:hover {
    background-color: hsl(var(--primary)) !important;
    color: hsl(var(--primary-foreground)) !important;
  }
  .rdp-day_today {
    font-weight: bold;
    border: 1px solid hsl(var(--primary) / 0.5);
  }
  .rdp-button_next, .rdp-button_previous {
    border: 1px solid hsl(var(--border));
    background-color: transparent;
    border-radius: var(--radius, 0.5rem);
    padding: 6px;
    cursor: pointer;
  }
  .rdp-button_next:hover, .rdp-button_previous:hover {
    background-color: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }
  .rdp-caption_label {
    text-transform: capitalize;
    font-weight: 600;
    font-size: 0.95rem;
  }
  .rdp-weekday {
    text-transform: capitalize;
    font-weight: 500;
    font-size: 0.8rem;
    color: hsl(var(--muted-foreground));
  }
`

export interface DatePickerProps {
  id?: string
  value?: string // YYYY-MM-DD
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  clearable?: boolean
}

export function DatePicker({
  id,
  value,
  onChange,
  className,
  placeholder = "Wybierz datę",
  disabled = false,
  minDate,
  clearable = true,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Parse current value
  const parsedDate = React.useMemo(() => {
    if (!value) return undefined
    // Try YYYY-MM-DD or full date string
    const d = value.includes("T") ? new Date(value) : parseISO(value)
    return isValid(d) ? d : undefined
  }, [value])

  const handleDateSelect = (selectedDay: Date | undefined) => {
    if (!selectedDay) {
      onChange("")
    } else {
      const formatted = format(selectedDay, "yyyy-MM-dd")
      onChange(formatted)
    }
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
  }

  // Format label for button
  const displayLabel = React.useMemo(() => {
    if (!parsedDate) return placeholder
    return format(parsedDate, "d MMMM yyyy", { locale: pl })
  }, [parsedDate, placeholder])

  return (
    <div className={cn("relative w-full", className)}>
      <style>{customCalendarStyles}</style>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className={cn(
              "w-full justify-between text-left font-normal h-11 border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-lg",
              !parsedDate && "text-muted-foreground",
              isOpen && "ring-2 ring-ring ring-offset-2"
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-2 min-w-0 truncate">
              <CalendarIcon className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="truncate">{displayLabel}</span>
            </div>
            {clearable && parsedDate && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="h-5 w-5 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-1"
                aria-label="Wyczyszczenie daty"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 z-[9999]" align="start">
          <div className="border border-border rounded-md overflow-hidden bg-background">
            <DayPicker
              mode="single"
              selected={parsedDate}
              onSelect={handleDateSelect}
              locale={pl}
              showOutsideDays
              disabled={minDate ? { before: minDate } : undefined}
              className="p-3"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
