"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShoppingCart
} from "lucide-react"

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount)
}

interface OrderData {
  pakietPunktow: string
  pakietLabel: string
  liczbaPunktow: number
  kwota: number
  metodaPlatnosci: string
}

interface LawFirm {
  id: string
  punktySaldo: number
  nazwa: string
}

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [lawFirm, setLawFirm] = useState<LawFirm | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>("PRZELEWY24")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Pobierz dane zamówienia z sessionStorage
    const pendingOrder = sessionStorage.getItem("pendingOrder")
    if (!pendingOrder) {
      router.push("/panel-kancelarii/punkty")
      return
    }

    try {
      const data = JSON.parse(pendingOrder)
      setOrderData(data)
      setPaymentMethod(data.metodaPlatnosci || "PRZELEWY24")
    } catch (err) {
      console.error("Error parsing order data:", err)
      router.push("/panel-kancelarii/punkty")
      return
    }

    fetchLawFirmData()
  }, [router])

  const fetchLawFirmData = async () => {
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

  const handleSubmitOrder = async () => {
    if (!orderData) return

    setSubmitting(true)
    setError(null)

    try {
      // Utwórz zamówienie
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...orderData,
          metodaPlatnosci: paymentMethod,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nie udało się utworzyć zamówienia")
      }

      const order = await response.json()

      // Jeśli płatność przez Przelewy24, inicjuj transakcję
      if (paymentMethod === "PRZELEWY24") {
        const paymentResponse = await fetch("/api/payments/przelewy24/init", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: order.id,
          }),
        })

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json()
          throw new Error(errorData.error || "Nie udało się zainicjować płatności")
        }

        const paymentData = await paymentResponse.json()

        // Przekieruj do Przelewy24
        if (paymentData.redirectUrl) {
          window.location.href = paymentData.redirectUrl
        } else {
          throw new Error("Brak adresu przekierowania do płatności")
        }
      } else {
        // Dla innych metod płatności przekieruj do potwierdzenia
        sessionStorage.removeItem("pendingOrder")
        router.push(`/panel-kancelarii/checkout/success?orderId=${order.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!orderData) {
    return null
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/panel-kancelarii/punkty")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Podsumowanie zamówienia</h1>
          <p className="text-muted-foreground mt-2">
            Sprawdź szczegóły i dokończ zakup
          </p>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Główna kolumna - Metoda płatności */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metoda płatności */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Metoda płatności
              </CardTitle>
              <CardDescription>
                Wybierz sposób płatności za punkty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="PRZELEWY24" id="przelewy24" />
                    <Label htmlFor="przelewy24" className="flex-1 cursor-pointer">
                      <div className="font-medium">Przelewy24</div>
                      <div className="text-sm text-muted-foreground">
                        Szybka płatność online (przelew, BLIK, karty)
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="PAYU" id="payu" />
                    <Label htmlFor="payu" className="flex-1 cursor-pointer">
                      <div className="font-medium">PayU</div>
                      <div className="text-sm text-muted-foreground">
                        Płatność online przez PayU
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="PRZELEW" id="przelew" />
                    <Label htmlFor="przelew" className="flex-1 cursor-pointer">
                      <div className="font-medium">Przelew tradycyjny</div>
                      <div className="text-sm text-muted-foreground">
                        Punkty zostaną przyznane po zaksięgowaniu przelewu
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Podsumowanie */}
        <div className="space-y-6">
          {/* Aktualny stan punktów */}
          {lawFirm && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Aktualny stan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Punkty:</span>
                  <span className="font-medium">{lawFirm.punktySaldo} pkt</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Podsumowanie zamówienia */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Podsumowanie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pakiet:</span>
                  <span className="font-medium">{orderData.pakietLabel}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Punkty:</span>
                  <span className="font-medium">+{orderData.liczbaPunktow} pkt</span>
                </div>
                {lawFirm && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stan po zakupie:</span>
                    <span className="font-medium text-green-600">
                      {lawFirm.punktySaldo + orderData.liczbaPunktow} pkt
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-semibold">Do zapłaty:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(orderData.kwota)}
                </span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmitOrder}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Przetwarzanie...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Zapłać {formatCurrency(orderData.kwota)}
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Klikając &quot;Zapłać&quot; akceptujesz regulamin i politykę prywatności
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
