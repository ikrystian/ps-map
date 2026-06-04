import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Plus, Calendar, Info, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { LawFirm, Category, Voivodeship } from "../types"
import {
  getIconComponent,
  getPromotionTypeLabel,
  getFutureMonths,
  RECOMMENDED_LAWYERS_CATEGORIES,
  MOST_CONSULTED_CATEGORIES,
} from "../utils"

interface NewPromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedType: string
  promotionTypes: any[]
  duration: number
  setDuration: (duration: number) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  categories: Category[]
  selectedVoivodeship: string
  setSelectedVoivodeship: (voivodeship: string) => void
  voivodeships: Voivodeship[]
  startDate: string
  setStartDate: (date: string) => void
  autoRenewal: boolean
  setAutoRenewal: (auto: boolean) => void
  availability: {
    totalSlots: number
    occupiedSlots: number
    availableSlots: number
  } | null
  checkingAvailability: boolean
  calculateCost: () => number
  lawFirm: LawFirm | null
  submitting: boolean
  isFormInvalid: () => boolean
  onOpenConfirmation: () => void
}

export function NewPromotionDialog({
  open,
  onOpenChange,
  selectedType,
  promotionTypes,
  duration,
  setDuration,
  selectedCategory,
  setSelectedCategory,
  categories,
  selectedVoivodeship,
  setSelectedVoivodeship,
  voivodeships,
  startDate,
  setStartDate,
  autoRenewal,
  setAutoRenewal,
  availability,
  checkingAvailability,
  calculateCost,
  lawFirm,
  submitting,
  isFormInvalid,
  onOpenConfirmation,
}: NewPromotionDialogProps) {
  const cost = calculateCost()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] bg-[#20201d] border-[#3e3e38] text-white rounded-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="pb-3 border-b border-[#3e3e38]/60">
          <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Plus className="h-5 w-5 text-[#0da192]" />
            Konfiguracja Promowania
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Wypełnij parametry, aby dopełnić zamówienie formatu w portalu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Wybrany format info card */}
          {selectedType && (
            <div className="relative overflow-hidden rounded-xl border border-[#3e3e38] bg-[#363431]/30 p-4">
              {(() => {
                const promo = promotionTypes.find((p) => p.type === selectedType)
                if (!promo) return null
                const Icon = getIconComponent(promo.icon)
                return (
                  <div className="flex items-center gap-3.5">
                    <div
                      className="p-2.5 rounded-lg border shadow-inner"
                      style={{
                        backgroundColor: `${promo.color || "#3b82f6"}15`,
                        borderColor: `${promo.color || "#3b82f6"}30`,
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: promo.color || "#3b82f6" }} />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-white">{promo.label}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
                        {promo.description}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* Czas trwania */}
          {selectedType &&
            (selectedType === "POLECANI_PRAWNICY" || selectedType === "NAJCZESCIEJ_KONSULTOWANE") ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Czas trwania
              </Label>
              <div className="p-3 bg-[#363431]/20 border border-[#3e3e38] rounded-xl text-xs font-medium text-[#d7b56d] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Gwarantowane 1 pełny miesiąc kalendarzowy (automatycznie od 1. do końca miesiąca)
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label
                htmlFor="duration"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Czas trwania (dni) *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="90"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                  className="bg-[#363431]/30 border-[#3e3e38] text-white rounded-xl h-10 px-3 text-sm focus-visible:ring-[#0da192]"
                />
                {/* Presets */}
                <div className="flex gap-1">
                  {[7, 14, 30, 90].map((d) => (
                    <Button
                      key={d}
                      type="button"
                      variant="outline"
                      onClick={() => setDuration(d)}
                      className={cn(
                        "px-3 h-10 rounded-xl text-xs font-medium border-[#3e3e38] bg-[#363431]/30",
                        duration === d
                          ? "bg-[#0da192] border-[#0da192] text-white"
                          : "text-muted-foreground hover:bg-[#363431] hover:text-white"
                      )}
                    >
                      {d}d
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Kategoria dla Polecani Prawnicy */}
          {selectedType === "POLECANI_PRAWNICY" && (
            <div className="space-y-2">
              <Label
                htmlFor="category-monthly-rec"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Wybierz kategorię prawnika *
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger
                  id="category-monthly-rec"
                  className="bg-[#363431]/30 border-[#3e3e38] rounded-xl h-10 text-xs text-white focus:ring-[#0da192]"
                >
                  <SelectValue placeholder="Wybierz kategorię zawodową" />
                </SelectTrigger>
                <SelectContent className="bg-[#30302e] border-[#3e3e38] text-white">
                  {RECOMMENDED_LAWYERS_CATEGORIES.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs"
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Kategoria dla najczęściej konsultowanych */}
          {selectedType === "NAJCZESCIEJ_KONSULTOWANE" && (
            <div className="space-y-2">
              <Label
                htmlFor="category-monthly-cons"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Wybierz kategorię spraw *
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger
                  id="category-monthly-cons"
                  className="bg-[#363431]/30 border-[#3e3e38] rounded-xl h-10 text-xs text-white focus:ring-[#0da192]"
                >
                  <SelectValue placeholder="Wybierz kategorię spraw" />
                </SelectTrigger>
                <SelectContent className="bg-[#30302e] border-[#3e3e38] text-white">
                  {MOST_CONSULTED_CATEGORIES.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id}
                      className="focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs"
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Kategoria (opcjonalna dla standardowych promocji) */}
          {selectedType &&
            selectedType !== "POLECANI_PRAWNICY" &&
            selectedType !== "NAJCZESCIEJ_KONSULTOWANE" && (
              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Kategoria (opcjonalna)
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger
                    id="category"
                    className="bg-[#363431]/30 border-[#3e3e38] rounded-xl h-10 text-xs text-white focus:ring-[#0da192]"
                  >
                    <SelectValue placeholder="Wszystkie kategorie" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#30302e] border-[#3e3e38] text-white">
                    <SelectItem
                      value="all"
                      className="focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs"
                    >
                      Wszystkie kategorie
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs"
                      >
                        {category.nazwa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

          {/* Województwo (opcjonalne) */}
          {selectedType &&
            selectedType !== "POLECANI_PRAWNICY" &&
            selectedType !== "NAJCZESCIEJ_KONSULTOWANE" && (
              <div className="space-y-2">
                <Label
                  htmlFor="voivodeship"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Województwo (opcjonalne)
                </Label>
                <Select value={selectedVoivodeship} onValueChange={setSelectedVoivodeship}>
                  <SelectTrigger
                    id="voivodeship"
                    className="bg-[#363431]/30 border-[#3e3e38] rounded-xl h-10 text-xs text-white focus:ring-[#0da192]"
                  >
                    <SelectValue placeholder="Wszystkie województwa" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#30302e] border-[#3e3e38] text-white">
                    <SelectItem
                      value="all"
                      className="focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs"
                    >
                      Wszystkie województwa
                    </SelectItem>
                    {voivodeships.map((voivodeship) => (
                      <SelectItem
                        key={voivodeship.id}
                        value={voivodeship.id}
                        className="focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs"
                      >
                        {voivodeship.nazwa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

          {/* Data startu / Wybór miesiąca */}
          {selectedType &&
            (selectedType === "POLECANI_PRAWNICY" || selectedType === "NAJCZESCIEJ_KONSULTOWANE") ? (
            <div className="space-y-2">
              <Label
                htmlFor="target-month"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Wybierz miesiąc promocji *
              </Label>
              <Select value={startDate} onValueChange={setStartDate}>
                <SelectTrigger
                  id="target-month"
                  className="bg-[#363431]/30 border-[#3e3e38] rounded-xl h-10 text-xs text-white focus:ring-[#0da192]"
                >
                  <SelectValue placeholder="Wybierz miesiąc kalendarzowy" />
                </SelectTrigger>
                <SelectContent className="bg-[#30302e] border-[#3e3e38] text-white">
                  {getFutureMonths().map((m) => (
                    <SelectItem
                      key={m.value}
                      value={m.value}
                      className="focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs"
                    >
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label
                htmlFor="start-date"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Data i godzina rozpoczęcia *
              </Label>
              <DateTimePicker
                id="start-date"
                value={startDate}
                onChange={setStartDate}
                className="bg-[#363431]/30 border-[#3e3e38] rounded-xl text-xs h-10 text-white focus:ring-[#0da192]"
              />
            </div>
          )}

          {/* Automatyczne odnowienie */}
          {selectedType &&
            selectedType !== "POLECANI_PRAWNICY" &&
            selectedType !== "NAJCZESCIEJ_KONSULTOWANE" && (
              <div className="p-3.5 bg-[#363431]/20 border border-[#3e3e38] rounded-xl flex items-start space-x-3.5">
                <Checkbox
                  id="auto-renewal"
                  checked={autoRenewal}
                  onCheckedChange={(checked) => setAutoRenewal(checked as boolean)}
                  className="mt-0.5 border-[#3e3e38] data-[state=checked]:bg-[#0da192] data-[state=checked]:border-[#0da192]"
                />
                <div
                  className="space-y-0.5 cursor-pointer"
                  onClick={() => setAutoRenewal(!autoRenewal)}
                >
                  <Label
                    htmlFor="auto-renewal"
                    className="text-xs font-bold text-white cursor-pointer"
                  >
                    Automatyczne odnowienie po zakończeniu
                  </Label>
                  <p className="text-sm text-muted-foreground leading-normal">
                    Po zakończeniu kampanii system automatycznie pobierze punkty i przedłuży
                    promocję na kolejny taki sam okres, gwarantując stałą obecność.
                  </p>
                </div>
              </div>
            )}

          {/* Sprawdzanie dostępności miejsc (Monthly capacity visualizer) */}
          {selectedType &&
            (selectedType === "POLECANI_PRAWNICY" ||
              selectedType === "NAJCZESCIEJ_KONSULTOWANE") &&
            startDate &&
            selectedCategory &&
            selectedCategory !== "all" && (
              <div className="bg-[#20201d]/60 border border-[#3e3e38] p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#b7b5a9] flex items-center gap-1.5 font-medium">
                    <Info className="h-4 w-4 text-[#0da192]" />
                    Dostępność limitowanych miejsc w tym miesiącu:
                  </span>
                  {checkingAvailability ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#0da192]" />
                  ) : availability ? (
                    <span
                      className={cn(
                        "font-bold",
                        availability.availableSlots > 0 ? "text-emerald-400" : "text-red-400"
                      )}
                    >
                      {availability.availableSlots} / {availability.totalSlots} wolnych
                    </span>
                  ) : (
                    <span className="text-red-400 font-medium">Brak danych</span>
                  )}
                </div>
                {availability && (
                  <div className="w-full bg-[#3e3e38] h-2 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        availability.availableSlots === 0
                          ? "bg-red-500"
                          : availability.availableSlots === 1
                            ? "bg-amber-500"
                            : "bg-[#0da192]"
                      )}
                      style={{
                        width: `${(availability.occupiedSlots / availability.totalSlots) * 100}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            )}

          {/* Ostrzeżenie o braku wolnych miejsc */}
          {availability && availability.availableSlots === 0 && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-2 text-xs animate-pulse">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>
                Brak wolnych miejsc w tym miesiącu dla wybranej kategorii! Wybierz inny miesiąc
                lub kategorię.
              </span>
            </div>
          )}

          <Separator className="bg-[#3e3e38]/50" />

          {/* Podsumowanie kosztów (Invoice summary) */}
          <div className="bg-[#363431]/20 border border-[#3e3e38] rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs text-[#b7b5a9]">
              <span>Czas trwania promowania</span>
              <span className="text-white font-medium">
                {selectedType &&
                  (selectedType === "POLECANI_PRAWNICY" ||
                    selectedType === "NAJCZESCIEJ_KONSULTOWANE")
                  ? "1 miesiąc kalendarzowy"
                  : `${duration} dni`}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-[#b7b5a9]">
              <span>Format kampanii</span>
              <span className="text-white font-medium">
                {selectedType ? getPromotionTypeLabel(selectedType, promotionTypes) : "-"}
              </span>
            </div>

            <div className="border-t border-[#3e3e38]/60 pt-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-white">Koszt całkowity</span>
              <span className="text-xl font-bold text-[#0da192]">{cost} pkt</span>
            </div>

            <div className="flex justify-between items-center text-sm text-muted-foreground pt-1">
              <span>Dostępne saldo: {lawFirm?.punktySaldo || 0} pkt</span>
              {lawFirm && (
                <span
                  className={cn(
                    "font-bold",
                    lawFirm.punktySaldo >= cost ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  Saldo po zakupie: {lawFirm.punktySaldo - cost} pkt
                </span>
              )}
            </div>
          </div>

          {lawFirm && lawFirm.punktySaldo < cost && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
              <AlertCircle className="h-4.5 w-4.5 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-bold">Niewystarczająca ilość punktów na koncie.</p>
                <p className="text-sm text-red-400/80 leading-normal">
                  Zasilono konto mniejszą liczbą punktów niż wymagana dla tej kampanii. Kliknij
                  anuluj i zakup dodatkowe punkty w panelu.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-[#3e3e38]/60 pt-4 flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="border-[#3e3e38] bg-[#363431]/20 hover:bg-[#363431] text-white rounded-xl"
          >
            Anuluj
          </Button>
          <Button
            onClick={onOpenConfirmation}
            disabled={submitting || isFormInvalid()}
            className="bg-[#0da192] hover:bg-[#0a8276] text-white font-medium px-5 rounded-xl transition-all duration-200"
          >
            Podsumowanie i zakup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
