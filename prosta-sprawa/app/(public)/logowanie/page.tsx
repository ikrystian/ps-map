"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Nieprawidłowy email lub hasło")
        setIsLoading(false)
        return
      }

      // Pobierz dane użytkownika aby określić rolę
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        const userRole = data.user.role

        // Przekieruj na odpowiedni panel
        if (userRole === "CLIENT") {
          router.push("/panel-klienta")
        } else if (userRole === "LAW_FIRM") {
          router.push("/panel-kancelarii")
        } else if (userRole === "ADMIN") {
          router.push("/admin")
        } else {
          router.push(callbackUrl)
        }
      } else {
        router.push(callbackUrl)
      }
    } catch (error) {
      setError("Wystąpił błąd podczas logowania")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Column - Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Brand */}
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold">ProstaSprawa</h1>
            </Link>
          </div>

          {/* Form Card */}
          <Card className="border-none shadow-none">
            <CardHeader className="space-y-1 px-0">
              <CardTitle className="text-2xl font-bold">Witaj ponownie</CardTitle>
              <CardDescription>
                Wprowadź swoje dane, aby zalogować się do konta
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive border border-destructive/30">
                    {error}
                  </div>
                )}

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
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Hasło</Label>
                    <Link
                      href="/moje-konto/lost-password"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Zapomniałeś hasła?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Wprowadź hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className="h-11"
                  />
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? "Logowanie..." : "Zaloguj się"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Nie masz konta?
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => window.location.href = '/rejestracja'}
                >
                  Zarejestruj się
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer Links */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Logując się, akceptujesz nasze{" "}
              <Link href="/regulamin" className="underline hover:text-primary">
                Warunki korzystania
              </Link>{" "}
              i{" "}
              <Link href="/polityka-prywatnosci" className="underline hover:text-primary">
                Politykę prywatności
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Image/Hero */}
      <div className="hidden lg:block relative bg-gradient-to-br from-primary/90 to-primary">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
          <div className="max-w-md space-y-6 text-center">
            <h2 className="text-4xl font-bold">
              Twoja droga do rozwiązania problemów prawnych
            </h2>
            <p className="text-lg text-white/90">
              Połącz się z najlepszymi prawnikami i kancelariami w Polsce.
              Znajdź pomoc prawną dostosowaną do Twoich potrzeb.
            </p>
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div>
                <div className="text-3xl font-bold">2000+</div>
                <div className="text-sm text-white/80">Prawników</div>
              </div>
              <div>
                <div className="text-3xl font-bold">5000+</div>
                <div className="text-sm text-white/80">Spraw</div>
              </div>
              <div>
                <div className="text-3xl font-bold">98%</div>
                <div className="text-sm text-white/80">Zadowolenia</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
