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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Zaloguj się</CardTitle>
          <CardDescription className="text-center">
            Wprowadź swoje dane, aby uzyskać dostęp do konta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="twoj@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/moje-konto/lost-password"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Zapomniałeś hasła?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logowanie..." : "Zaloguj się"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Nie masz konta?{" "}
              <Link href="/rejestracja" className="text-primary hover:underline">
                Zarejestruj się
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
