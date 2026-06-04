"use client"

import { AuthLayout } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { Eye, EyeOff } from "lucide-react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa"

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
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [devUsers, setDevUsers] = useState<DevUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [enableUserSelection, setEnableUserSelection] = useState(true)

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

    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const data = await response.json()
          setEnableUserSelection(data.enableUserSelectionOnLogin !== "false")
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      }
    }

    fetchDevUsers()
    fetchSettings()
  }, [])

  useEffect(() => {
    if (registered === "true") {
      toast.success(
        "Rejestracja przebiegła pomyślnie! Sprawdź swoją skrzynkę email i kliknij link weryfikacyjny, aby aktywować konto.",
        { duration: 8000 }
      )
      // Remove the registered parameter from URL to prevent duplicate toasts
      const url = new URL(window.location.href)
      url.searchParams.delete("registered")
      window.history.replaceState({}, "", url.toString())
    }
  }, [registered])

  // Check for OAuth errors (user not registered) or blocked/inactive accounts
  useEffect(() => {
    const oauthError = searchParams.get("error")
    if (oauthError) {
      if (oauthError === "OAuthSignin" || oauthError === "OAuthCallback" || oauthError === "AccessDenied") {
        setError("Nie masz jeszcze konta. Aby korzystać z logowania przez Google lub Facebook, musisz najpierw utworzyć konto używając standardowego formularza rejestracji.")
      } else if (oauthError === "BlockedAccount") {
        setError("Twoje konto zostało zablokowane. Skontaktuj się z administratorem.")
      } else if (oauthError === "InactiveAccount") {
        setError("Twoje konto jest nieaktywne. Skontaktuj się z administratorem.")
      } else {
        return // Don't clean up other unhandled errors
      }

      // Clean up URL
      const url = new URL(window.location.href)
      url.searchParams.delete("error")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams])

  // Handle user selection from dropdown
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
        // 1. Sprawdzenie pre-login
        const checkResponse = await fetch("/api/auth/pre-login-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, password: user.password }),
        })

        if (!checkResponse.ok) {
          const data = await checkResponse.json()
          setError(data.error || "Nieprawidłowy email lub hasło")
          setIsLoading(false)
          return
        }

        // 2. NextAuth Sign In
        const result = await signIn("credentials", {
          email: user.email,
          password: user.password,
          redirect: false,
        })

        if (result?.error) {
          setError("Wystąpił błąd podczas autoryzacji sesji. Spróbuj ponownie.")
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
            router.push("/panel-eksperta")
          } else if (userRole === "ADMIN") {
            router.push("/admin")
          } else {
            router.push(callbackUrl)
          }
        } else {
          router.push(callbackUrl)
        }
      } catch (err) {
        console.error("Login error:", err)
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
      // 1. Sprawdzenie pre-login w celu pobrania dokładnego błędu w języku polskim
      const checkResponse = await fetch("/api/auth/pre-login-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!checkResponse.ok) {
        const data = await checkResponse.json()
        setError(data.error || "Nieprawidłowy email lub hasło")
        setIsLoading(false)
        return
      }

      // 2. NextAuth Sign In
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Wystąpił błąd podczas autoryzacji sesji. Spróbuj ponownie.")
        setIsLoading(false)
        return
      }

      // 3. Pobierz dane użytkownika aby określić rolę
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        const userRole = data.user.role

        // Przekieruj na odpowiedni panel
        if (userRole === "CLIENT") {
          router.push("/panel-klienta")
        } else if (userRole === "LAW_FIRM") {
          router.push("/panel-eksperta")
        } else if (userRole === "ADMIN") {
          router.push("/admin")
        } else {
          router.push(callbackUrl)
        }
      } else {
        router.push(callbackUrl)
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Wystąpił błąd podczas logowania")
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      {/* Form Card */}
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="space-y-1 px-0">
          <CardTitle className="text-2xl font-bold">Witaj</CardTitle>
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
                    href="/wyslij-ponownie-weryfikacje"
                    className="mt-2 inline-block text-sm underline hover:text-destructive/80"
                  >
                    Wyślij ponownie email weryfikacyjny
                  </Link>
                )}
                {error.includes("Nie masz jeszcze konta") && (
                  <Link
                    href="/rejestracja"
                    className="mt-2 inline-block text-sm underline hover:text-destructive/80"
                  >
                    Przejdź do formularza rejestracji
                  </Link>
                )}
              </div>
            )}

            {enableUserSelection ? (
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
            ) : (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Wprowadź adres email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-11"
                />
              </div>
            )}

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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Wprowadź hasło"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Logowanie..." : (enableUserSelection ? "Zaloguj się (lub wybierz użytkownika powyżej)" : "Zaloguj się")}
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
