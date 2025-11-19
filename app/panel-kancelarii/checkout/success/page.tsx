"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Coins,
  Home,
  Loader2,
  Receipt,
  XCircle
} from "lucide-react"

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

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      router.push("/panel-kancelarii/punkty")
      return
    }

    // Wyczyść pending order z sessionStorage
    sessionStorage.removeItem("pendingOrder")

    fetchOrder()

    // Poll dla statusu zamówienia co 3 sekundy przez 30 sekund
    const pollInterval = setInterval(fetchOrder, 3000)
    const timeout = setTimeout(() => {
      clearInterval(pollInterval)
    }, 30000)

    return () => {
      clearInterval(pollInterval)
      clearTimeout(timeout)
    }
  }, [orderId, router])

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

  if (loading && !order) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <XCircle className="h-16 w-16 text-destructive" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Wystąpił błąd</h2>
                <p className="text-muted-foreground">
                  {error || "Nie udało się pobrać informacji o zamówieniu"}
                </p>
              </div>
              <Button onClick={() => router.push("/panel-kancelarii/punkty")}>
                Powrót do punktów
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isPaid = order.statusPlatnosci === "ZAPLACONE"
  const isPending = order.statusPlatnosci === "OCZEKUJE"

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Status płatności */}
      <Card className={isPaid ? "border-green-500" : ""}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {isPaid ? (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <div>
                  <h2 className="text-2xl font-bold mb-2">Płatność zakończona!</h2>
                  <p className="text-muted-foreground">
                    Dziękujemy za zakup. Punkty zostały dodane do Twojego konta.
                  </p>
                </div>
              </>
            ) : isPending ? (
              <>
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <div>
                  <h2 className="text-2xl font-bold mb-2">Przetwarzamy płatność...</h2>
                  <p className="text-muted-foreground">
                    Proszę czekać, to może potrwać kilka chwil.
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-destructive" />
                <div>
                  <h2 className="text-2xl font-bold mb-2">Płatność nieudana</h2>
                  <p className="text-muted-foreground">
                    Status: {order.statusPlatnosci}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Szczegóły zamówienia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Szczegóły zamówienia
          </CardTitle>
          <CardDescription>
            Numer zamówienia: {order.id}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Data:</span>
              <span className="font-medium">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pakiet:</span>
              <span className="font-medium">{order.pakietPunktow}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Punkty:</span>
              <span className="font-medium flex items-center gap-1">
                <Coins className="h-4 w-4 text-primary" />
                +{order.liczbaPunktow} pkt
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Kwota:</span>
              <span className="font-medium">{formatCurrency(order.kwota)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Metoda płatności:</span>
              <span className="font-medium">{order.metodaPlatnosci}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Akcje */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/panel-kancelarii/punkty")}
        >
          <Coins className="h-4 w-4 mr-2" />
          Zobacz punkty
        </Button>
        <Button
          className="flex-1"
          onClick={() => router.push("/panel-kancelarii")}
        >
          <Home className="h-4 w-4 mr-2" />
          Strona główna
        </Button>
      </div>
    </div>
  )
}
