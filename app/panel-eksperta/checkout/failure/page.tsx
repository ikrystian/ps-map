"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  Home,
  XCircle
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

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
    <div className="max-w-2xl mx-auto space-y-6 relative py-8 px-4">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 relative z-10"
      >
        {/* Status płatności */}
        <Card className="border-rose-500/30 bg-rose-500/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg">
          <CardContent className="pt-10 pb-8 flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-rose-500/10 rounded-full border border-rose-500/20 text-rose-400">
              <XCircle className="h-12 w-12" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold font-playfair tracking-tight mb-2 text-white">Płatność nieudana</h2>
              <p className="text-zinc-400 text-sm font-light max-w-md mx-auto">
                {errorMsg || "Transakcja została anulowana lub wystąpił błąd podczas przetwarzania płatności."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informacje */}
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#d7b56d] mt-0.5 shrink-0" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-white">Co dalej?</p>
                <ul className="list-disc list-inside space-y-1 text-zinc-400 font-light">
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
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 bg-[#20201d]/60 border-[#3e3e38] text-[#f5f4ee] hover:bg-[#363431] hover:text-white rounded-xl transition-all h-11 text-sm font-medium"
            onClick={() => router.push("/panel-eksperta/punkty")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Spróbuj ponownie
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-medium h-11 rounded-xl shadow-lg shadow-[#0da192]/15 hover:shadow-[#0da192]/25 transition-all duration-200 border-t border-white/10"
            onClick={() => router.push("/panel-eksperta")}
          >
            <Home className="h-4 w-4 mr-2" />
            Strona główna
          </Button>
        </div>

        {orderId && (
          <p className="text-xs text-center text-zinc-500 font-light">
            Numer zamówienia: <span className="font-mono">{orderId}</span>
          </p>
        )}
      </motion.div>
    </div>
  )
}

