/**
 * MonthView - Monthly Calendar View
 *
 * Displays a traditional month grid (7 columns x 5-6 rows) showing all days
 * in the current month. When a date is selected, a side panel shows available
 * time slots for that day.
 *
 * Features:
 * - Standard month calendar grid
 * - Side panel with time slot buttons for selected date
 * - Highlights today and selected date
 * - Dims out-of-month and past dates
 */

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getAvailForDate, getSlotsForDate, isPastDate } from "./helpers";
import { SlotBtn } from "./slot-btn";
import type { Availability, BookedSlot } from "./types";

/**
 * Renders the month view with a side panel for time slots.
 */
export function MonthView({
  current,
  selectedDate,
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
  selectedDate?: Date;
  availability: Availability[];
  bookedSlots: BookedSlot[];
  slotDuration: number;
  adminTZ: string;
  viewerTZ: string;
  locale?: string;
  onDateSelect: (d: Date) => void;
  onSlotSelect: (d: Date, t: string) => void;
}) {
  const weekStartsOn = locale === "pl" ? 1 : 0;
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(current), { weekStartsOn }),
    end: endOfWeek(endOfMonth(current), { weekStartsOn }),
  });

  const selectedSlots =
    selectedDate &&
    getSlotsForDate(
      selectedDate,
      availability,
      bookedSlots,
      slotDuration,
      adminTZ,
      viewerTZ,
      locale,
    );

  const shouldShowPanel =
    selectedDate &&
    isSameMonth(selectedDate, current) &&
    !isPastDate(selectedDate) &&
    selectedSlots &&
    selectedSlots.length > 0;
  return (
    <div className="w-full flex flex-col sm:flex-row gap-4">
      <div className="flex-1 pt-3 px-3 sm:px-0">
        <div className="grid grid-cols-7 mb-2 px-1">
          {(locale === "pl"
            ? ["Pon", "Wt", "Śr", "Cz", "Pt", "Sob", "Nie"]
            : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
          ).map((d) => (
            <div
              key={d}
              className="text-center text-[11px] font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:pb-2 sm:pl-3 sm:gap-2">
          {days.map((day, i) => {
            const avail = getAvailForDate(day, availability, adminTZ);
            const slots = getSlotsForDate(
              day,
              availability,
              bookedSlots,
              slotDuration,
              adminTZ,
              viewerTZ,
              locale,
            );

            const hasOpen = slots.some((s) => !s.booked);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const inMonth = isSameMonth(day, current);
            const isPast = isPastDate(day);

            return (
              <button
                key={i}
                disabled={isPast}
                onClick={() => !isPast && onDateSelect(day)}
                className={cn(
                  "aspect-square rounded-xl flex items-center justify-center p-2 cursor-pointer sm:p-3 transition-all",
                  "border border-transparent",
                  "hover:bg-muted/60",
                  isSelected &&
                  "bg-primary hover:bg-primary/80 hover:text-primary-foreground text-primary-foreground",
                  !inMonth && "opacity-30",
                  isPast && "opacity-20 cursor-not-allowed",
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium",
                    isToday(day) && !isSelected && "text-primary",
                  )}
                >
                  {format(day, "d")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {shouldShowPanel && (
        <div className="w-full sm:w-[320px] border-t sm:border-l sm:border-t-0 shrink-0 py-4 px-3 bg-background">
          <div className="mb-4">
            <p className="text-sm font-semibold">
              {(() => {
                const formatted = format(selectedDate, "EEEE", { locale: locale === "pl" ? pl : undefined });
                return formatted.charAt(0).toUpperCase() + formatted.slice(1);
              })()}
            </p>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const formatted = format(selectedDate, locale === "pl" ? "d MMMM" : "MMMM d", { locale: locale === "pl" ? pl : undefined });
                return formatted.charAt(0).toUpperCase() + formatted.slice(1);
              })()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {selectedSlots.map((slot) => (
              <SlotBtn
                key={slot.adminTime}
                slot={slot}
                date={selectedDate}
                adminTZ={adminTZ}
                viewerTZ={viewerTZ}
                onSlotSelect={onSlotSelect}
              />
            ))}
          </div>
        </div>
      )}
      {!shouldShowPanel && (
        <div className="max-h-103.5 overflow-y-scroll no-scrollbar w-full sm:w-[320px] border-t sm:border-l sm:border-t-0 shrink-0 py-4 px-3 bg-background">
          <div className="mb-4">
            <p className="text-sm font-semibold">
              {(() => {
                const formatted = format(selectedDate ?? new Date(), "EEEE", { locale: locale === "pl" ? pl : undefined });
                return formatted.charAt(0).toUpperCase() + formatted.slice(1);
              })()}
            </p>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const formatted = format(selectedDate ?? new Date(), locale === "pl" ? "d MMMM" : "MMMM d", { locale: locale === "pl" ? pl : undefined });
                return formatted.charAt(0).toUpperCase() + formatted.slice(1);
              })()}
            </p>
          </div>
          <div className="text-sm h-30 flex items-center justify-center border rounded-xl border-dashed font-medium text-muted-foreground">
            {locale === "pl" ? "Brak wolnych terminów" : "No slots available"}
          </div>
        </div>
      )}
    </div>
  );
}
