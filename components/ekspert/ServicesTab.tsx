"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, User, Tag } from "lucide-react"
import type { LawFirm } from "@/types"

interface Service {
  id: string
  nazwaUslugi: string
  opisUslugi: string
  cenaOd?: number | null
  cenaDo?: number | null
  jednostka: string
}

interface ServicesTabProps {
  lawFirm: LawFirm
}

const serviceUnitLabels: Record<string, string> = {
  ZA_USLUGE: "za usługę",
  ZA_GODZINE: "za godzinę",
  RYCZALT: "ryczałt",
  DO_UZGODNIENIA: "do uzgodnienia",
}

export function ServicesTab({ lawFirm }: ServicesTabProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount)
  }

  const firmCategories = lawFirm.categories || []
  const hasCategories = firmCategories.length > 0
  const firmServices = lawFirm.services || []
  const hasServices = hasCategories // In public view, categories determine services or pricing is separate

  if (!hasCategories && !firmServices.length) {
    return (
      <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl">
        <CardContent className="py-16 text-center text-zinc-400 font-medium">
          Brak zdefiniowanych usług i cennika.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {hasCategories && (
        <div className="space-y-8">
          {/* Sprawy firmowe */}
          {firmCategories.filter((c) => c.category && c.category.typ === "SPRAWY_FIRMOWE").length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5 font-playfair">
                <div className="bg-[#0da192]/10 p-1.5 rounded-lg text-[#0da192]">
                  <Shield className="h-5 w-5" />
                </div>
                <span>Sprawy firmowe (dedykowane biznesowi)</span>
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {firmCategories
                  .filter((c) => c.category && c.category.typ === "SPRAWY_FIRMOWE")
                  .map((lawFirmCategory) => lawFirmCategory.category && (
                    <Card key={lawFirmCategory.id} className="border border-border/30 bg-card/25 backdrop-blur-md hover:border-primary/40 hover:bg-card/35 hover:shadow-[0_0_20px_rgba(13,161,146,0.1)] transition-all duration-300 shadow-lg rounded-2xl flex flex-col justify-between overflow-hidden">
                      <CardHeader className="p-5">
                        <div className="flex justify-between items-start gap-3">
                          <CardTitle className="text-sm md:text-base font-bold text-white leading-snug">
                            {lawFirmCategory.category.nazwa}
                          </CardTitle>
                          <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-2.5 py-0.5 rounded-lg text-xs font-semibold flex-shrink-0">
                            Firmowe
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Sprawy prywatne */}
          {firmCategories.filter((c) => c.category && c.category.typ === "SPRAWY_PRYWATNE").length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5 font-playfair">
                <div className="bg-[#0da192]/10 p-1.5 rounded-lg text-[#0da192]">
                  <User className="h-5 w-5" />
                </div>
                <span>Sprawy prywatne (dla osób fizycznych)</span>
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {firmCategories
                  .filter((c) => c.category && c.category.typ === "SPRAWY_PRYWATNE")
                  .map((lawFirmCategory) => lawFirmCategory.category && (
                    <Card key={lawFirmCategory.id} className="border border-border/30 bg-card/25 backdrop-blur-md hover:border-primary/40 hover:bg-card/35 hover:shadow-[0_0_20px_rgba(13,161,146,0.1)] transition-all duration-300 shadow-lg rounded-2xl flex flex-col justify-between overflow-hidden">
                      <CardHeader className="p-5">
                        <div className="flex justify-between items-start gap-3">
                          <CardTitle className="text-sm md:text-base font-bold text-white leading-snug">
                            {lawFirmCategory.category.nazwa}
                          </CardTitle>
                          <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-lg text-xs font-semibold flex-shrink-0">
                            Prywatne
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cennik usług indywidualnych */}
      {firmServices.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border/20">
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5 font-playfair">
            <div className="bg-[#0da192]/10 p-1.5 rounded-lg text-[#0da192]">
              <Tag className="h-5 w-5" />
            </div>
            <span>Cennik usług indywidualnych</span>
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {firmServices.map((service) => (
              <Card key={service.id} className="border border-border/30 bg-card/25 backdrop-blur-md hover:border-primary/40 hover:bg-card/35 hover:shadow-[0_0_20px_rgba(13,161,146,0.1)] transition-all duration-300 shadow-lg rounded-2xl flex flex-col justify-between overflow-hidden">
                <CardHeader className="p-5">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-sm md:text-base font-bold text-white leading-snug">{service.nazwaUslugi}</CardTitle>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-semibold px-2 py-0.5 rounded-lg text-xs flex-shrink-0">
                      {serviceUnitLabels[service.jednostka] || service.jednostka}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 pb-4 px-6 border-t border-border/10 bg-white/5 flex items-center justify-between mt-auto">
                  <span className="text-xs text-zinc-400 font-semibold">Cena:</span>
                  <span className="text-sm md:text-base font-extrabold text-primary">
                    {service.cenaOd && service.cenaDo
                      ? `${formatCurrency(service.cenaOd)} - ${formatCurrency(service.cenaDo)}`
                      : service.cenaOd
                        ? `od ${formatCurrency(service.cenaOd)}`
                        : service.cenaDo
                          ? `do ${formatCurrency(service.cenaDo)}`
                          : "wycena indywidualna"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

