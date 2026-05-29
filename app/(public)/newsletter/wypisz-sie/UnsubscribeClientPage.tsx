"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle2, Mail, XCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

function NewsletterUnsubscribeContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already_unsubscribed">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const statusParam = searchParams.get("status")
    const errorParam = searchParams.get("error")

    if (statusParam === "sukces") {
      setStatus("success")
      setMessage("Twój adres e-mail został pomyślnie wypisany z naszego newslettera. Przykro nam, że odchodzisz.")
    } else if (statusParam === "juz-wypisany") {
      setStatus("already_unsubscribed")
      setMessage("Ten adres e-mail został już wcześniej wypisany z naszego newslettera.")
    } else if (errorParam) {
      setStatus("error")
      switch (errorParam) {
        case "brak-tokenu":
          setMessage("Brak tokenu wypisania w linku.")
          break
        case "nieprawidlowy-token":
          setMessage("Nieprawidłowy lub wygasły token wypisania.")
          break
        case "blad-serwera":
          setMessage("Wystąpił błąd po stronie serwera. Spróbuj ponownie później.")
          break
        default:
          setMessage("Wystąpił nieznany błąd podczas wypisywania z newslettera.")
      }
    } else {
      setStatus("error")
      setMessage("Nieprawidłowy link wypisania.")
    }
  }, [searchParams])

  const renderIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-16 w-16 text-[#1e5e4e]" />
      case "already_unsubscribed":
        return <AlertTriangle className="h-16 w-16 text-yellow-500" />
      case "error":
        return <XCircle className="h-16 w-16 text-red-500" />
      default:
        return <Mail className="h-16 w-16 text-[#1e5e4e] animate-pulse" />
    }
  }

  const renderTitle = () => {
    switch (status) {
      case "success":
        return "Wypisano pomyślnie"
      case "already_unsubscribed":
        return "Jesteś już wypisany"
      case "error":
        return "Błąd wypisywania"
      default:
        return "Przetwarzanie..."
    }
  }

  return (
    <Card className="max-w-md w-full border-neutral-800 bg-[#141414] text-white shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
      
      <CardHeader className="text-center relative z-10 pt-8">
        <div className="flex justify-center mb-4">
          {renderIcon()}
        </div>
        <CardTitle className="text-2xl font-playfair tracking-wide">{renderTitle()}</CardTitle>
        <CardDescription className="text-sm text-neutral-400 mt-2">
          {message}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10 pb-8">
        {(status === "success" || status === "already_unsubscribed") && (
          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white text-sm">Zostałeś usunięty z listy</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Nie będziemy Ci już wysyłać wiadomości marketingowych. Jeśli kiedykolwiek zechcesz wrócić, możesz zapisać się ponownie na naszej stronie głównej.
                </p>
              </div>
            </div>
            <Button asChild className="w-full bg-[#1e5e4e] hover:bg-[#154338] text-white transition-colors" size="lg" id="btn-back-home-success">
              <Link href="/">
                Przejdź do strony głównej
              </Link>
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-4 flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white text-sm">Nie udało się przetworzyć prośby</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Upewnij się, że link z e-maila jest poprawny. Jeśli problem nadal występuje, skontaktuj się z naszym wsparciem.
                </p>
              </div>
            </div>
            <Button asChild className="w-full bg-transparent hover:bg-neutral-900 text-white border border-neutral-800 transition-colors" size="lg" id="btn-back-home-error">
              <Link href="/">
                Spróbuj ponownie na stronie głównej
              </Link>
            </Button>
          </div>
        )}

        {status === "loading" && (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e5e4e] mx-auto"></div>
            <p className="mt-4 text-xs text-neutral-400">Przetwarzanie prośby o wypisanie...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function NewsletterUnsubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#1e5e4e]/5 rounded-full filter blur-[120px] pointer-events-none" />
      
      <Suspense fallback={
        <Card className="max-w-md w-full border-neutral-800 bg-[#141414] text-white shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e5e4e] mx-auto"></div>
          <p className="mt-4 text-xs text-neutral-400">Ładowanie...</p>
        </Card>
      }>
        <NewsletterUnsubscribeContent />
      </Suspense>
    </div>
  )
}
