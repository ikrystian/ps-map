/**
 * AgendaView - Upcoming Availability List View
 *
 * Shows the next 30 days of available time slots in a chronological list.
 * Each day with availability is shown as a group with clickable time buttons.
 * Filters out days with no availability.
 *
 * Features:
 * - Shows next 30 days from today (or current date if in future)
 * - Only displays days with available slots
 * - Shows booked count per day
 * - Chronological order makes it easy to find next available slot
 */

import { addDays, format, isBefore, isToday, startOfDay } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAvailForDate, getSlotsForDate } from "./helpers";
import { SlotTip } from "./tooltip";
import type { Availability, BookedSlot } from "./types";

/**
 * Renders the agenda view showing upcoming availability chronologically.
 */
export function AgendaView({
  current,
  availability,
  bookedSlots,
  slotDuration,
  adminTZ,
  viewerTZ,
  locale = "en",
  onDateSelect,
  onSlotSelect,
}: {
  current: Date;
  availability: Availability[];
  bookedSlots: BookedSlot[];
  slotDuration: number;
  adminTZ: string;
  viewerTZ: string;
  locale?: string;
  onDateSelect: (d: Date) => void;
  onSlotSelect: (d: Date, t: string) => void;
}) {
  const start = isBefore(startOfDay(current), startOfDay(new Date()))
    ? new Date()
    : current;
  const activeDays = Array.from({ length: 30 }, (_, i) =>
    addDays(start, i),
  ).filter((d) => getAvailForDate(d, availability, adminTZ));

  return (
    <ScrollArea className="h-[520px]">
      <div className="p-4 space-y-6">
        {activeDays.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
            <Calendar className="h-8 w-8 opacity-30" />
            <p className="text-sm">
              {locale === "pl"
                ? "Brak wolnych terminów w ciągu najbliższych 30 dni"
                : "No upcoming availability in the next 30 days"}
            </p>
          </div>
        )}
        {activeDays.map((day) => {
          const slots = getSlotsForDate(
            day,
            availability,
            bookedSlots,
            slotDuration,
            adminTZ,
            viewerTZ,
            locale,
          );
          const available = slots.filter((s) => !s.booked);
          return (
            <div key={day.toISOString()} className="flex gap-4">
              <div
                className="flex flex-col items-center w-14 shrink-0 cursor-pointer"
                onClick={() => onDateSelect(day)}
              >
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {locale === "pl"
                    ? format(day, "EEEEEE", { locale: pl }).toUpperCase()
                    : format(day, "EEE")}
                </span>
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold mt-0.5",
                    isToday(day)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent",
                  )}
                >
                  {format(day, "d")}
                </span>
                <span className="text-sm text-muted-foreground mt-0.5">
                  {locale === "pl"
                    ? format(day, "LLL", { locale: pl })
                    : format(day, "MMM")}
                </span>
              </div>
              <div className="flex-1 pt-1">
                <div className="flex flex-wrap gap-2">
                  {available.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">
                      {locale === "pl" ? "Wszystkie terminy zajęte" : "All slots booked"}
                    </span>
                  ) : (
                    available.map((slot) => {
                      const isPast = isBefore(new Date(slot.utc), new Date());
                      return (
                        <TooltipProvider
                          key={slot.adminTime}
                          delayDuration={80}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => {
                                  onDateSelect(day);
                                  onSlotSelect(day, slot.adminTime);
                                }}
                                disabled={isPast}
                                className="rounded-lg border border-border bg-background hover:border-primary hover:bg-primary/5 hover:text-primary px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-95 text-left"
                              >
                                {isPast && (
                                  <span className="block text-sm text-muted-foreground">
                                    {locale === "pl" ? "Minęło" : "Past"}
                                  </span>
                                )}
                                <span className="block">
                                  {slot.displayTime}
                                </span>
                                {adminTZ !== viewerTZ && (
                                  <span className="block text-sm text-muted-foreground">
                                    {slot.adminDisplayTime} {locale === "pl" ? "ekspert" : "host"}
                                  </span>
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <SlotTip
                                slot={slot}
                                adminTZ={adminTZ}
                                viewerTZ={viewerTZ}
                                locale={locale}
                              />
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })
                  )}
                </div>
                {slots.some((s) => s.booked) && (
                  <p className="text-sm text-muted-foreground mt-1.5">
                    {locale === "pl" ? (
                      `${slots.filter((s) => s.booked).length} już zarezerwowane`
                    ) : (
                      `${slots.filter((s) => s.booked).length} slot${slots.filter((s) => s.booked).length !== 1 ? "s" : ""} already booked`
                    )}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
