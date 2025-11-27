"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
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
  ShoppingCart,
  ArrowRight,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Coins } from "lucide-react"
import Link from "next/link"

const POINTS_PER_PLN = 2

interface LawFirm {
  id: string
  nazwa: string
  pakietSubskrypcji: string
  dataPakietuOd: string | null
  dataPakietuDo: string | null
  punktySaldo: number
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
  const router = useRouter()
  const [lawFirm, setLawFirm] = useState<LawFirm | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [selectedPeriods, setSelectedPeriods] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

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
        throw new Error("Nie udało się pobrać danych eksperta")
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
    const price = getPriceValue(plan, period)
    if (price === 0 && plan.typ !== "FREE") return "-"
    if (plan.typ === "FREE") return "Darmowy"

    const pointsCost = Math.round(price * POINTS_PER_PLN)
    return `${pointsCost} pkt`
  }

  const getPriceValue = (plan: SubscriptionPlan, period: string): number => {
    switch (period) {
      case "1":
        return plan.cena1Miesiac ?? 0
      case "6":
        return plan.cena6Miesiecy ?? 0
      case "12":
      default:
        return plan.cena12Miesiecy
    }
  }

  const getPeriodLabel = (period: string): string => {
    switch (period) {
      case "1":
        return "1 miesiąc"
      case "6":
        return "6 miesięcy"
      case "12":
      default:
        return "12 miesięcy"
    }
  }

  const handlePurchaseClick = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setShowConfirmDialog(true)
  }

  const handleConfirmPurchase = async () => {
    if (!selectedPlan) return
    setPurchasing(true)

    try {
      const period = parseInt(selectedPeriods[selectedPlan.id] || "12")

      const response = await fetch("/api/law-firms/me/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          period: period,
          metodaPlatnosci: "POINTS",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nie udało się aktywować pakietu")
      }

      toast.success("Pakiet został pomyślnie aktywowany!", {
        description: `Nowy pakiet: ${selectedPlan.nazwa}`,
      })

      setShowConfirmDialog(false)
      fetchData() // Odśwież dane
    } catch (err) {
      toast.error("Błąd aktywacji pakietu", {
        description: err instanceof Error ? err.message : "Spróbuj ponownie później",
      })
    } finally {
      setPurchasing(false)
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
        <h1 className="text-3xl font-medium tracking-tight font-playfair">Pakiety subskrypcji</h1>
        <p className="text-muted-foreground mt-2">
          Wybierz pakiet dostosowany do potrzeb Twojego profilu
        </p>
      </div>

      {/* Current Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Twój aktualny pakiet</CardTitle>
            <CardDescription>Szczegóły Twojej subskrypcji</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dostępne punkty</CardTitle>
            <CardDescription>Wykorzystaj je do aktywacji pakietów</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-amber-100 flex items-center justify-center">
                <Coins className="h-8 w-8 text-amber-500" />
              </div>
              <div>
                <div className="text-3xl font-bold">{lawFirm.punktySaldo} pkt</div>
                <Link href="/panel-eksperta/punkty">
                  <Button variant="link" className="px-0 h-auto">
                    Kup więcej punktów <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  {plans.map((plan) => {
                    const price = getPriceValue(plan, selectedPeriods[plan.id] || "12")
                    const pointsCost = Math.round(price * POINTS_PER_PLN)
                    const canAfford = lawFirm.punktySaldo >= pointsCost

                    return (
                      <td key={plan.id} className="p-4">
                        {plan.typ === lawFirm.pakietSubskrypcji ? (
                          <Button variant="outline" className="w-full" disabled>
                            Twój obecny pakiet
                          </Button>
                        ) : plan.typ === "FREE" ? (
                          <Button variant="outline" className="w-full" disabled>
                            Darmowy
                          </Button>
                        ) : (
                          <Button
                            className="w-full"
                            onClick={() => handlePurchaseClick(plan)}
                            disabled={purchasing || !canAfford}
                            title={!canAfford ? "Masz za mało punktów" : ""}
                          >
                            {purchasing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Aktywacja...
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Wybieram
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potwierdź aktywację pakietu</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                {selectedPlan && (() => {
                  const price = getPriceValue(selectedPlan, selectedPeriods[selectedPlan.id] || "12")
                  const pointsCost = Math.round(price * POINTS_PER_PLN)
                  const canAfford = lawFirm ? lawFirm.punktySaldo >= pointsCost : false

                  return (
                    <>
                      <div>
                        <div className="font-semibold text-foreground mb-2">
                          Aktywujesz pakiet: {selectedPlan.nazwa}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-muted-foreground">Okres:</span>{" "}
                            <span className="font-medium text-foreground">
                              {getPeriodLabel(selectedPeriods[selectedPlan.id] || "12")}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Koszt:</span>{" "}
                            <span className="font-medium text-primary">
                              {pointsCost} pkt
                            </span>
                          </div>
                          {selectedPlan.punktyGratis > 0 && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Gift className="h-4 w-4" />
                              <span>Otrzymasz {selectedPlan.punktyGratis} punktów gratis!</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>Twoje saldo:</span>
                          <span>{lawFirm?.punktySaldo} pkt</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Koszt pakietu:</span>
                          <span className="text-destructive">-{pointsCost} pkt</span>
                        </div>
                        <hr className="my-1 border-border" />
                        <div className="flex justify-between items-center font-semibold">
                          <span>Pozostanie:</span>
                          <span className={canAfford ? "text-green-600" : "text-destructive"}>
                            {lawFirm ? lawFirm.punktySaldo - pointsCost : 0} pkt
                          </span>
                        </div>
                      </div>

                      {!canAfford && (
                        <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-lg">
                          Nie masz wystarczającej liczby punktów.
                          <Link href="/panel-eksperta/punkty">
                            <Button variant="link" className="px-1 h-auto text-destructive">
                              Doładuj konto.
                            </Button>
                          </Link>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPurchase}
              disabled={purchasing || !!(selectedPlan && lawFirm && lawFirm.punktySaldo < Math.round(getPriceValue(selectedPlan, selectedPeriods[selectedPlan.id] || "12") * POINTS_PER_PLN))}
            >
              {purchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Przetwarzanie...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Aktywuj pakiet
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
