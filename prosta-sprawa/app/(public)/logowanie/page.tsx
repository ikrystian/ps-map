"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa"
import { AuthLayout } from "@/components/auth"

interface DevUser {
  id: string
  email: string
  role: string
  name: string | null
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const registered = searchParams.get("registered")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [devUsers, setDevUsers] = useState<DevUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")

  // Fetch dev users list
  useEffect(() => {
    const fetchDevUsers = async () => {
      try {
        const response = await fetch("/api/users/dev-list")
        if (response.ok) {
          const data = await response.json()
          setDevUsers(data.users)
        }
      } catch (error) {
        console.error("Error fetching dev users:", error)
      }
    }
    fetchDevUsers()
  }, [])

  useEffect(() => {
    if (registered === "true") {
      toast.success("Rejestracja przebiegła pomyślnie! Możesz teraz się zalogować.")
      // Remove the registered parameter from URL to prevent duplicate toasts
      const url = new URL(window.location.href)
      url.searchParams.delete("registered")
      window.history.replaceState({}, "", url.toString())
    }
  }, [registered])

  // Handle user selection from dropdown
  const handleUserSelect = async (userId: string) => {
    setSelectedUserId(userId)
    const user = devUsers.find((u) => u.id === userId)
    if (user) {
      setEmail(user.email)
      setPassword(user.password)

      // Auto-login after selecting user
      setIsLoading(true)
      setError("")

      try {
        const result = await signIn("credentials", {
          email: user.email,
          password: user.password,
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
  }

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
        // Wyświetl szczegółowy komunikat błędu z NextAuth
        setError(result.error)
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
    <AuthLayout>
      {/* Form Card */}
      <Card className="border-none shadow-none bg-transparent">
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
                <p>{error}</p>
                {error.includes("nie został zweryfikowany") && (
                  <Link
                    href="/auth/resend-verification"
                    className="mt-2 inline-block text-sm underline hover:text-destructive/80"
                  >
                    Wyślij ponownie email weryfikacyjny
                  </Link>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Wybierz użytkownika</Label>
              <Select
                value={selectedUserId}
                onValueChange={handleUserSelect}
                disabled={isLoading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Wybierz użytkownika testowego" />
                </SelectTrigger>
                <SelectContent>
                  {devUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <span>{user.email}</span>
                        <span className="text-xs text-muted-foreground">
                          ({user.role})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {isLoading ? "Logowanie..." : "Zaloguj się (lub wybierz użytkownika powyżej)"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Lub zaloguj się przez
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => signIn("google", { callbackUrl })}
                disabled={isLoading}
              >
                <FaGoogle className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => signIn("facebook", { callbackUrl })}
                disabled={isLoading}
              >
                <FaFacebook className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => signIn("apple", { callbackUrl })}
                disabled={isLoading}
              >
                <FaApple className="h-5 w-5" />
              </Button>
            </div>

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
    </AuthLayout>
  )
}
