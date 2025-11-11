"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Package,
  Loader2,
  AlertCircle,
  Zap,
  Crown,
  Star,
  Sparkles,
} from "lucide-react"

interface LawFirm {
  id: string
  nazwa: string
  pakietSubskrypcji: string
  dataPakietuOd: string | null
  dataPakietuDo: string | null
}

const subscriptionPackages = [
  {
    id: "PODSTAWOWY",
    name: "Podstawowy",
    price: "0 zł",
    period: "miesięcznie",
    icon: Package,
    color: "text-muted-foreground",
    features: [
      "Profil kancelarii",
      "Do 5 ofert miesięcznie",
      "Podstawowe statystyki",
      "Odpowiedzi na opinie",
      "Newsletter",
    ],
    limitations: [
      "Brak wyróżnień",
      "Brak pozycjonowania",
      "Ograniczone statystyki",
    ],
  },
  {
    id: "STANDARD",
    name: "Standard",
    price: "99 zł",
    period: "miesięcznie",
    icon: Star,
    color: "text-blue-500",
    popular: true,
    features: [
      "Wszystko z pakietu Podstawowy",
      "Do 25 ofert miesięcznie",
      "Rozszerzone statystyki",
      "Wyróżnienie profilu",
      "10 punktów co miesiąc",
      "Newsletter Premium",
      "Wsparcie priorytetowe",
    ],
    limitations: [],
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: "299 zł",
    period: "miesięcznie",
    icon: Crown,
    color: "text-primary",
    features: [
      "Wszystko z pakietu Standard",
      "Nieograniczona liczba ofert",
      "Pełne statystyki i analizy",
      "TOP pozycja w wynikach",
      "50 punktów co miesiąc",
      "Badge \"Premium Partner\"",
      "Dedykowany opiekun",
      "Wsparcie 24/7",
      "API dostęp",
    ],
    limitations: [],
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "Kontakt",
    period: "indywidualnie",
    icon: Sparkles,
    color: "text-yellow-500",
    features: [
      "Wszystko z pakietu Premium",
      "Dedykowane rozwiązania",
      "Integracje na zamówienie",
      "White-label możliwości",
      "SLA 99.9%",
      "Dedykowany zespół wsparcia",
      "Szkolenia dla zespołu",
      "Własny Account Manager",
    ],
    limitations: [],
  },
]

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function LawFirmPackagePage() {
  const { data: session } = useSession()
  const [lawFirm, setLawFirm] = useState<LawFirm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLawFirm()
  }, [session])

  const fetchLawFirm = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/law-firms/me")
      if (!response.ok) {
        throw new Error("Nie udało się pobrać danych kancelarii")
      }

      const data = await response.json()
      setLawFirm(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setLoading(false)
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
                    {subscriptionPackages.find(p => p.id === lawFirm.pakietSubskrypcji)?.name || lawFirm.pakietSubskrypcji}
                  </h3>
                  {lawFirm.pakietSubskrypcji !== "PODSTAWOWY" && (
                    <Badge variant="default">Aktywny</Badge>
                  )}
                </div>
                {lawFirm.dataPakietuDo && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Ważny do: {formatDate(lawFirm.dataPakietuDo)}
                  </p>
                )}
                {!lawFirm.dataPakietuDo && lawFirm.pakietSubskrypcji === "PODSTAWOWY" && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Bezterminowy
                  </p>
                )}
              </div>
            </div>
            {lawFirm.pakietSubskrypcji === "PODSTAWOWY" && (
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3" />
                Darmowy
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Packages Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {subscriptionPackages.map((pkg) => {
          const Icon = pkg.icon
          const isCurrentPackage = lawFirm.pakietSubskrypcji === pkg.id

          return (
            <Card
              key={pkg.id}
              className={`relative ${
                pkg.popular ? "border-primary shadow-lg" : ""
              } ${isCurrentPackage ? "ring-2 ring-primary" : ""}`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="gap-1">
                    <Star className="h-3 w-3" />
                    Najpopularniejszy
                  </Badge>
                </div>
              )}

              {isCurrentPackage && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="default" className="gap-1 bg-green-500">
                    <CheckCircle2 className="h-3 w-3" />
                    Aktywny
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className={`h-8 w-8 ${pkg.color}`} />
                  <div>
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-bold">{pkg.price}</div>
                  <p className="text-sm text-muted-foreground">{pkg.period}</p>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Features */}
                  <div className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <div className="pt-4">
                    {isCurrentPackage ? (
                      <Button variant="outline" className="w-full" disabled>
                        Twój obecny pakiet
                      </Button>
                    ) : pkg.id === "ENTERPRISE" ? (
                      <Button variant="default" className="w-full">
                        Skontaktuj się
                      </Button>
                    ) : (
                      <Button
                        variant={pkg.popular ? "default" : "outline"}
                        className="w-full"
                      >
                        {lawFirm.pakietSubskrypcji === "PODSTAWOWY" ? "Wybierz" : "Zmień na ten pakiet"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* FAQ or Additional Info */}
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
