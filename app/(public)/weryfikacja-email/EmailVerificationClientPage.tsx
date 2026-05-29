"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Mail, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function EmailVerificationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already-verified">("loading")
  const [message, setMessage] = useState("")
  const [showResendButton, setShowResendButton] = useState(false)

  useEffect(() => {
    const statusParam = searchParams.get("status")
    const errorParam = searchParams.get("error")

    if (statusParam === "sukces") {
      setStatus("success")
      setMessage("Twój adres email został pomyślnie zweryfikowany! Możesz się teraz zalogować.")
    } else if (statusParam === "juz-zweryfikowany") {
      setStatus("already-verified")
      setMessage("Ten adres email został już wcześniej zweryfikowany. Możesz się zalogować.")
    } else if (errorParam) {
      setStatus("error")
      setShowResendButton(true)

      switch (errorParam) {
        case "brak-tokenu":
          setMessage("Brak tokenu weryfikacyjnego w linku.")
          break
        case "nieprawidlowy-token":
          setMessage("Nieprawidłowy token weryfikacyjny. Link może być niepoprawny.")
          break
        case "wygasly-token":
          setMessage("Token weryfikacyjny wygasł. Link jest ważny tylko przez 24 godziny.")
          break
        case "nie-znaleziono-uzytkownika":
          setMessage("Nie znaleziono użytkownika powiązanego z tym tokenem.")
          setShowResendButton(false)
          break
        case "blad-serwera":
          setMessage("Wystąpił błąd serwera podczas weryfikacji emaila. Spróbuj ponownie później.")
          break
        default:
          setMessage("Wystąpił nieznany błąd podczas weryfikacji emaila.")
      }
    } else {
      setStatus("error")
      setMessage("Brak informacji o statusie weryfikacji.")
    }
  }, [searchParams])

  const handleResendEmail = () => {
    router.push("/wyslij-ponownie-weryfikacje")
  }

  const renderIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-16 w-16 text-green-500" />
      case "already-verified":
        return <CheckCircle2 className="h-16 w-16 text-blue-500" />
      case "error":
        return <XCircle className="h-16 w-16 text-red-500" />
      default:
        return <Mail className="h-16 w-16 text-gray-400 animate-pulse" />
    }
  }

  const renderTitle = () => {
    switch (status) {
      case "success":
        return "Email zweryfikowany!"
      case "already-verified":
        return "Email już zweryfikowany"
      case "error":
        return "Weryfikacja nieudana"
      default:
        return "Weryfikacja emaila..."
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {renderIcon()}
          </div>
          <CardTitle className="text-2xl">{renderTitle()}</CardTitle>
          <CardDescription className="text-base mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" && (
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      Weryfikacja zakończona sukcesem
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Twoje konto jest teraz aktywne. Możesz się zalogować i korzystać ze wszystkich funkcji platformy.
                    </p>
                  </div>
                </div>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link href="/logowanie">
                  Przejdź do logowania
                </Link>
              </Button>
            </div>
          )}

          {status === "already-verified" && (
            <div className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Konto już aktywne
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Ten adres email został już wcześniej potwierdzony.
                    </p>
                  </div>
                </div>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link href="/logowanie">
                  Zaloguj się
                </Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">
                      Nie udało się zweryfikować emaila
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {showResendButton && (
                  <Button
                    onClick={handleResendEmail}
                    className="w-full"
                    variant="default"
                    size="lg"
                  >
                    Wyślij link weryfikacyjny ponownie
                  </Button>
                )}
                <Button
                  asChild
                  className="w-full"
                  variant="outline"
                  size="lg"
                >
                  <Link href="/">
                    Powrót do strony głównej
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {status === "loading" && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Weryfikowanie emaila...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
