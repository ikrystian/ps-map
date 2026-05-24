"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft, Mail } from "lucide-react"
import { AuthLayout } from "@/components/auth"

export default function LostPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        toast.success("Link do resetowania hasła został wysłany na podany adres email")
      } else {
        toast.error(data.error || "Wystąpił błąd. Spróbuj ponownie.")
      }
    } catch (error) {
      toast.error("Wystąpił błąd połączenia. Spróbuj ponownie.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <AuthLayout
        heroTitle="Odzyskaj dostęp do konta"
        heroDescription="Bezpiecznie zresetuj swoje hasło i wróć do pracy z najlepszymi prawnikami w Polsce."
      >
        {/* Success Card */}
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="space-y-1 px-0 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Sprawdź swoją skrzynkę email</CardTitle>
            <CardDescription className="text-base">
              Jeśli konto z adresem <strong>{email}</strong> istnieje w naszym systemie,
              wysłaliśmy na nie link do resetowania hasła.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 border border-blue-200">
              <p className="font-medium mb-2">💡 Nie otrzymałeś wiadomości?</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Sprawdź folder SPAM</li>
                <li>Upewnij się, że podałeś poprawny adres email</li>
                <li>Poczekaj kilka minut - dostarczenie może potrwać chwilę</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                className="w-full h-11"
                onClick={() => setIsSuccess(false)}
              >
                Wyślij ponownie
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={() => window.location.href = '/logowanie'}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Wróć do logowania
              </Button>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      heroTitle="Odzyskaj dostęp do konta"
      heroDescription="Bezpiecznie zresetuj swoje hasło i wróć do pracy z najlepszymi prawnikami w Polsce."
    >
      {/* Form Card */}
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="space-y-1 px-0">
          <CardTitle className="text-2xl font-bold">Zapomniałeś hasła?</CardTitle>
          <CardDescription>
            Wprowadź swój adres email, a wyślemy Ci link do zresetowania hasła
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adres e-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nazwa@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="h-11"
                autoFocus
              />
            </div>

            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 border border-amber-200">
              <p>
                <strong>Uwaga:</strong> Link do resetowania hasła będzie ważny przez 1 godzinę.
              </p>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Wysyłanie..." : "Wyślij link resetujący"}
            </Button>

            <div className="text-center">
              <Link
                href="/logowanie"
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Wróć do logowania
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Potrzebujesz pomocy?{" "}
          <Link href="/kontakt" className="underline hover:text-primary">
            Skontaktuj się z nami
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
