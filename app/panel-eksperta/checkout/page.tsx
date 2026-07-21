"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
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
import type { LawFirm } from "@/types"

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
    enablePaymentTpay: "true",
    enablePaymentPrzelew: "true",
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // P24 metody płatności
  interface P24Method {
    id: number
    name: string
    imgUrl: string
    mobileImgUrl: string
    status: boolean
  }
  const [p24Methods, setP24Methods] = useState<P24Method[]>([])
  const [p24MethodsLoading, setP24MethodsLoading] = useState(false)
  const [p24MethodsError, setP24MethodsError] = useState<string | null>(null)
  // null = brak wyboru (przekieruj na stronę wyboru P24), number = wybrany method id
  const [selectedP24Method, setSelectedP24Method] = useState<number | null>(null)

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
        const isTpayEnabled = data.enablePaymentTpay !== "false"
        const isPrzelewEnabled = data.enablePaymentPrzelew !== "false"

        const isCurrentMethodEnabled =
          (defaultMethod === "TEST" && isTestEnabled) ||
          (defaultMethod === "PRZELEWY24" && isP24Enabled) ||
          (defaultMethod === "PAYU" && isPayUEnabled) ||
          (defaultMethod === "TPAY" && isTpayEnabled) ||
          (defaultMethod === "PRZELEW" && isPrzelewEnabled)

        if (!isCurrentMethodEnabled) {
          if (isP24Enabled) setPaymentMethod("PRZELEWY24")
          else if (isTpayEnabled) setPaymentMethod("TPAY")
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

  // Pobierz metody P24 gdy wybrana metoda to PRZELEWY24
  useEffect(() => {
    if (paymentMethod !== "PRZELEWY24") return
    setP24MethodsLoading(true)
    setP24MethodsError(null)
    const amount = orderData?.kwota || orderData?.price
    const url = amount
      ? `/api/payments/przelewy24/methods?lang=pl&amount=${Math.round(amount * 100)}&currency=PLN`
      : `/api/payments/przelewy24/methods?lang=pl`
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setP24Methods(data.data.filter((m: P24Method) => m.status))
        } else {
          setP24MethodsError("Nie udało się pobrać metod płatności")
        }
      })
      .catch(() => setP24MethodsError("Błąd połączenia z bramką płatności"))
      .finally(() => setP24MethodsLoading(false))
  }, [paymentMethod, orderData])

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

        if (paymentMethod === "PAYU" || paymentMethod === "PRZELEWY24" || paymentMethod === "TPAY") {
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
              body: JSON.stringify({
                orderId,
                // Jeśli wybrana konkretna metoda, przekazujemy jej ID
                ...(selectedP24Method !== null && { methodId: selectedP24Method }),
              })
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
          } else if (paymentMethod === "TPAY") {
            const paymentResponse = await fetch("/api/payments/tpay/init", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId })
            })

            if (!paymentResponse.ok) {
              const errorData = await paymentResponse.json()
              throw new Error(errorData.error || "Nie udało się zainicjować płatności Tpay")
            }

            const paymentData = await paymentResponse.json()
            if (paymentData.redirectUrl) {
              window.location.href = paymentData.redirectUrl
              return
            } else {
              throw new Error("Brak adresu przekierowania do Tpay")
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
              // Jeśli wybrana konkretna metoda, przekazujemy jej ID
              ...(selectedP24Method !== null && { methodId: selectedP24Method }),
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
        } else if (paymentMethod === "TPAY") {
          const paymentResponse = await fetch("/api/payments/tpay/init", {
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
            throw new Error(errorData.error || "Nie udało się zainicjować płatności Tpay")
          }

          const paymentData = await paymentResponse.json()

          // Przekieruj do Tpay
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
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Inicjowanie zamówienia...</p>
        </div>
      </div>
    )
  }

  if (!orderData) {
    return null
  }

  const isTestEnabled = settings.enablePaymentTest !== "false"
  const isP24Enabled = settings.enablePaymentPrzelewy24 !== "false"
  const isPayUEnabled = settings.enablePaymentPayU !== "false"
  const isTpayEnabled = settings.enablePaymentTpay !== "false"
  const isPrzelewEnabled = settings.enablePaymentPrzelew !== "false"
  const anyPaymentMethodEnabled = isTestEnabled || isP24Enabled || isPayUEnabled || isTpayEnabled || isPrzelewEnabled

  return (
    <div className="relative space-y-8 min-h-screen overflow-hidden pb-12">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(orderData.type === "PACKAGE" ? "/panel-eksperta/ustawienia" : "/panel-eksperta/punkty")}
            className="bg-zinc-800/60 border-border/60 text-white hover:bg-zinc-700/50 hover:text-white rounded-xl transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            title="Finalizacja zamówienia"
            subtitle="Dokończ płatność, aby aktywować pakiet lub punkty"
            className="mb-0 flex-1"
          />
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10"
        >
          <Card variant="glass" className="border-rose-500/30 bg-rose-500/5 rounded-2xl">
            <CardContent className="flex items-start gap-3 pt-6 text-rose-400">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold text-white">Wystąpił błąd</p>
                <p className="text-xs text-zinc-400 font-light">{error}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid gap-6 lg:grid-cols-3 relative z-10"
      >
        {/* Główna kolumna - Metoda płatności */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metoda płatności */}
          <Card variant="glass" className="rounded-2xl">
            <CardHeader className="border-b border-border/20 py-5 px-6">
              <CardTitle className="text-lg font-playfair text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Metoda płatności
              </CardTitle>
              <CardDescription className="text-zinc-400 text-xs font-light">
                Wybierz sposób płatności {orderData.type === "PACKAGE" ? "za pakiet" : "za punkty"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {anyPaymentMethodEnabled ? (
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    {isTestEnabled && (
                      <div className={`flex items-center space-x-3 border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                        paymentMethod === "TEST"
                          ? "border-primary bg-primary/10"
                          : "border-border/30 bg-zinc-950/20 hover:bg-zinc-900/30"
                      }`}>
                        <RadioGroupItem value="TEST" id="test" className="border-zinc-700 text-primary focus:ring-primary" />
                        <Label htmlFor="test" className="flex-1 cursor-pointer">
                          <div className="font-semibold text-white flex items-center gap-2 text-sm">
                            Płatność Testowa
                            <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-mono font-medium uppercase tracking-wider">
                              Auto-akceptacja
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400 font-light mt-0.5">
                            Natychmiastowe opłacenie i aktywacja zamówienia (symulacja płatności)
                          </div>
                        </Label>
                      </div>
                    )}

                    {isP24Enabled && (
                      <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                        paymentMethod === "PRZELEWY24"
                          ? "border-primary bg-primary/10"
                          : "border-border/30 bg-zinc-950/20 hover:bg-zinc-900/30"
                      }`}>
                        {/* Nagłówek opcji */}
                        <div
                          className="flex items-center space-x-3 p-4 cursor-pointer"
                          onClick={() => setPaymentMethod("PRZELEWY24")}
                        >
                          <RadioGroupItem value="PRZELEWY24" id="przelewy24" className="border-zinc-700 text-primary focus:ring-primary" />
                          <Label htmlFor="przelewy24" className="flex-1 cursor-pointer">
                            <div className="font-semibold text-white text-sm">Przelewy24</div>
                            <div className="text-xs text-zinc-400 font-light mt-0.5">
                              Szybka płatność online (przelew, BLIK, karty)
                            </div>
                          </Label>
                        </div>

                        {/* Siatka metod P24 */}
                        {paymentMethod === "PRZELEWY24" && (
                          <div className="px-4 pb-4 border-t border-border/20 pt-3">
                            {p24MethodsLoading && (
                              <div className="flex items-center gap-2 text-xs text-zinc-400 py-2">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Ładowanie dostępnych metod płatności...
                              </div>
                            )}

                            {p24MethodsError && (
                              <div className="text-xs text-zinc-500 py-2">
                                {p24MethodsError} — po kliknięciu “Zapłać” zostaniesz przekierowany do wyboru metody.
                              </div>
                            )}

                            {!p24MethodsLoading && !p24MethodsError && p24Methods.length > 0 && (
                              <>
                                <p className="text-[11px] text-zinc-500 mb-2.5">
                                  Wybierz metodę płatności (opcjonalnie) — zostaniesz do niej przekierowany od razu.
                                </p>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                                  {/* Kafelek „Brak preferencji‟ — ogólna strona P24 */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedP24Method(null)}
                                    className={`flex flex-col items-center justify-center rounded-lg p-1.5 border text-[10px] font-medium transition-all duration-150 h-14 ${
                                      selectedP24Method === null
                                        ? "border-primary bg-primary/20 text-primary"
                                        : "border-border/30 bg-zinc-900/40 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                                    }`}
                                  >
                                    <CreditCard className="h-4 w-4 mb-0.5" />
                                    Wszystkie
                                  </button>

                                  {p24Methods.map((method) => (
                                    <button
                                      key={method.id}
                                      type="button"
                                      title={method.name}
                                      onClick={() => setSelectedP24Method(method.id)}
                                      className={`relative flex items-center justify-center rounded-lg border transition-all duration-150 h-14 p-1 ${
                                        selectedP24Method === method.id
                                          ? "border-primary bg-primary/20 ring-1 ring-primary/50"
                                          : "border-border/30 bg-zinc-900/40 hover:border-zinc-600"
                                      }`}
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={method.mobileImgUrl || method.imgUrl}
                                        alt={method.name}
                                        className="max-h-8 max-w-full object-contain"
                                        loading="lazy"
                                      />
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {isTpayEnabled && (
                      <div className={`flex items-center space-x-3 border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                        paymentMethod === "TPAY"
                          ? "border-primary bg-primary/10"
                          : "border-border/30 bg-zinc-950/20 hover:bg-zinc-900/30"
                      }`}>
                        <RadioGroupItem value="TPAY" id="tpay" className="border-zinc-700 text-primary focus:ring-primary" />
                        <Label htmlFor="tpay" className="flex-1 cursor-pointer">
                          <div className="font-semibold text-white text-sm">Tpay</div>
                          <div className="text-xs text-zinc-400 font-light mt-0.5">
                            Szybka płatność online przez Tpay
                          </div>
                        </Label>
                      </div>
                    )}

                    {isPayUEnabled && (
                      <div className={`flex items-center space-x-3 border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                        paymentMethod === "PAYU"
                          ? "border-primary bg-primary/10"
                          : "border-border/30 bg-zinc-950/20 hover:bg-zinc-900/30"
                      }`}>
                        <RadioGroupItem value="PAYU" id="payu" className="border-zinc-700 text-primary focus:ring-primary" />
                        <Label htmlFor="payu" className="flex-1 cursor-pointer">
                          <div className="font-semibold text-white text-sm">PayU</div>
                          <div className="text-xs text-zinc-400 font-light mt-0.5">
                            Płatność online przez PayU
                          </div>
                        </Label>
                      </div>
                    )}

                    {isPrzelewEnabled && (
                      <div className={`flex items-center space-x-3 border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                        paymentMethod === "PRZELEW"
                          ? "border-primary bg-primary/10"
                          : "border-border/30 bg-zinc-950/20 hover:bg-zinc-900/30"
                      }`}>
                        <RadioGroupItem value="PRZELEW" id="przelew" className="border-zinc-700 text-primary focus:ring-primary" />
                        <Label htmlFor="przelew" className="flex-1 cursor-pointer">
                          <div className="font-semibold text-white text-sm">Przelew tradycyjny</div>
                          <div className="text-xs text-zinc-400 font-light mt-0.5">
                            Punkty zostaną przyznane po zaksięgowaniu przelewu
                          </div>
                        </Label>
                      </div>
                    )}
                  </div>
                </RadioGroup>
              ) : (
                <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-rose-400">
                  <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-white">Brak dostępnych metod płatności</p>
                    <p className="text-xs text-zinc-400 font-light">
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
            <Card variant="glass" className="rounded-2xl">
              <CardHeader className="pb-3 pt-5 px-6">
                <CardTitle className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Aktualny stan</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400 font-light">Twój bilans:</span>
                  <span className="font-bold text-primary">{lawFirm.punktySaldo} pkt</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Podsumowanie płatności */}
          <Card variant="glass" className="rounded-2xl">
            <CardHeader className="pb-3 pt-5 px-6 border-b border-border/20">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                Podsumowanie
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {orderData.type === "PACKAGE" ? (
                <>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400 font-light">Pakiet:</span>
                      <span className="font-semibold text-white">{orderData.planName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400 font-light">Okres:</span>
                      <span className="font-medium text-zinc-300">{orderData.periodLabel}</span>
                    </div>
                    {orderData.punktyGratis && orderData.punktyGratis > 0 ? (
                      <div className="flex items-center justify-between text-sm text-emerald-400 font-medium">
                        <span>Punkty gratis:</span>
                        <span>+{orderData.punktyGratis} pkt</span>
                      </div>
                    ) : null}
                  </div>

                  <Separator className="bg-border/20" />

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Do zapłaty:</span>
                    <span className="text-2xl font-bold text-primary font-playfair">
                      {formatCurrency(orderData.price || 0)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400 font-light">Pakiet:</span>
                      <span className="font-medium text-white">{orderData.pakietLabel}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400 font-light">Punkty:</span>
                      <span className="font-medium text-white">+{orderData.liczbaPunktow} pkt</span>
                    </div>
                    {lawFirm && orderData.liczbaPunktow && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400 font-light">Stan po zakupie:</span>
                        <span className="font-semibold text-emerald-400">
                          {(lawFirm.punktySaldo || 0) + orderData.liczbaPunktow} pkt
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-border/20" />

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Do zapłaty:</span>
                    <span className="text-2xl font-bold text-primary font-playfair">
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
                    className="border-zinc-700 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="terms" className="text-xs cursor-pointer leading-tight text-zinc-400 font-light">
                    Akceptuję{" "}
                    <a href="/regulamin" target="_blank" className="underline text-primary hover:text-primary-hover transition-colors">
                      regulamin
                    </a>
                    {" "}i{" "}
                    <a href="/polityka-prywatnosci" target="_blank" className="underline text-primary hover:text-primary-hover transition-colors">
                      politykę prywatności
                    </a>
                    {" "}*
                  </Label>
                </div>

                <Button
                  variant="primary"
                  className="w-full font-medium h-11 rounded-xl shadow-lg shadow-primary/15 hover:shadow-primary/25 transition-all duration-200 border-t border-white/10"
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
      </motion.div>
    </div>
  )
}