"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Info, CheckCircle2, ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { getIconComponent } from "../utils"

interface PromotionFormatsProps {
  promotionTypes: any[]
  handleOpenDialog: (type: string) => void
}

export function PromotionFormats({ promotionTypes, handleOpenDialog }: PromotionFormatsProps) {
  return (
    <div id="tour-promo-types" className="space-y-6 relative z-10">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#d7b56d]" />
          Dostępne Formaty Promowania
        </h2>
        <p className="text-xs text-muted-foreground">
          Wybierz format najlepiej dostosowany do celów biznesowych Twojej kancelarii.
        </p>
      </div>

      {promotionTypes.length === 0 ? (
        <Card className="border-[#3e3e38] bg-[#363431]/20">
          <CardContent className="py-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#3e3e38]/50 flex items-center justify-center mx-auto">
              <Info className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              Brak dostępnych konfiguracji promowania w bazie. Sprawdź ponownie później.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {promotionTypes.map((promo, idx) => {
            const Icon = getIconComponent(promo.icon)
            const isHighValue = promo.type === "WYROZNIENIE" || promo.type === "POLECANI_PRAWNICY"
            const isMainPage = promo.type === "STRONA_GLOWNA" || promo.type === "TOP_LISTA"

            return (
              <motion.div
                key={promo.type}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="h-full"
              >
                <Card
                  className={cn(
                    "h-full flex flex-col justify-between overflow-hidden relative border-[#3e3e38] bg-[#363431]/20 hover:bg-[#363431]/40 transition-all duration-300 rounded-2xl group shadow-md hover:shadow-lg hover:shadow-black/25",
                    isHighValue && "border-[#d7b56d]/30 shadow-[#d7b56d]/2 hover:border-[#d7b56d]/60",
                    isMainPage && "border-[#0da192]/30 shadow-[#0da192]/2 hover:border-[#0da192]/60"
                  )}
                >
                  {/* Glowing highlight orb */}
                  {isHighValue && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#d7b56d]/3 rounded-full blur-2xl group-hover:bg-[#d7b56d]/6 transition-all duration-300" />
                  )}

                  {/* Prestigous Badge */}
                  {isHighValue && (
                    <div className="absolute top-4 right-4 z-20">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#d7b56d]/10 border border-[#d7b56d]/20 text-[#d7b56d] text-sm font-bold uppercase tracking-wider">
                        Rekomendowane
                      </span>
                    </div>
                  )}
                  {isMainPage && !isHighValue && (
                    <div className="absolute top-4 right-4 z-20">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#0da192]/10 border border-[#0da192]/20 text-[#0da192] text-sm font-bold uppercase tracking-wider">
                        Maksymalny Zasięg
                      </span>
                    </div>
                  )}

                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="p-3 rounded-xl flex-shrink-0 shadow-md border relative transition-all duration-300 group-hover:scale-105"
                        style={{
                          backgroundColor: `${promo.color || '#3b82f6'}15`,
                          borderColor: `${promo.color || '#3b82f6'}30`
                        }}
                      >
                        <Icon className="h-6 w-6 relative z-10 transition-transform duration-300 group-hover:rotate-6" style={{ color: promo.color || '#3b82f6' }} />
                        <div className="absolute inset-0 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-all" style={{ backgroundColor: promo.color || '#3b82f6' }} />
                      </div>
                      <div className="space-y-1 pr-16">
                        <CardTitle className="text-lg font-bold text-white tracking-tight">{promo.label}</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">{promo.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 pb-6 pt-0 flex-grow flex flex-col justify-between space-y-6">
                    {/* Features List */}
                    <ul className="space-y-2.5 my-2">
                      {promo.features.map((feature: string, fIdx: number) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs text-[#b7b5a9] leading-relaxed">
                          <CheckCircle2
                            className="h-4 w-4 mt-0.5 flex-shrink-0"
                            style={{ color: isHighValue ? '#d7b56d' : '#0da192' }}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-4 pt-4 border-t border-[#3e3e38]/40">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-muted-foreground">Koszt promocji</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-extrabold text-white tracking-tight">
                            {promo.pointsPerMonth
                              ? `${promo.pointsPerMonth}`
                              : promo.pointsPerDay
                                ? `${promo.pointsPerDay}`
                                : `${promo.pointsPerWeek}`}
                          </span>
                          <span className="text-xs font-semibold text-muted-foreground">
                            pkt /{" "}
                            {promo.pointsPerMonth ? "miesiąc" : promo.pointsPerDay ? "dzień" : "tydzień"}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleOpenDialog(promo.type)}
                        className={cn(
                          "w-full h-10 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border-t border-white/5",
                          isHighValue
                            ? "bg-gradient-to-r from-[#d7b56d] to-[#cba355] text-[#30302e] hover:from-[#dfbf7c] hover:to-[#d7b56d] hover:shadow-lg hover:shadow-[#d7b56d]/10"
                            : "bg-[#363431] hover:bg-[#3e3e38] text-white border border-[#3e3e38]"
                        )}
                      >
                        Skonfiguruj i włącz
                        <ArrowUpRight className="h-4 w-4 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
