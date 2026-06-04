"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, User, Tag } from "lucide-react"

interface Service {
  id: string
  nazwaUslugi: string
  opisUslugi: string
  cenaOd?: number | null
  cenaDo?: number | null
  jednostka: string
}

interface LawFirm {
  categories: Array<{
    id: string
    category: {
      nazwa: string
      slug: string
      opis?: string | null
      opisDodatkowy?: string | null
      typ: string
    }
  }>
  services?: Service[]
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
  const hasServices = firmServices.length > 0

  if (!hasCategories && !hasServices) {
    return (
      <Card className="border border-border/50 shadow-sm rounded-2xl">
        <CardContent className="py-16 text-center text-muted-foreground font-medium">
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
          {firmCategories.filter((c) => c.category.typ === "SPRAWY_FIRMOWE").length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                <Shield className="h-5 w-5 text-primary" />
                Sprawy firmowe (dedykowane biznesowi)
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {firmCategories
                  .filter((c) => c.category.typ === "SPRAWY_FIRMOWE")
                  .map((lawFirmCategory) => (
                    <Card key={lawFirmCategory.id} className="border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300 shadow-sm rounded-2xl flex flex-col justify-between overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start gap-3">
                          <CardTitle className="text-base font-bold text-foreground leading-snug">
                            {lawFirmCategory.category.nazwa}
                          </CardTitle>
                          <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-2 py-0.5 rounded-lg text-xs font-semibold flex-shrink-0">
                            Firmowe
                          </Badge>
                        </div>
                        {lawFirmCategory.category.opis && (
                          <CardDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {lawFirmCategory.category.opis}
                          </CardDescription>
                        )}
                      </CardHeader>
                      {lawFirmCategory.category.opisDodatkowy && (
                        <CardContent className="pt-0 pb-4 px-6 border-t border-border/20 bg-muted/5">
                          <p className="text-xs text-muted-foreground leading-relaxed mt-3">
                            {lawFirmCategory.category.opisDodatkowy}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Sprawy prywatne */}
          {firmCategories.filter((c) => c.category.typ === "SPRAWY_PRYWATNE").length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                <User className="h-5 w-5 text-primary" />
                Sprawy prywatne (dla osób fizycznych)
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {firmCategories
                  .filter((c) => c.category.typ === "SPRAWY_PRYWATNE")
                  .map((lawFirmCategory) => (
                    <Card key={lawFirmCategory.id} className="border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300 shadow-sm rounded-2xl flex flex-col justify-between overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start gap-3">
                          <CardTitle className="text-base font-bold text-foreground leading-snug">
                            {lawFirmCategory.category.nazwa}
                          </CardTitle>
                          <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground border border-border/60 px-2 py-0.5 rounded-lg text-xs font-semibold flex-shrink-0">
                            Prywatne
                          </Badge>
                        </div>
                        {lawFirmCategory.category.opis && (
                          <CardDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {lawFirmCategory.category.opis}
                          </CardDescription>
                        )}
                      </CardHeader>
                      {lawFirmCategory.category.opisDodatkowy && (
                        <CardContent className="pt-0 pb-4 px-6 border-t border-border/20 bg-muted/5">
                          <p className="text-xs text-muted-foreground leading-relaxed mt-3">
                            {lawFirmCategory.category.opisDodatkowy}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cennik usług indywidualnych */}
      {hasServices && (
        <div className="space-y-4 pt-4 border-t border-border/30">
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Cennik usług indywidualnych
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {firmServices.map((service) => (
              <Card key={service.id} className="border border-border/50 hover:border-primary/25 hover:shadow-md transition-all duration-300 shadow-sm rounded-2xl flex flex-col justify-between overflow-hidden bg-card">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-base font-bold text-foreground leading-snug">{service.nazwaUslugi}</CardTitle>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-semibold px-2 py-0.5 rounded-lg text-xs flex-shrink-0">
                      {serviceUnitLabels[service.jednostka] || service.jednostka}
                    </Badge>
                  </div>
                  {service.opisUslugi && (
                    <CardDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">{service.opisUslugi}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-3 pb-4 px-6 border-t border-border/20 bg-muted/5 flex items-center justify-between mt-auto">
                  <span className="text-xs text-muted-foreground font-medium">Cena:</span>
                  <span className="text-base font-extrabold text-primary">
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
