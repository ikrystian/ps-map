"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error" | "already_verified">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Brak tokenu weryfikacyjnego. Link jest nieprawidBowy.")
      return
    }

    // WywoBaj API do weryfikacji emaila
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          if (data.alreadyVerified) {
            setStatus("already_verified")
            setMessage(data.message)
          } else {
            setStatus("success")
            setMessage(data.message)
          }
        } else {
          setStatus("error")
          setMessage(data.error || "WystpiB bBd podczas weryfikacji emaila")
        }
      } catch (error) {
        console.error("Verification error:", error)
        setStatus("error")
        setMessage("WystpiB bBd podczas weryfikacji emaila. Spróbuj ponownie pózniej.")
      }
    }

    verifyEmail()
  }, [token])

  const handleGoToLogin = () => {
    router.push("/logowanie")
  }

  const handleResendEmail = () => {
    router.push("/auth/resend-verification")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === "loading" && (
            <>
              <div className="mx-auto mb-4">
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
              </div>
              <CardTitle>Weryfikacja emaila...</CardTitle>
              <CardDescription>
                Prosz czeka, trwa weryfikacja Twojego adresu email
              </CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-green-600">Email zweryfikowany!</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}

          {status === "already_verified" && (
            <>
              <div className="mx-auto mb-4">
                <AlertCircle className="h-16 w-16 text-blue-600" />
              </div>
              <CardTitle className="text-blue-600">Email ju| zweryfikowany</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-4">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
              <CardTitle className="text-red-600">BBd weryfikacji</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {(status === "success" || status === "already_verified") && (
            <Button onClick={handleGoToLogin} className="w-full">
              Przejdz do logowania
            </Button>
          )}

          {status === "error" && (
            <>
              <Button onClick={handleResendEmail} className="w-full">
                Wy[lij ponownie email weryfikacyjny
              </Button>
              <Button onClick={handleGoToLogin} variant="outline" className="w-full">
                Przejdz do logowania
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
