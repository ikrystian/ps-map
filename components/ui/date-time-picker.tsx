"use client"

import { format, isValid } from "date-fns"
import { pl } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Custom styles to integrate react-day-picker with shadcn theme variables
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

interface DateTimePickerProps {
  id?: string
  value?: string // YYYY-MM-DDTHH:mm
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function DateTimePicker({
  id,
  value,
  onChange,
  className,
  placeholder = "Wybierz datę i godzinę",
  disabled = false,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Parse current value
  const parsedDate = React.useMemo(() => {
    if (!value) return undefined
    const d = new Date(value)
    return isValid(d) ? d : undefined
  }, [value])

  const [date, setDate] = React.useState<Date | undefined>(parsedDate)
  const [hour, setHour] = React.useState<string>("12")
  const [minute, setMinute] = React.useState<string>("00")

  // Sync state with value prop
  React.useEffect(() => {
    if (parsedDate) {
      setDate(parsedDate)
      setHour(parsedDate.getHours().toString().padStart(2, "0"))
      setMinute(parsedDate.getMinutes().toString().padStart(2, "0"))
    } else {
      setDate(undefined)
    }
  }, [parsedDate])

  // Trigger onChange when state changes
  const updateDateTime = (newDate: Date | undefined, newHour: string, newMinute: string) => {
    if (!newDate) {
      onChange("")
      return
    }

    const updated = new Date(newDate)
    updated.setHours(parseInt(newHour))
    updated.setMinutes(parseInt(newMinute))
    updated.setSeconds(0)
    updated.setMilliseconds(0)

    const formatted = format(updated, "yyyy-MM-dd'T'HH:mm")
    onChange(formatted)
  }

  const handleDateSelect = (selectedDay: Date | undefined) => {
    setDate(selectedDay)
    updateDateTime(selectedDay, hour, minute)
  }

  const handleHourChange = (newHour: string) => {
    setHour(newHour)
    if (date) {
      updateDateTime(date, newHour, minute)
    }
  }

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute)
    if (date) {
      updateDateTime(date, hour, newMinute)
    }
  }

  // Generate arrays for hours and minutes select options
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))

  // Format label for button
  const displayLabel = React.useMemo(() => {
    if (!parsedDate) return placeholder
    return format(parsedDate, "d MMMM yyyy, HH:mm", { locale: pl })
  }, [parsedDate, placeholder])

  return (
    <div className={cn("relative w-full", className)}>
      <style>{customCalendarStyles}</style>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className={cn(
              "w-full justify-start text-left font-normal h-10 border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              !parsedDate && "text-muted-foreground",
              isOpen && "ring-2 ring-ring ring-offset-2"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{displayLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 flex flex-col space-y-3 z-[9999]" align="start">
          <div className="border border-border rounded-md overflow-hidden bg-background">
            <DayPicker
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              locale={pl}
              showOutsideDays
              className="p-3"
            />
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3 px-1">
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>Godzina rozpoczęcia:</span>
            </div>
            <div className="flex items-center gap-1">
              <Select value={hour} onValueChange={handleHourChange} disabled={!date}>
                <SelectTrigger className="w-[70px] h-9 focus:ring-0">
                  <SelectValue placeholder="GG" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] z-[10000]">
                  {hours.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground font-semibold px-0.5">:</span>
              <Select value={minute} onValueChange={handleMinuteChange} disabled={!date}>
                <SelectTrigger className="w-[70px] h-9 focus:ring-0">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] z-[10000]">
                  {minutes.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
