"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import { Mail, ArrowLeft } from "lucide-react"

export default function ResendVerificationPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error("Wprowadź adres email")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error.includes("already verified")) {
          toast.error("Ten adres email jest już zweryfikowany. Możesz się zalogować.")
          setTimeout(() => {
            router.push("/logowanie")
          }, 2000)
        } else {
          toast.error(data.error || "Wystąpił błąd podczas wysyłania emaila")
        }
        return
      }

      setEmailSent(true)
      toast.success("Link weryfikacyjny został wysłany na Twój adres email")
    } catch (error) {
      toast.error("Wystąpił błąd podczas wysyłania emaila")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Wyślij link weryfikacyjny ponownie</CardTitle>
          <CardDescription className="text-base mt-2">
            {emailSent
              ? "Sprawdź swoją skrzynkę pocztową"
              : "Wprowadź swój adres email, aby otrzymać nowy link weryfikacyjny"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adres email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="twoj@email.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  autoFocus
                />
                <p className="text-sm text-muted-foreground">
                  Wprowadź adres email użyty podczas rejestracji
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Wysyłanie..." : "Wyślij link weryfikacyjny"}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ArrowLeft className="h-4 w-4" />
                <Link
                  href="/logowanie"
                  className="hover:text-primary underline"
                >
                  Powrót do logowania
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      Email wysłany!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Jeśli konto z tym adresem istnieje, wysłaliśmy nowy link weryfikacyjny.
                      Sprawdź swoją skrzynkę pocztową (również folder spam).
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => setEmailSent(false)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Wyślij ponownie
                </Button>
                <Button
                  asChild
                  variant="default"
                  className="w-full"
                  size="lg"
                >
                  <Link href="/logowanie">
                    Przejdź do logowania
                  </Link>
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Link weryfikacyjny jest ważny przez 24 godziny
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
