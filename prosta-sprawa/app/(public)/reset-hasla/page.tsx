"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) {
      setError("Brak tokenu resetowania. Link może być nieprawidłowy.")
    }
  }, [token])

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) {
      return "Hasło musi mieć co najmniej 8 znaków"
    }
    if (!/[A-Z]/.test(pass)) {
      return "Hasło musi zawierać co najmniej jedną wielką literę"
    }
    if (!/[a-z]/.test(pass)) {
      return "Hasło musi zawierać co najmniej jedną małą literę"
    }
    if (!/[0-9]/.test(pass)) {
      return "Hasło musi zawierać co najmniej jedną cyfrę"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Walidacja
    if (!token) {
      setError("Brak tokenu resetowania")
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        toast.success("Hasło zostało pomyślnie zresetowane")
        // Przekieruj do logowania po 3 sekundach
        setTimeout(() => {
          router.push("/logowanie")
        }, 3000)
      } else {
        setError(data.error || "Wystąpił błąd. Spróbuj ponownie.")
        toast.error(data.error || "Nie udało się zresetować hasła")
      }
    } catch (error) {
      setError("Wystąpił błąd połączenia. Spróbuj ponownie.")
      toast.error("Wystąpił błąd połączenia")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100dvh-65px)] flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Brand */}
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold">ProstaSprawa</h1>
            </Link>
          </div>

          {/* Success Card */}
          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Hasło zostało zmienione!</CardTitle>
              <CardDescription className="text-base">
                Twoje hasło zostało pomyślnie zresetowane. Za chwilę zostaniesz przekierowany do strony logowania.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                className="w-full"
                onClick={() => router.push("/logowanie")}
              >
                Przejdź do logowania
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100dvh-65px)] flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold">ProstaSprawa</h1>
          </Link>
        </div>

        {/* Form Card */}
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Ustaw nowe hasło</CardTitle>
            <CardDescription>
              Wprowadź nowe hasło do swojego konta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive border border-destructive/30">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Nowe hasło</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Wprowadź nowe hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || !token}
                    required
                    className="h-11 pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Wprowadź hasło ponownie"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading || !token}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900 border border-blue-200">
                <p className="font-medium mb-1">Wymagania dotyczące hasła:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Co najmniej 8 znaków</li>
                  <li>Przynajmniej jedna wielka litera</li>
                  <li>Przynajmniej jedna mała litera</li>
                  <li>Przynajmniej jedna cyfra</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading || !token}
              >
                {isLoading ? "Resetowanie..." : "Resetuj hasło"}
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
            Link wygasł?{" "}
            <Link href="/moje-konto/lost-password" className="underline hover:text-primary">
              Wyślij nowy link
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100dvh-65px)] flex items-center justify-center">
        <div className="text-center">Ładowanie...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
