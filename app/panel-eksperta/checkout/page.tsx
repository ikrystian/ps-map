"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount)
}

interface OrderData {
  type?: string // "POINTS" or "PACKAGE"
  pakietPunktow?: string
  pakietLabel?: string
  liczbaPunktow?: number
  kwota?: number
  price?: number
  metodaPlatnosci?: string
  // Package specific fields
  planId?: string
  planName?: string
  planType?: string
  period?: number
  periodLabel?: string
  punktyGratis?: number
  features?: {
    dostepDoSpraw?: number | null
    kategorieSpraw?: number | null
    wojewodztwa?: number
    miasta?: number
    priorytetWyszukiwanie?: boolean
    statystykiAnalizy?: boolean
    mozliwoscBloga?: boolean
  }
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
  const [settings, setSettings] = useState<Record<string, string>>({
    enablePaymentTest: "true",
    enablePaymentPrzelewy24: "true",
    enablePaymentPayU: "true",
    enablePaymentPrzelew: "true",
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)

        // Fallback logic for selected payment method
        const pendingOrder = sessionStorage.getItem("pendingOrder")
        let defaultMethod = "PRZELEWY24"
        if (pendingOrder) {
          try {
            const dataObj = JSON.parse(pendingOrder)
            defaultMethod = dataObj.metodaPlatnosci || "PRZELEWY24"
          } catch (e) {
            console.error("Error parsing pendingOrder in settings fallback:", e)
          }
        }

        const isTestEnabled = data.enablePaymentTest !== "false"
        const isP24Enabled = data.enablePaymentPrzelewy24 !== "false"
        const isPayUEnabled = data.enablePaymentPayU !== "false"
        const isPrzelewEnabled = data.enablePaymentPrzelew !== "false"

        const isCurrentMethodEnabled =
          (defaultMethod === "TEST" && isTestEnabled) ||
          (defaultMethod === "PRZELEWY24" && isP24Enabled) ||
          (defaultMethod === "PAYU" && isPayUEnabled) ||
          (defaultMethod === "PRZELEW" && isPrzelewEnabled)

        if (!isCurrentMethodEnabled) {
          if (isP24Enabled) setPaymentMethod("PRZELEWY24")
          else if (isPayUEnabled) setPaymentMethod("PAYU")
          else if (isPrzelewEnabled) setPaymentMethod("PRZELEW")
          else if (isTestEnabled) setPaymentMethod("TEST")
        }
      }
    } catch (error) {
      console.error("Error fetching settings in checkout:", error)
    }
  }

  useEffect(() => {
    // Pobierz dane zamówienia z sessionStorage
    const pendingOrder = sessionStorage.getItem("pendingOrder")
    if (!pendingOrder) {
      router.push("/panel-eksperta/punkty")
      return
    }

    try {
      const data = JSON.parse(pendingOrder)
      setOrderData(data)
      setPaymentMethod(data.metodaPlatnosci || "PRZELEWY24")
    } catch (err) {
      console.error("Error parsing order data:", err)
      router.push("/panel-eksperta/punkty")
      return
    }

    fetchLawFirmData()
    fetchSettings()
  }, [router])

  const fetchLawFirmData = async () => {
    try {
      const response = await fetch("/api/law-firms/me")
      if (!response.ok) {
        throw new Error("Nie udało się pobrać danych eksperta")
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
      const isPackage = orderData.type === "PACKAGE"

      if (isPackage) {
        // Handle package subscription
        const response = await fetch("/api/law-firms/me/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: orderData.planId,
            period: orderData.period,
            metodaPlatnosci: paymentMethod,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Wystąpił błąd")
        }

        const data = await response.json()

        if (paymentMethod === "PAYU" || paymentMethod === "PRZELEWY24") {
          const orderId = data.order.id

          if (paymentMethod === "PAYU") {
            const paymentResponse = await fetch("/api/payments/payu/order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId })
            })

            if (!paymentResponse.ok) {
              const errorData = await paymentResponse.json()
              throw new Error(errorData.error || "Nie udało się zainicjować płatności PayU")
            }

            const paymentData = await paymentResponse.json()
            if (paymentData.redirectUrl) {
              window.location.href = paymentData.redirectUrl
              return
            } else {
              throw new Error("Brak adresu przekierowania do PayU")
            }
          } else if (paymentMethod === "PRZELEWY24") {
            // Existing P24 logic adapted for subscription flow
            const paymentResponse = await fetch("/api/payments/przelewy24/init", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId })
            })

            if (!paymentResponse.ok) {
              const errorData = await paymentResponse.json()
              throw new Error(errorData.error || "Nie udało się zainicjować płatności Przelewy24")
            }

            const paymentData = await paymentResponse.json()
            if (paymentData.redirectUrl) {
              window.location.href = paymentData.redirectUrl
              return
            } else {
              throw new Error("Brak adresu przekierowania do Przelewy24")
            }
          }
        }

        // Dla pakietów (jeśli nie online lub symulacja), przekieruj do strony sukcesu
        sessionStorage.removeItem("pendingOrder")
        router.push(`/panel-eksperta/checkout/success?type=package&planName=${encodeURIComponent(orderData.planName || '')}`)
      } else {
        // Handle points purchase (existing logic)
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

        if (paymentMethod === "PAYU") {
          const paymentResponse = await fetch("/api/payments/payu/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: order.id })
          })

          if (!paymentResponse.ok) {
            const errorData = await paymentResponse.json()
            throw new Error(errorData.error || "Nie udało się zainicjować płatności PayU")
          }

          const paymentData = await paymentResponse.json()
          if (paymentData.redirectUrl) {
            window.location.href = paymentData.redirectUrl
            return
          } else {
            throw new Error("Brak adresu przekierowania do PayU")
          }
        } else if (paymentMethod === "PRZELEWY24") {
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
            return
          } else {
            throw new Error("Brak adresu przekierowania do płatności")
          }
        } else {
          // Dla innych metod płatności przekieruj do potwierdzenia
          sessionStorage.removeItem("pendingOrder")
          router.push(`/panel-eksperta/checkout/success?orderId=${order.id}`)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!orderData) {
    return null
  }

  const isTestEnabled = settings.enablePaymentTest !== "false"
  const isP24Enabled = settings.enablePaymentPrzelewy24 !== "false"
  const isPayUEnabled = settings.enablePaymentPayU !== "false"
  const isPrzelewEnabled = settings.enablePaymentPrzelew !== "false"
  const anyPaymentMethodEnabled = isTestEnabled || isP24Enabled || isPayUEnabled || isPrzelewEnabled

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(orderData.type === "PACKAGE" ? "/panel-eksperta/ustawienia" : "/panel-eksperta/punkty")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="Finalizacja zamówienia"
          subtitle="Dokończ płatność, aby aktywować pakiet lub punkty"
          className="mb-0 flex-1"
        />
      </div>

      <Separator />

      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex items-start gap-3 pt-6 text-destructive">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">Wystąpił błąd</p>
              <p className="text-sm text-muted-foreground">{error}</p>
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
                Wybierz sposób płatności {orderData.type === "PACKAGE" ? "za pakiet" : "za punkty"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {anyPaymentMethodEnabled ? (
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    {isTestEnabled && (
                      <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent border-primary/40 bg-primary/5 dark:bg-primary/10">
                        <RadioGroupItem value="TEST" id="test" />
                        <Label htmlFor="test" className="flex-1 cursor-pointer">
                          <div className="font-medium flex items-center gap-2">
                            Płatność Testowa
                            <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider">
                              Auto-akceptacja
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Natychmiastowe opłacenie i aktywacja zamówienia (symulacja płatności)
                          </div>
                        </Label>
                      </div>
                    )}

                    {isP24Enabled && (
                      <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                        <RadioGroupItem value="PRZELEWY24" id="przelewy24" />
                        <Label htmlFor="przelewy24" className="flex-1 cursor-pointer">
                          <div className="font-medium">Przelewy24</div>
                          <div className="text-sm text-muted-foreground">
                            Szybka płatność online (przelew, BLIK, karty)
                          </div>
                        </Label>
                      </div>
                    )}

                    {isPayUEnabled && (
                      <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                        <RadioGroupItem value="PAYU" id="payu" />
                        <Label htmlFor="payu" className="flex-1 cursor-pointer">
                          <div className="font-medium">PayU</div>
                          <div className="text-sm text-muted-foreground">
                            Płatność online przez PayU
                          </div>
                        </Label>
                      </div>
                    )}

                    {isPrzelewEnabled && (
                      <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                        <RadioGroupItem value="PRZELEW" id="przelew" />
                        <Label htmlFor="przelew" className="flex-1 cursor-pointer">
                          <div className="font-medium">Przelew tradycyjny</div>
                          <div className="text-sm text-muted-foreground">
                            Punkty zostaną przyznane po zaksięgowaniu przelewu
                          </div>
                        </Label>
                      </div>
                    )}
                  </div>
                </RadioGroup>
              ) : (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-destructive">
                  <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium">Brak dostępnych metod płatności</p>
                    <p className="text-sm text-muted-foreground">
                      Wszystkie metody płatności są obecnie wyłączone w systemie. Skontaktuj się ze wsparciem technicznym w celu sfinalizowania zamówienia.
                    </p>
                  </div>
                </div>
              )}
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
                  <span className="text-sm text-muted-foreground">Twój bilans:</span>
                  <span className="font-semibold text-primary">{lawFirm.punktySaldo} pkt</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Podsumowanie płatności */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Podsumowanie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderData.type === "PACKAGE" ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pakiet:</span>
                      <span className="font-semibold">{orderData.planName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Okres:</span>
                      <span className="font-medium">{orderData.periodLabel}</span>
                    </div>
                    {orderData.punktyGratis && orderData.punktyGratis > 0 ? (
                      <div className="flex items-center justify-between text-sm text-green-600 font-medium">
                        <span>Punkty gratis:</span>
                        <span>+{orderData.punktyGratis} pkt</span>
                      </div>
                    ) : null}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Do zapłaty:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(orderData.price || 0)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pakiet:</span>
                      <span className="font-medium">{orderData.pakietLabel}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Punkty:</span>
                      <span className="font-medium">+{orderData.liczbaPunktow} pkt</span>
                    </div>
                    {lawFirm && orderData.liczbaPunktow && (
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
                      {formatCurrency(orderData.kwota || 0)}
                    </span>
                  </div>
                </>
              )}

              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                  />
                  <Label htmlFor="terms" className="text-xs cursor-pointer leading-tight">
                    Akceptuję{" "}
                    <a href="/regulamin" target="_blank" className="underline text-primary">
                      regulamin
                    </a>
                    {" "}i{" "}
                    <a href="/polityka-prywatnosci" target="_blank" className="underline text-primary">
                      politykę prywatności
                    </a>
                    {" "}*
                  </Label>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmitOrder}
                  disabled={submitting || !termsAccepted || !anyPaymentMethodEnabled}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Przetwarzanie...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Zapłać {formatCurrency(orderData.type === "PACKAGE" ? (orderData.price || 0) : (orderData.kwota || 0))}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}