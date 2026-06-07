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
import { Coins, AlertCircle, Loader2 } from "lucide-react"
import { LawFirm, Category, Voivodeship } from "../types"
import { getPromotionTypeLabel, formatDate, MOST_CONSULTED_CATEGORIES } from "../utils"

interface ConfirmPromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedType: string
  promotionTypes: any[]
  duration: number
  startDate: string
  selectedCategory: string
  categories: Category[]
  selectedVoivodeship: string
  voivodeships: Voivodeship[]
  autoRenewal: boolean
  calculateCost: () => number
  lawFirm: LawFirm | null
  submitting: boolean
  onSubmit: () => void
}

export function ConfirmPromotionDialog({
  open,
  onOpenChange,
  selectedType,
  promotionTypes,
  duration,
  startDate,
  selectedCategory,
  categories,
  selectedVoivodeship,
  voivodeships,
  autoRenewal,
  calculateCost,
  lawFirm,
  submitting,
  onSubmit,
}: ConfirmPromotionDialogProps) {
  const cost = calculateCost()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#20201d] border-[#3e3e38] text-white rounded-2xl sm:max-w-[480px]">
        <DialogHeader className="pb-3 border-b border-[#3e3e38]/60">
          <DialogTitle className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Coins className="h-5 w-5 text-secondary" />
            Potwierdź Aktywację
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Sprawdź szczegóły przed ostateczną transakcją w systemie
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Confirmation details receipt card */}
          <div className="bg-[#363431]/30 border border-[#3e3e38] rounded-xl p-4 space-y-3 text-xs leading-relaxed">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Format kampanii:</span>
              <span className="font-semibold text-white">
                {getPromotionTypeLabel(selectedType, promotionTypes)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Okres ważności:</span>
              <span className="font-semibold text-white">
                {selectedType === "POLECANI_PRAWNICY" ||
                  selectedType === "NAJCZESCIEJ_KONSULTOWANE"
                  ? "1 miesiąc kalendarzowy"
                  : `${duration} dni`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Rozpoczęcie:</span>
              <span className="font-semibold text-white">
                {selectedType === "POLECANI_PRAWNICY" ||
                  selectedType === "NAJCZESCIEJ_KONSULTOWANE"
                  ? startDate
                    ? new Date(startDate).toLocaleDateString("pl-PL", {
                      month: "long",
                      year: "numeric",
                    })
                    : "-"
                  : startDate
                    ? formatDate(new Date(startDate))
                    : "-"}
              </span>
            </div>

            {selectedCategory && selectedCategory !== "all" && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Kategoria:</span>
                <span className="font-semibold text-white">
                  {selectedType === "POLECANI_PRAWNICY"
                    ? selectedCategory
                    : selectedType === "NAJCZESCIEJ_KONSULTOWANE"
                      ? MOST_CONSULTED_CATEGORIES.find((c) => c.id === selectedCategory)?.name ||
                      selectedCategory
                      : categories.find((c) => c.id === selectedCategory)?.nazwa ||
                      selectedCategory}
                </span>
              </div>
            )}
            {selectedVoivodeship && selectedVoivodeship !== "all" && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Województwo:</span>
                <span className="font-semibold text-white">
                  {voivodeships.find((v) => v.id === selectedVoivodeship)?.nazwa ||
                    selectedVoivodeship}
                </span>
              </div>
            )}
            {selectedType !== "POLECANI_PRAWNICY" &&
              selectedType !== "NAJCZESCIEJ_KONSULTOWANE" && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Auto-przedłużenie:</span>
                  <span className="font-semibold text-white">
                    {autoRenewal ? "Aktywne" : "Nieaktywne"}
                  </span>
                </div>
              )}
          </div>

          {/* Price block */}
          <div className="bg-[#20201d]/60 border border-[#3e3e38] p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Pobierane punkty:</span>
              <span className="font-extrabold text-lg text-primary">{cost} pkt</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground pt-1 border-t border-[#3e3e38]/40">
              <span>Twoje saldo po transakcji:</span>
              <span className="font-semibold text-white">
                {lawFirm ? lawFirm.punktySaldo - cost : 0} pkt
              </span>
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 flex gap-2.5">
            <AlertCircle className="h-4.5 w-4.5 text-secondary flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-[#b7b5a9] leading-relaxed">
              <strong>Uwaga transakcji:</strong> Punkty zostaną bezzwrotnie pobrane z Twojego
              salda natychmiast po zatwierdzeniu. Aktywacja formatu nastąpi automatycznie
              zgodnie z podaną datą rozpoczęcia.
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-[#3e3e38]/60 pt-4 flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="border-[#3e3e38] bg-[#363431]/20 hover:bg-[#363431] text-white rounded-xl"
          >
            Cofnij
          </Button>
          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="bg-gradient-to-r from-secondary to-[#cba355] hover:from-[var(--secondary-hover)] hover:to-secondary text-[#30302e] font-bold px-6 rounded-xl transition-all duration-200"
          >
            {submitting ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              "Potwierdzam i kupuję"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
