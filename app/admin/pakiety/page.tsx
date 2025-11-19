"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
} from "lucide-react"
import Link from "next/link"

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
  aktywny: boolean
}

export default function AdminSubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/subscription-plans")
      if (!response.ok) throw new Error("Failed to fetch plans")
      const data = await response.json()
      setPlans(data)
    } catch (error) {
      toast.error("Nie udało się pobrać pakietów")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz dezaktywować ten pakiet?")) return

    try {
      const response = await fetch(`/api/subscription-plans/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete plan")

      toast.success("Pakiet został dezaktywowany")

      fetchPlans()
    } catch (error) {
      toast.error("Nie udało się dezaktywować pakietu")
    }
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return "-"
    return `${price} zł`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pakiety subskrypcji</h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj pakietami subskrypcji dla kancelarii
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/pakiety/dodaj">
            <Plus className="mr-2 h-4 w-4" />
            Dodaj pakiet
          </Link>
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Brak pakietów</h3>
            <p className="text-muted-foreground mb-4">
              Dodaj pierwszy pakiet subskrypcji
            </p>
            <Button asChild>
              <Link href="/admin/pakiety/dodaj">
                <Plus className="mr-2 h-4 w-4" />
                Dodaj pakiet
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{plan.nazwa}</CardTitle>
                    <CardDescription className="mt-2">
                      <Badge variant={plan.aktywny ? "default" : "secondary"}>
                        {plan.aktywny ? "Aktywny" : "Nieaktywny"}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/pakiety/${plan.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edytuj
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Dezaktywuj
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Ceny */}
                  <div>
                    <h4 className="font-semibold mb-3">Cennik</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">1 miesiąc:</span>
                        <span>{formatPrice(plan.cena1Miesiac)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">6 miesięcy:</span>
                        <span>{formatPrice(plan.cena6Miesiecy)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">12 miesięcy:</span>
                        <span className="font-semibold">{formatPrice(plan.cena12Miesiecy)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dostęp */}
                  <div>
                    <h4 className="font-semibold mb-3">Dostęp</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sprawy:</span>
                        <span>{plan.dostepDoSpraw ?? "∞"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kategorie:</span>
                        <span>{plan.kategorieSpraw ?? "∞"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Województwa:</span>
                        <span>{plan.wojewodztwa}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Miasta:</span>
                        <span>{plan.miasta}</span>
                      </div>
                    </div>
                  </div>

                  {/* Funkcjonalności */}
                  <div>
                    <h4 className="font-semibold mb-3">Funkcjonalności</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {plan.priorytetWyszukiwanie ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-muted-foreground" />}
                        <span>Priorytet</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {plan.artykutySponsoro ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-muted-foreground" />}
                        <span>Artykuły sponsorowane</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {plan.statystykiAnalizy ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-muted-foreground" />}
                        <span>Statystyki</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {plan.mozliwoscBloga ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-muted-foreground" />}
                        <span>Blog</span>
                      </div>
                    </div>
                  </div>

                  {/* Pozostałe */}
                  <div>
                    <h4 className="font-semibold mb-3">Inne</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Punkty gratis:</span>
                        <span>{plan.punktyGratis}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Opiekun:</span>
                        <span>{plan.osobistyOpiekun}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Oznaczenie:</span>
                        <span>{plan.specjalneOznaczenie || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
