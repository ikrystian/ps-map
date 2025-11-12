"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CheckCircle2,
  Package,
  Loader2,
  AlertCircle,
  Check,
  X,
  Gift,
} from "lucide-react"

interface LawFirm {
  id: string
  nazwa: string
  pakietSubskrypcji: string
  dataPakietuOd: string | null
  dataPakietuDo: string | null
}

interface SubscriptionPlan {
  id: string
  typ: string
  nazwa: string
  cena1Miesiac: number | null
  cena6Miesiecy: number | null
  cena12Miesiecy: number
  dostepDoSpraw: number | null
  kategorieSpraw: number | null
  wojewodztwa: number
  miasta: number
  priorytetWyszukiwanie: boolean
  osobistyOpiekun: number
  artykutySponsoro: boolean
  specjalneOznaczenie: string | null
  statystykiAnalizy: boolean
  mozliwoscBloga: boolean
  wsparcieMarketingowe: boolean
  promowanieProfilu: boolean
  powiadomieniaSprawy: number
  liczbaTakow: number
  zalaczniki: boolean
  coverBaner: boolean
  wyswietlanieReklam: boolean
  punktyGratis: number
  skillLawFocus: boolean
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const renderValue = (value: any): string => {
  if (value === null || value === undefined) return "∞"
  if (typeof value === "boolean") return value ? "Tak" : "-"
  if (typeof value === "number") return value.toString()
  return value.toString()
}

export default function LawFirmPackagePage() {
  const { data: session } = useSession()
  const [lawFirm, setLawFirm] = useState<LawFirm | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [selectedPeriods, setSelectedPeriods] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [session])

  const fetchData = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    setError(null)

    try {
      const [firmResponse, plansResponse] = await Promise.all([
        fetch("/api/law-firms/me"),
        fetch("/api/subscription-plans"),
      ])

      if (!firmResponse.ok) {
        throw new Error("Nie udało się pobrać danych kancelarii")
      }
      if (!plansResponse.ok) {
        throw new Error("Nie udało się pobrać pakietów")
      }

      const firmData = await firmResponse.json()
      const plansData = await plansResponse.json()

      setLawFirm(firmData)
      setPlans(plansData)

      // Initialize selected periods to 12 months
      const initialPeriods: Record<string, string> = {}
      plansData.forEach((plan: SubscriptionPlan) => {
        initialPeriods[plan.id] = "12"
      })
      setSelectedPeriods(initialPeriods)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setLoading(false)
    }
  }

  const getPrice = (plan: SubscriptionPlan, period: string) => {
    switch (period) {
      case "1":
        return plan.cena1Miesiac ? `${plan.cena1Miesiac} zł / miesięcznie` : "-"
      case "6":
        return plan.cena6Miesiecy ? `${plan.cena6Miesiecy} zł / 6 miesięcy` : "-"
      case "12":
      default:
        return `${plan.cena12Miesiecy} zł / rok`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !lawFirm) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error || "Nie udało się załadować danych"}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const features = [
    { label: "Dostęp do spraw", key: "dostepDoSpraw" },
    { label: "Kategorie spraw", key: "kategorieSpraw" },
    { label: "Województwa", key: "wojewodztwa" },
    { label: "Miasta", key: "miasta" },
    { label: "Priorytet w wyszukiwaniu", key: "priorytetWyszukiwanie" },
    { label: "Osobisty opiekun klienta", key: "osobistyOpiekun" },
    { label: "Artykuły sponsorowane", key: "artykutySponsoro" },
    { label: "Specjalne oznaczenie profilu", key: "specjalneOznaczenie" },
    { label: "Statystyki i analizy", key: "statystykiAnalizy" },
    { label: "Możliwość prowadzenia bloga", key: "mozliwoscBloga" },
    { label: "Wsparcie marketingowe", key: "wsparcieMarketingowe" },
    { label: "Promowanie profilu na stronie głównej", key: "promowanieProfilu" },
    { label: "Powiadomienia o nowych sprawach", key: "powiadomieniaSprawy" },
    { label: "Liczba tagów", key: "liczbaTakow" },
    { label: "Załączniki", key: "zalaczniki" },
    { label: "Cover baner", key: "coverBaner" },
    { label: "Wyświetlanie reklam", key: "wyswietlanieReklam" },
    { label: "Skill Law Focus", key: "skillLawFocus" },
    { label: "Punkty gratis", key: "punktyGratis" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pakiety subskrypcji</h1>
        <p className="text-muted-foreground mt-2">
          Wybierz pakiet dostosowany do potrzeb Twojej kancelarii
        </p>
      </div>

      {/* Current Package */}
      <Card>
        <CardHeader>
          <CardTitle>Twój aktualny pakiet</CardTitle>
          <CardDescription>Szczegóły Twojej subskrypcji</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">
                    {plans.find(p => p.typ === lawFirm.pakietSubskrypcji)?.nazwa || lawFirm.pakietSubskrypcji}
                  </h3>
                  <Badge variant="default">Aktywny</Badge>
                </div>
                {lawFirm.dataPakietuDo && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Ważny do: {formatDate(lawFirm.dataPakietuDo)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Porównanie pakietów</CardTitle>
          <CardDescription>
            Porównaj funkcjonalności wszystkich dostępnych pakietów
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-border p-4 text-left font-semibold">Funkcjonalność</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="border-b border-border p-4 text-center font-semibold">
                      <div className="flex flex-col gap-2">
                        <span className="text-lg">{plan.nazwa}</span>
                        {plan.typ === lawFirm.pakietSubskrypcji && (
                          <Badge variant="default" className="mx-auto">Aktywny</Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={feature.key} className={index % 2 === 0 ? "bg-muted/30" : ""}>
                    <td className="border-b border-border p-4 font-medium">{feature.label}</td>
                    {plans.map((plan) => {
                      const value = plan[feature.key as keyof SubscriptionPlan]
                      return (
                        <td key={plan.id} className="border-b border-border p-4 text-center">
                          {typeof value === "boolean" ? (
                            value ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            <span>{renderValue(value)}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                {/* Price Row */}
                <tr className="bg-muted/50">
                  <td className="border-b border-border p-4 font-semibold">Cena</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="border-b border-border p-4">
                      <div className="flex flex-col gap-2">
                        <Select
                          value={selectedPeriods[plan.id] || "12"}
                          onValueChange={(value) =>
                            setSelectedPeriods({ ...selectedPeriods, [plan.id]: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {plan.cena1Miesiac && (
                              <SelectItem value="1">1 miesiąc</SelectItem>
                            )}
                            {plan.cena6Miesiecy && (
                              <SelectItem value="6">6 miesięcy</SelectItem>
                            )}
                            <SelectItem value="12">12 miesięcy</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-center font-semibold">
                          {getPrice(plan, selectedPeriods[plan.id] || "12")}
                        </div>
                        {plan.punktyGratis > 0 && (
                          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <Gift className="h-4 w-4" />
                            <span>{plan.punktyGratis} punktów gratis!</span>
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
                {/* Action Row */}
                <tr>
                  <td className="p-4"></td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="p-4">
                      {plan.typ === lawFirm.pakietSubskrypcji ? (
                        <Button variant="outline" className="w-full" disabled>
                          Twój obecny pakiet
                        </Button>
                      ) : (
                        <Button className="w-full">
                          Wybieram
                        </Button>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Najczęściej zadawane pytania</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">Czy mogę zmienić pakiet w każdej chwili?</h4>
            <p className="text-sm text-muted-foreground">
              Tak, możesz zmienić pakiet w dowolnym momencie. Przy zmianie na wyższy pakiet, opłata zostanie proporcjonalnie przeliczona.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Co się stanie z moimi punktami przy zmianie pakietu?</h4>
            <p className="text-sm text-muted-foreground">
              Wszystkie punkty pozostają na Twoim koncie. Przy wyższych pakietach otrzymujesz dodatkowe punkty co miesiąc.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Czy mogę zrezygnować z pakietu płatnego?</h4>
            <p className="text-sm text-muted-foreground">
              Tak, możesz w każdej chwili powrócić do pakietu Podstawowego. Subskrypcja płatna będzie aktywna do końca opłaconego okresu.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Czy mogę otrzymać fakturę VAT?</h4>
            <p className="text-sm text-muted-foreground">
              Tak, dla wszystkich pakietów płatnych wystawiamy faktury VAT automatycznie po każdej płatności.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
