import React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  Coins,
  RefreshCw,
  MapPin,
  Sparkles,
  Calendar,
  Info,
} from "lucide-react"
import { Promotion, Category, Voivodeship } from "../types"
import {
  getIconComponent,
  getPromotionTypeLabel,
  getPromotionSuccessDetails,
  MOST_CONSULTED_CATEGORIES,
} from "../utils"

interface PromotionSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchasedPromotion: Promotion | null
  promotionTypes: any[]
  categories: Category[]
  voivodeships: Voivodeship[]
}

export function PromotionSuccessDialog({
  open,
  onOpenChange,
  purchasedPromotion,
  promotionTypes,
  categories,
  voivodeships,
}: PromotionSuccessDialogProps) {
  if (!purchasedPromotion) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#20201d] shadow-2xl">
        <div className="relative p-6 sm:p-8 space-y-6">
          {/* Header backdrop effect */}
          <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

          <div className="text-center space-y-3 relative z-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md shadow-emerald-500/10 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold text-emerald-400 font-playfair tracking-tight">
                Promocja Zamówiona Pomyślnie!
              </DialogTitle>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Dziękujemy za zaufanie. Twój pakiet promowania został zarejestrowany. Oto szczegóły Twojej kampanii.
              </p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            {/* Visual Campaign Ticket */}
            <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 to-[#363431]/20 p-5 shadow-inner">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 blur-lg"></div>

              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#20201d] border border-emerald-500/20 flex-shrink-0 shadow-sm text-emerald-400">
                  {(() => {
                    const promoType = promotionTypes.find((p) => p.type === purchasedPromotion.typPromocji)
                    const Icon = getIconComponent(purchasedPromotion.typPromocji)
                    return (
                      <Icon className="h-6 w-6" style={{ color: promoType?.color || "#3b82f6" }} />
                    )
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-muted-foreground uppercase font-bold tracking-wider">
                    Format kampanii
                  </div>
                  <div className="font-extrabold text-base text-white truncate mt-0.5">
                    {getPromotionTypeLabel(purchasedPromotion.typPromocji, promotionTypes)}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 px-2 py-0.5 text-sm font-bold gap-1 hover:bg-emerald-500/10"
                    >
                      <Coins className="h-3 w-3" />
                      Koszt: {purchasedPromotion.kosztPunktow} pkt
                    </Badge>
                    {purchasedPromotion.automatyczneOdnowienie && (
                      <Badge
                        variant="secondary"
                        className="bg-sky-500/10 text-sky-400 border-sky-500/20 text-sm px-2 py-0.5 hover:bg-sky-500/10"
                      >
                        <RefreshCw
                          className="h-2.5 w-2.5 mr-1 animate-spin"
                          style={{ animationDuration: "4s" }}
                        />
                        Autoprzedłużenie
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Roadmap (Gdzie, Jak, Kiedy) */}
            <div className="space-y-4 bg-[#363431]/20 border border-[#3e3e38] rounded-xl p-4">
              {(() => {
                const isMonthly =
                  purchasedPromotion.typPromocji === "POLECANI_PRAWNICY" ||
                  purchasedPromotion.typPromocji === "NAJCZESCIEJ_KONSULTOWANE"

                // Map category ID/code to user friendly name
                let categoryText = null
                if (purchasedPromotion.kategoriaPromocji) {
                  if (purchasedPromotion.typPromocji === "NAJCZESCIEJ_KONSULTOWANE") {
                    categoryText =
                      MOST_CONSULTED_CATEGORIES.find(
                        (c) => c.id === purchasedPromotion.kategoriaPromocji
                      )?.name || purchasedPromotion.kategoriaPromocji
                  } else if (purchasedPromotion.typPromocji === "POLECANI_PRAWNICY") {
                    categoryText = purchasedPromotion.kategoriaPromocji
                  } else {
                    categoryText =
                      categories.find((c) => c.id === purchasedPromotion.kategoriaPromocji)
                        ?.nazwa || purchasedPromotion.kategoriaPromocji
                  }
                }

                // Map voivodeship ID to name
                let voivodeshipText = null
                if (purchasedPromotion.wojewodztwoPromocji) {
                  voivodeshipText =
                    voivodeships.find((v) => v.id === purchasedPromotion.wojewodztwoPromocji)
                      ?.nazwa || purchasedPromotion.wojewodztwoPromocji
                }

                const details = getPromotionSuccessDetails(
                  purchasedPromotion.typPromocji,
                  categoryText,
                  voivodeshipText
                )

                return (
                  <div className="space-y-4">
                    {/* GDZIE BĘDZIE PROMOWANE */}
                    <div className="flex gap-3 items-start group">
                      <div className="mt-0.5 p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          GDZIE będzie promowane?
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {details.gdzie}
                        </p>
                      </div>
                    </div>

                    {/* JAK BĘDZIE PROMOWANE */}
                    <div className="flex gap-3 items-start group">
                      <div className="mt-0.5 p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          JAK będzie promowane?
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {details.jak}
                        </p>
                      </div>
                    </div>

                    {/* KIEDY BĘDZIE PROMOWANE */}
                    <div className="flex gap-3 items-start group">
                      <div className="mt-0.5 p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex-shrink-0 group-hover:bg-sky-500/20 transition-colors">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          KIEDY będzie promowane?
                        </h4>
                        <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
                          <p>{details.kiedy}</p>
                          <div className="mt-1 px-3 py-2 bg-[#20201d]/60 border border-[#3e3e38] rounded-lg inline-flex items-center gap-1.5">
                            <span className="font-semibold text-white">Okres ważności:</span>
                            {isMonthly ? (
                              <span className="text-[#0da192] font-semibold">
                                {new Date(purchasedPromotion.startPromocji).toLocaleDateString(
                                  "pl-PL",
                                  { month: "long", year: "numeric" }
                                )}
                              </span>
                            ) : (
                              <span className="text-[#0da192] font-semibold">
                                {new Date(purchasedPromotion.startPromocji).toLocaleDateString(
                                  "pl-PL"
                                )}{" "}
                                -{" "}
                                {new Date(purchasedPromotion.koniecPromocji).toLocaleDateString(
                                  "pl-PL"
                                )}{" "}
                                ({purchasedPromotion.czasTrwaniaDni} dni)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Helpful footer alert */}
            <div className="p-3.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-normal">
                Wszystkie swoje aktywne i zaplanowane promowania możesz wygodnie kontrolować w
                sekcji <strong>&quot;Panel Kontrolny Kampanii&quot;</strong>. Szczegółowe
                potwierdzenie z instrukcjami zostało wysłane również na adres e-mail eksperta.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#363431]/20 px-6 py-4 border-t border-[#3e3e38]/60 flex justify-end">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 shadow-lg shadow-emerald-950/20 transition-all rounded-xl border-t border-white/10"
            onClick={() => onOpenChange(false)}
          >
            Rozumiem, dziękuję!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
