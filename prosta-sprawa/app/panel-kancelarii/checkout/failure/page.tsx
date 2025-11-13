"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  ArrowLeft,
  Home,
  XCircle
} from "lucide-react"

export default function CheckoutFailurePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const errorMsg = searchParams.get("error")

  useEffect(() => {
    // Wyczyść pending order z sessionStorage
    sessionStorage.removeItem("pendingOrder")
  }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Status płatności */}
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <XCircle className="h-16 w-16 text-destructive" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Płatność nieudana</h2>
              <p className="text-muted-foreground">
                {errorMsg || "Transakcja została anulowana lub wystąpił błąd podczas przetwarzania płatności."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informacje */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">Co dalej?</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Możesz spróbować ponownie dokonać zakupu</li>
                <li>Upewnij się, że masz wystarczające środki na koncie</li>
                <li>Sprawdź czy dane karty są poprawne</li>
                <li>Spróbuj użyć innej metody płatności</li>
              </ul>
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
          <ArrowLeft className="h-4 w-4 mr-2" />
          Spróbuj ponownie
        </Button>
        <Button
          className="flex-1"
          onClick={() => router.push("/panel-kancelarii")}
        >
          <Home className="h-4 w-4 mr-2" />
          Strona główna
        </Button>
      </div>

      {orderId && (
        <p className="text-xs text-center text-muted-foreground">
          Numer zamówienia: {orderId}
        </p>
      )}
    </div>
  )
}
