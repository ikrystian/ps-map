"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import confetti from "canvas-confetti"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  Coins,
  Crown,
  Loader2,
  Package,
  PartyPopper,
  Receipt,
  Sparkle,
  Sparkles,
  XCircle
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount)
}

// Format date
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Animated Counter for Points
const AnimatedCounter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    if (start === end) return

    const duration = 1200 // 1.2 seconds
    const incrementTime = Math.max(Math.floor(duration / end), 12)
    
    const timer = setInterval(() => {
      start += Math.ceil(end / 40) // speed up stepping
      if (start >= end) {
        clearInterval(timer)
        setCount(end)
      } else {
        setCount(start)
      }
    }, incrementTime)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span className="font-extrabold text-6xl md:text-8xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(245,158,11,0.4)]">
      {count}
    </span>
  )
}

interface Order {
  id: string
  pakietPunktow: string
  liczbaPunktow: number
  kwota: number
  metodaPlatnosci: string
  statusPlatnosci: "OCZEKUJE" | "ZAPLACONE" | "ANULOWANE" | "ZWROT"
  createdAt: Date
}

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const type = searchParams.get("type")
  const planName = searchParams.get("planName")

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasCelebrated, setHasCelebrated] = useState(false)

  // Trigger celebration confetti
  const triggerCelebration = () => {
    // Big center burst
    confetti({
      particleCount: 180,
      spread: 90,
      origin: { y: 0.55 },
      colors: ["#FFD700", "#FFA500", "#FF8C00", "#ffffff", "#4ade80", "#60a5fa"],
      disableForReducedMotion: true
    })

    // Fireworks effect for 3.5 seconds
    const duration = 3.5 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 50 }

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 45 * (timeLeft / duration)
      // since particles fall down, animate them from the top/middle
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }))
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }))
    }, 250)
  }

  useEffect(() => {
    // Jeśli to jest pakiet subskrypcyjny (np. type === "package")
    if (type === "package") {
      setLoading(false)
      if (!hasCelebrated) {
        triggerCelebration()
        setHasCelebrated(true)
      }
      return
    }

    // Dla zakupu punktów wymagany jest orderId
    if (!orderId) {
      router.push("/panel-eksperta/punkty")
      return
    }

    // Wyczyść pending order z sessionStorage
    sessionStorage.removeItem("pendingOrder")

    fetchOrder()

    // Poll dla statusu zamówienia co 2.5 sekundy przez 25 sekund
    const pollInterval = setInterval(fetchOrder, 2500)
    const timeout = setTimeout(() => {
      clearInterval(pollInterval)
    }, 25000)

    return () => {
      clearInterval(pollInterval)
      clearTimeout(timeout)
    }
  }, [orderId, type, router])

  // Trigger celebration once order becomes ZAPLACONE
  useEffect(() => {
    if (order && order.statusPlatnosci === "ZAPLACONE" && !hasCelebrated) {
      triggerCelebration()
      setHasCelebrated(true)
    }
  }, [order, hasCelebrated])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (!response.ok) {
        throw new Error("Nie udało się pobrać danych zamówienia")
      }
      let data = await response.json()

      // Jeśli zamówienie jest opłacone przez PayU ale ma status OCZEKUJE, spróbuj zweryfikować
      if (data.statusPlatnosci === "OCZEKUJE" && data.metodaPlatnosci === "PAYU") {
        try {
          const verifyResponse = await fetch("/api/payments/payu/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId })
          })

          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json()
            if (verifyData.status === "COMPLETED") {
              // Odśwież dane zamówienia po weryfikacji
              const refreshedResponse = await fetch(`/api/orders/${orderId}`)
              if (refreshedResponse.ok) {
                data = await refreshedResponse.json()
              }
            }
          }
        } catch (e) {
          console.error("Verification failed:", e)
        }
      }

      setOrder(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setLoading(false)
    }
  }

  // Loading Screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse text-sm">Pobieranie szczegółów transakcji...</p>
      </div>
    )
  }

  // Error Screen
  if (error || (!order && type !== "package")) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
      <Card variant="glass" className="border-error/30 bg-error/5 rounded-2xl">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-error/10 rounded-full">
                  <XCircle className="h-12 w-12 text-error" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Coś poszło nie tak</h2>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    {error || "Nie udało się pobrać informacji o zamówieniu. Spróbuj odświeżyć stronę lub wróć do panelu."}
                  </p>
                </div>
                <Button onClick={() => router.push("/panel-eksperta/punkty")} variant="destructive" className="rounded-xl">
                  Powrót do punktów
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // --- RENDERING SUCCESS CONTENT ---
  const isPackage = type === "package"
  const isPaid = isPackage || (order && order.statusPlatnosci === "ZAPLACONE")
  const isPending = order && order.statusPlatnosci === "OCZEKUJE"

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6 px-4">
      <AnimatePresence mode="wait">
        {isPaid ? (
          // Redesigned Celebration success page
          <motion.div
            key="success-card"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="space-y-6"
          >
            {/* Main Celebration Card */}
            <Card variant="glass" className="overflow-hidden border-primary/20 bg-gradient-to-b from-primary/5 via-transparent to-transparent shadow-xl relative backdrop-blur-sm rounded-2xl">
              {/* Glowing Background Glows */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />

              <CardContent className="pt-10 pb-8 px-6 text-center flex flex-col items-center relative">
                {/* Sparkles on the sides */}
                <div className="absolute top-8 left-8 text-primary/30 animate-bounce">
                  <Sparkle className="h-6 w-6" />
                </div>
                <div className="absolute top-16 right-10 text-amber-500/30 animate-pulse delay-75">
                  <Sparkles className="h-7 w-7" />
                </div>

                {/* Main animated icon wrapper */}
                <motion.div
                  initial={{ rotate: -15, scale: 0.5 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", delay: 0.15, stiffness: 200, damping: 10 }}
                  className="relative mb-6"
                >
                  <div className="p-5 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-full shadow-lg shadow-amber-500/20 text-white relative z-10 border border-white/20">
                    {isPackage ? (
                      <Crown className="h-14 w-14 animate-pulse" />
                    ) : (
                      <Coins className="h-14 w-14 animate-pulse" />
                    )}
                  </div>
                  {/* Decorative rotating ring */}
                  <div className="absolute -inset-2 rounded-full border border-dashed border-amber-500/30 animate-[spin_20s_linear_infinite]" />
                </motion.div>

                {/* Dynamic Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-3xl font-extrabold font-playfair tracking-tight mb-2 flex items-center gap-2 text-foreground"
                >
                  {isPackage ? "Subskrypcja aktywowana!" : "Doładowanie udane!"}
                  <PartyPopper className="h-6 w-6 text-amber-500 animate-bounce" />
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground text-sm max-w-md mb-6"
                >
                  {isPackage
                    ? `Twój pakiet ${planName ? decodeURIComponent(planName) : "subskrypcji"} został pomyślnie aktywowany. Ciesz się pełnym dostępem!`
                    : "Dziękujemy za dokonanie płatności. Twoje konto zostało pomyślnie zasilone nowymi punktami."}
                </motion.p>

                {/* Score celebration count (only for points order) */}
                {!isPackage && order && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
                    className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl py-6 px-10 mb-4 inline-flex flex-col items-center shadow-inner"
                  >
                    <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-500 font-semibold mb-1">
                      Konto zasilone o
                    </span>
                    <div className="flex items-baseline gap-2">
                      <AnimatedCounter value={order.liczbaPunktow} />
                      <span className="font-extrabold text-xl text-amber-500">pkt</span>
                    </div>
                  </motion.div>
                )}

                {/* Score celebration plan name (only for package order) */}
                {isPackage && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
                    className="bg-primary/10 dark:bg-primary/5 border border-primary/20 rounded-2xl py-4 px-10 mb-4 inline-flex flex-col items-center"
                  >
                    <span className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">
                      Aktywny pakiet
                    </span>
                    <span className="font-extrabold text-2xl md:text-3xl text-foreground">
                      {planName ? decodeURIComponent(planName) : "Nowy Pakiet"}
                    </span>
                  </motion.div>
                )}

                {/* Celebratory interactive button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={triggerCelebration}
                    className="text-xs text-amber-600 dark:text-amber-500 hover:text-amber-700 hover:bg-amber-500/10 rounded-full px-4 gap-1.5 transition-all mt-2"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Celebruj ponownie!
                  </Button>
                </motion.div>
              </CardContent>
            </Card>

            {/* sleeks detail card */}
            {!isPackage && order && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card variant="glass" className="border-border/40 rounded-2xl">
                  <CardHeader className="pb-3 pt-5 px-5">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      Metadane transakcji
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5 text-sm px-5 pb-5">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">ID zamówienia:</span>
                      <span className="font-mono text-xs select-all text-foreground bg-muted px-2 py-0.5 rounded">
                        {order.id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Data płatności:</span>
                      <span className="font-medium text-foreground">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Wybrany pakiet:</span>
                      <span className="font-medium text-foreground">{order.pakietPunktow}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Kwota brutto:</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(order.kwota)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-muted-foreground">Metoda płatności:</span>
                      <span className="font-medium text-foreground">{order.metodaPlatnosci}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quick Action Navigation Grid */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <Button
                variant="outline"
                size="lg"
                className="flex-1 hover:bg-muted/80 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => router.push(isPackage ? "/panel-eksperta/pakiet" : "/panel-eksperta/punkty")}
              >
                {isPackage ? (
                  <>
                    <Crown className="h-5 w-5 mr-2 text-primary" />
                    Zarządzaj pakietem
                  </>
                ) : (
                  <>
                    <Coins className="h-5 w-5 mr-2 text-amber-500" />
                    Przejdź do punktów
                  </>
                )}
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => router.push("/panel-eksperta/pakiet")}
              >
                <Package className="h-5 w-5 mr-2" />
                Pakiety
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        ) : isPending ? (
          // Pending/processing payment page
          <motion.div
            key="pending-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="glass" className="border-border/40 rounded-2xl">
              <CardContent className="pt-12 pb-12 text-center flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="p-4 bg-muted rounded-full">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  </div>
                  <div className="absolute -inset-1 rounded-full border border-primary/20 animate-ping" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2">Przetwarzamy płatność...</h2>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  Czekamy na weryfikację transakcji z bramki płatniczej. Strona odświeży się automatycznie po zaksięgowaniu środków.
                </p>

                {order && (
                  <div className="w-full max-w-xs bg-muted/50 rounded-xl p-4 text-xs text-left space-y-2 mb-4 border border-border/40">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID transakcji:</span>
                      <span className="font-mono text-foreground font-semibold">{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kwota do zapłaty:</span>
                      <span className="text-foreground font-semibold">{formatCurrency(order.kwota)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Metoda:</span>
                      <span className="text-foreground font-semibold">{order.metodaPlatnosci}</span>
                    </div>
                  </div>
                )}

                <Button variant="outline" size="sm" onClick={() => router.push("/panel-eksperta/punkty")} className="rounded-xl">
                  Wróc do panelu punktów
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // Failed order page
          <motion.div
            key="failed-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="glass" className="border-error/30 bg-error/5 rounded-2xl">
              <CardContent className="pt-10 pb-10 text-center flex flex-col items-center">
                <div className="p-3 bg-error/10 rounded-full mb-4">
                  <XCircle className="h-12 w-12 text-error" />
                </div>
                <h2 className="text-xl font-bold mb-2">Transakcja nie powiodła się</h2>
                <p className="text-muted-foreground text-sm max-w-xs mb-6">
                  Twoja płatność została odrzucona lub anulowana. Spróbuj dokonać zakupu ponownie.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => router.push("/panel-eksperta/punkty")} className="rounded-xl">
                    Powrót do punktów
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
