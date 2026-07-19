"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import {
  Check,
  Edit,
  Package,
  Plus,
  Trash2,
  X,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"

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
  powiaty: number
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
  isPrimary: boolean
  kolor: string | null
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
    if (price === 0) return "Darmowy"
    return `${price} pkt`
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
      <AdminHeaderSetter title="Pakiety subskrypcji" subtitle="Zarządzaj pakietami subskrypcji dla ekspertów" />
      <div className="flex items-center justify-between">
        <div />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                      {plan.kolor && (
                        <span
                          className="inline-block h-3.5 w-3.5 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: plan.kolor }}
                        />
                      )}
                      {plan.nazwa}
                    </CardTitle>
                    <CardDescription className="mt-2 flex gap-2">
                      <Badge variant={plan.aktywny ? "default" : "secondary"}>
                        {plan.aktywny ? "Aktywny" : "Nieaktywny"}
                      </Badge>
                      {plan.isPrimary && (
                        <Badge variant="default" className="bg-blue-600">
                          Pakiet podstawowy
                        </Badge>
                      )}
                      {plan.cena12Miesiecy === 0 && (
                        <Badge variant="default" className="bg-green-600">
                          Darmowy
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 md:flex-nowrap flex-wrap">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {/* Ceny */}
                  <div>
                    <h4 className="font-semibold mb-3 text-sm">Cennik</h4>
                    <div className="space-y-2 text-xs md:text-sm">
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
                    <h4 className="font-semibold mb-3 text-sm">Dostęp</h4>
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
                        <span className="text-muted-foreground">Powiaty:</span>
                        <span>{plan.powiaty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Miasta:</span>
                        <span>{plan.miasta}</span>
                      </div>
                    </div>
                  </div>

                  {/* Funkcjonalności */}
                  <div>
                    <h4 className="font-semibold mb-3 text-sm">Funkcjonalności</h4>
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
                    <h4 className="font-semibold mb-3 text-sm">Inne</h4>
                    <div className="space-y-2 text-sm">

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
